import { AgentContext, DidDocumentRole, DidRepository, ConsoleLogger, LogLevel } from '@credo-ts/core'
import { Wallet, ContractFactory, Provider } from 'zksync-ethers'

import { ZkSyncDidRegistrar, ZkSyncDidResolver } from '../'

const CONTRACT_ABI = require('../contracts/ZkSyncDidRegistry.abi.json').abi;
const CONTRACT_BYTECODE = require('../contracts/ZkSyncDidRegistry.abi.json').bytecode;

describe('ZkSyncDidDelegation', () => {
  jest.setTimeout(60000);
  let registrar: ZkSyncDidRegistrar
  let resolver: ZkSyncDidResolver
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
    console.log(`Contract Address: ${contractAddress}`)
    console.log(`Contract Deployment Tx Hash: ${(await deployedContract.deploymentTransaction()).hash}`)

    registrar = new ZkSyncDidRegistrar(contractAddress)
    resolver = new ZkSyncDidResolver(contractAddress)

    // Mock AgentContext
    agentContext = new AgentContext({
      config: {
        label: 'test-agent',
        logger: new ConsoleLogger(LogLevel.off),
      },
      dependencyManager: {
        resolve: (symbol: any) => {
          if (symbol === DidRepository) {
            // Mock DidRepository if needed, or return a dummy object
            return {
              save: jest.fn(),
            }
          }
          return undefined
        },
      } as any,
    })

    // Create the DID on the ZkSync network
    const createResult = await registrar.create(agentContext, {
      method: 'zksync',
      secret: {
        privateKey: wallet.privateKey,
      },
    })
    console.log(`DID Creation Tx Hash: ${createResult.didDocumentMetadata.transaction}`)
  })

  it('should add and resolve a delegate', async () => {
    const delegateOptions = {
      did,
      delegate: {
        type: 'veriKey',
        address: '0x1234567890123456789012345678901234567890',
        validTo: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      },
      secret: {
        privateKey: wallet.privateKey,
      },
    }

    const addDelegateResult = await registrar.addDelegate(agentContext, delegateOptions)
    console.log(`Add Delegate Tx Hash: ${addDelegateResult.transactionHash}`)
    console.log(`Add Delegate Tx Hash: ${addDelegateResult.transactionHash}`)

    const resolvedDelegate = await resolver.resolveDelegate(agentContext, did, 'veriKey')
    expect(resolvedDelegate).toBe(delegateOptions.delegate.address)
  })

  it('should revoke a delegate', async () => {
    const delegateOptions = {
      did,
      delegate: {
        type: 'veriKey',
        address: '0x1234567890123456789012345678901234567890',
      },
      secret: {
        privateKey: wallet.privateKey,
      },
    }

    const revokeDelegateResult = await registrar.revokeDelegate(agentContext, delegateOptions)
    console.log(`Revoke Delegate Tx Hash: ${revokeDelegateResult.transactionHash}`)

    const resolvedDelegate = await resolver.resolveDelegate(agentContext, did, 'veriKey')
    expect(resolvedDelegate).toBeNull()
  })
})