import { AgentContext, ConsoleLogger, LogLevel, DependencyManager } from '@credo-ts/core'
import { Wallet, ContractFactory, Provider } from 'zksync-ethers'

import { ZkSyncAnonCredsRegistry } from '../ZkSyncAnonCredsRegistry'
import { ZkSyncDidRegistrar } from '../ZkSyncDidRegistrar'
import { ZkSyncDidResolver } from '../ZkSyncDidResolver'

const CONTRACT_ABI = require('../../contracts/ZkSyncDidRegistry.abi.json')
const CONTRACT_BYTECODE = require('/Users/apple/Documents/SELF/lfdt-2025/credo-ts/packages/zksync/contracts/packages_zksync_contracts_ZkSyncDidRegistry_sol_ZkSyncDidRegistry.bin')

describe('ZkSyncAnonCredsRegistry', () => {
  jest.setTimeout(60000)
  let registrar: ZkSyncDidRegistrar
  let resolver: ZkSyncDidResolver
  let registry: ZkSyncAnonCredsRegistry
  let wallet: Wallet
  let did: string
  let agentContext: AgentContext

  beforeAll(async () => {
    const privateKey = '0x292047fb31c143df111aaffffbcd2b4be45e3d1c25c06b5949d479475f282a4d'
    wallet = new Wallet(privateKey)
    did = `did:zksync:${wallet.address}`

    const provider = new Provider('https://sepolia.era.zksync.dev')
    const deployerWallet = new Wallet(privateKey, provider)

    const contractFactory = new ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, deployerWallet)
    const deployedContract = await contractFactory.deploy()
    await deployedContract.waitForDeployment()
    const contractAddress = await deployedContract.getAddress()

    registrar = new ZkSyncDidRegistrar(contractAddress)
    resolver = new ZkSyncDidResolver(contractAddress)
    registry = new ZkSyncAnonCredsRegistry()

    const dependencyManager = new DependencyManager()
    agentContext = new AgentContext({
      dependencyManager,
      contextCorrelationId: 'test-context',
    })

    // Mock the wallet property
    Object.defineProperty(agentContext, 'wallet', {
      value: wallet,
      writable: true,
    })
  })

  it('should register and resolve a schema', async () => {
    const schema = {
      name: 'test-schema',
      version: '1.0',
      attrNames: ['name', 'age'],
      issuerId: did,
    }

    const registerResult = await registry.registerSchema(agentContext, { schema, options: {} })
    expect(registerResult.schemaState.state).toBe('finished')

    // The constructed schema ID should be ${issuerId}/schemas/${schema.name}/${schema.version}
    const expectedSchemaId = `${did}/schemas/${schema.name}/${schema.version}`
    const resolveResult = await registry.getSchema(agentContext, expectedSchemaId)
    expect(resolveResult.schema).toEqual(schema)
  })

  it('should register and resolve a credential definition', async () => {
    // First register a schema to use for the credential definition
    const schema = {
      name: 'test-schema',
      version: '1.0',
      attrNames: ['name', 'age'],
      issuerId: did,
    }

    const schemaResult = await registry.registerSchema(agentContext, { schema, options: {} })
    expect(schemaResult.schemaState.state).toBe('finished')
    const schemaId = schemaResult.schemaState.schemaId!
    expect(schemaId).toBeDefined()

    const credentialDefinition = {
      schemaId: schemaId,
      type: 'CL' as const,
      tag: 'default',
      value: {
        primary: {},
      },
      issuerId: did,
    }

    const registerResult = await registry.registerCredentialDefinition(agentContext, { credentialDefinition, options: {} })
    expect(registerResult.credentialDefinitionState.state).toBe('finished')

    // The constructed credential definition ID should be ${issuerId}/cred-defs/${schemaId}/${tag}
    const expectedCredDefId = `${did}/cred-defs/${schemaId}/${credentialDefinition.tag}`
    const resolveResult = await registry.getCredentialDefinition(agentContext, expectedCredDefId)
    expect(resolveResult.credentialDefinition).toEqual(credentialDefinition)
  })

  it('should register and resolve a revocation status list', async () => {
    // First register schema and credential definition
    const schema = {
      name: 'test-schema',
      version: '1.0',
      attrNames: ['name', 'age'],
      issuerId: did,
    }

    const schemaResult = await registry.registerSchema(agentContext, { schema, options: {} })
    expect(schemaResult.schemaState.state).toBe('finished')
    const schemaId = schemaResult.schemaState.schemaId
    expect(schemaId).toBeDefined() // Ensure schemaId is defined

    const credentialDefinition = {
      schemaId: schemaId!,
      type: 'CL' as const,
      tag: 'default',
      value: {
        primary: {},
      },
      issuerId: did,
    }

    const credDefResult = await registry.registerCredentialDefinition(agentContext, { credentialDefinition, options: {} })
    expect(credDefResult.credentialDefinitionState.state).toBe('finished')
    const credDefId = credDefResult.credentialDefinitionState.credentialDefinitionId!
    expect(credDefId).toBeDefined()

    // Register revocation registry definition first
    const revocationRegistryDefinition = {
      issuerId: did,
      revocDefType: 'CL_ACCUM' as const,
      credDefId: credDefId,
      tag: 'default',
      value: {
        publicKeys: {
          accumKey: {
            z: 'mock-z-value',
          },
        },
        maxCredNum: 100,
        tailsLocation: 'mock-tails-location',
        tailsHash: 'mock-tails-hash',
      },
    }

    const revRegDefResult = await registry.registerRevocationRegistryDefinition(agentContext, { 
      revocationRegistryDefinition, 
      options: {} 
    })
    expect(revRegDefResult.revocationRegistryDefinitionState.state).toBe('finished')
    const revRegDefId = revRegDefResult.revocationRegistryDefinitionState.revocationRegistryDefinitionId!
    expect(revRegDefId).toBeDefined()

    // Now register revocation status list
    const revocationStatusList = {
      revRegDefId: revRegDefId,
      issuerId: did,
      revocationList: [0],
      currentAccumulator: 'mock-accumulator',
    }

    const registerResult = await registry.registerRevocationStatusList(agentContext, { revocationStatusList, options: {} })
    expect(registerResult.revocationStatusListState.state).toBe('finished')

    // The returned revocation status list should have timestamp added
    const expectedStatusList = {
      ...revocationStatusList,
      timestamp: expect.any(Number),
    }
    const returnedStatusList = registerResult.revocationStatusListState.revocationStatusList
    expect(returnedStatusList).toBeDefined()
    expect(returnedStatusList).toEqual(expectedStatusList)

    // Get the timestamp from the result
    const timestamp = returnedStatusList!.timestamp

    const resolveResult = await registry.getRevocationStatusList(
      agentContext,
      revRegDefId,
      timestamp
    )
    expect(resolveResult.revocationStatusList).toEqual(expectedStatusList)
  })
})