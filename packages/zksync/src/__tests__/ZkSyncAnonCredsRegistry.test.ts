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
      id: 'did:zksync:0x1234567890123456789012345678901234567890/schema/test/1.0',
      name: 'test-schema',
      version: '1.0',
      attrNames: ['name', 'age'],
      issuerId: did,
    }

    const registerResult = await registry.registerSchema(agentContext, { schema, options: {} })
    expect(registerResult.schemaState.state).toBe('finished')

    const resolveResult = await registry.getSchema(agentContext, schema.id)
    expect(resolveResult.schema).toEqual(schema)
  })

  it('should register and resolve a credential definition', async () => {
    const credentialDefinition = {
      id: 'did:zksync:0x1234567890123456789012345678901234567890/credDef/test/1.0',
      schemaId: 'did:zksync:0x1234567890123456789012345678901234567890/schema/test/1.0',
      type: 'CL' as const,
      tag: 'default',
      value: {
        primary: {},
      },
      issuerId: did,
    }

    const registerResult = await registry.registerCredentialDefinition(agentContext, { credentialDefinition, options: {} })
    expect(registerResult.credentialDefinitionState.state).toBe('finished')

    const resolveResult = await registry.getCredentialDefinition(agentContext, credentialDefinition.id)
    expect(resolveResult.credentialDefinition).toEqual(credentialDefinition)
  })

  it('should register and resolve a revocation status list', async () => {
    const revocationStatusList = {
      revRegDefId: 'did:zksync:0x1234567890123456789012345678901234567890/revRegDef/test/1.0',
      timestamp: Math.floor(Date.now() / 1000),
      value: {},
      issuerId: did,
      revocationList: [0],
      currentAccumulator: 'mock-accumulator',
    }

    const registerResult = await registry.registerRevocationStatusList(agentContext, { revocationStatusList, options: {} })
    expect(registerResult.revocationStatusListState.state).toBe('finished')

    const resolveResult = await registry.getRevocationStatusList(
      agentContext,
      revocationStatusList.revRegDefId,
      revocationStatusList.timestamp
    )
    expect(resolveResult.revocationStatusList).toEqual(revocationStatusList)
  })
})