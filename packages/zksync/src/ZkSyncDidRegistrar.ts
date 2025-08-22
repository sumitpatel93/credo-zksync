import type { AgentContext, DidCreateOptions, DidCreateResult, DidDeactivateResult, DidRegistrar, DidUpdateOptions, DidUpdateResult, DidDeactivateOptions } from '@credo-ts/core'
import { DidDocument, DidDocumentRole, DidRecord, DidRepository, TypedArrayEncoder } from '@credo-ts/core'
import { Contract, Provider, Wallet } from 'zksync-ethers'
import { Buffer } from 'buffer'

import * as CONTRACT_ARTIFACT from '../contracts/ZkSyncDidRegistry.abi.json'

function padToBytes32(value: string): Buffer {
  const buf = Buffer.from(value)
  if (buf.length > 32) {
    throw new Error('Value too long to be padded to 32 bytes')
  }
  const padded = Buffer.alloc(32)
  buf.copy(padded)
  return padded
}

export class ZkSyncDidRegistrar implements DidRegistrar {
  private contractAddress: string;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }
  public readonly supportedMethods = ['zksync']

  public async create(agentContext: AgentContext, options: DidCreateOptions): Promise<DidCreateResult> {
    const didState = {}
    try {
      // Connect to the zkSync Sepolia Testnet
      const provider = new Provider('https://sepolia.era.zksync.dev')

      // A private key is required to sign the transaction to the registry.
      // This should be passed via the `privateKey` property in the `options.secret` object.
      // IMPORTANT: The wallet associated with this private key MUST have funds on zkSync Sepolia Testnet.
      if (!options.secret?.privateKey) {
        throw new Error('A privateKey is required to register a did:zksync DID.')
      }
      const wallet = new Wallet(options.secret.privateKey, provider)

      const did = `did:zksync:${wallet.address}`

      const contract = new Contract(this.contractAddress, CONTRACT_ARTIFACT.abi, wallet)

      // Set the public key as a verification method attribute on the registry
      // This follows the convention for ERC-1056
      const tx = await contract.setAttribute(
        wallet.address,
        TypedArrayEncoder.fromString('did/pub/Secp256k1/veriKey/hex'),
        TypedArrayEncoder.fromString(wallet.signingKey.publicKey)
      )
      await tx.wait()

      const didDocument = new DidDocument({
        id: did,
        verificationMethod: [
          {
            id: `${did}#key-1`,
            type: 'EcdsaSecp256k1VerificationKey2019',
            controller: did,
            publicKeyHex: wallet.signingKey.publicKey,
          },
        ],
        authentication: [`${did}#key-1`],
      })

      const didRecord = new DidRecord({
        did,
        role: DidDocumentRole.Created,
        didDocument,
      })

      const didRepository = agentContext.dependencyManager.resolve(DidRepository)
      await didRepository.save(agentContext, didRecord)

      return {
        didDocumentMetadata: { transaction: tx.hash },
        didRegistrationMetadata: { did: did, contract: this.contractAddress },
        didState: {
          state: 'finished',
          did,
          didDocument,
        },
      }
    } catch (error) {
      return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
          state: 'failed',
          reason: `unknownError: ${error.message}`,
        },
      }
    }
  }

  public async update(agentContext: AgentContext, options: DidUpdateOptions): Promise<DidUpdateResult> {
    try {
      const provider = new Provider('https://sepolia.era.zksync.dev')

      if (!options.secret?.privateKey) {
        throw new Error('A privateKey is required to update a did:zksync DID.')
      }
      const wallet = new Wallet(options.secret.privateKey, provider)

      const contract = new Contract(this.contractAddress, CONTRACT_ARTIFACT.abi, wallet)

      // The new owner is passed in the didDocument.id
      const newOwner = options.didDocument.id.split(':')[2]

      const tx = await contract.changeOwner(wallet.address, newOwner)
      await tx.wait()

      return {
        didDocumentMetadata: { transaction: tx.hash },
        didRegistrationMetadata: { contract: this.contractAddress },
        didState: {
          state: 'finished',
          did: options.did,
          didDocument: options.didDocument,
        },
      }
    } catch (error) {
      return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
          state: 'failed',
          reason: `unknownError: ${error.message}`,
        },
      }
    }
  }

  public async deactivate(agentContext: AgentContext, options: DidDeactivateOptions): Promise<DidDeactivateResult> {
    try {
      const provider = new Provider('https://sepolia.era.zksync.dev')

      if (!options.secret?.privateKey) {
        throw new Error('A privateKey is required to deactivate a did:zksync DID.')
      }
      const wallet = new Wallet(options.secret.privateKey, provider)

      const contract = new Contract(this.contractAddress, CONTRACT_ARTIFACT.abi, wallet)

      // Deactivation is done by changing the owner to the zero address
      const tx = await contract.changeOwner(wallet.address, '0x0000000000000000000000000000000000000000')
      await tx.wait()

      return {
        didDocumentMetadata: { transaction: tx.hash },
        didRegistrationMetadata: { contract: this.contractAddress },
        didState: {
          state: 'finished',
          did: options.did,
        },
      }
    } catch (error) {
      return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
          state: 'failed',
          reason: `unknownError: ${error.message}`,
        },
      }
    }
  }

  public async addDelegate(
    agentContext: AgentContext,
    options: {
      did: string
      delegate: {
        type: string
        address: string
        validTo: number
      }
      secret?: {
        privateKey?: Buffer
      }
    }
  ): Promise<{ transactionHash: string }> {
    try {
      const provider = new Provider('https://sepolia.era.zksync.dev')

      if (!options.secret?.privateKey) {
        throw new Error('A privateKey is required to add a delegate to a did:zksync DID.')
      }
      const wallet = new Wallet(options.secret.privateKey, provider)

      const contract = new Contract(this.contractAddress, CONTRACT_ARTIFACT.abi, wallet)

      const tx = await contract.addDelegate(
        options.did.split(':')[2],
        padToBytes32(options.delegate.type),
        options.delegate.address,
        options.delegate.validTo
      )
      await tx.wait()

      return { transactionHash: tx.hash }
    } catch (error) {
      throw new Error(`Failed to add delegate: ${error.message}`)
    }
  }

  public async revokeDelegate(
    agentContext: AgentContext,
    options: {
      did: string
      delegate: {
        type: string
        address: string
      }
      secret?: {
        privateKey?: Buffer
      }
    }
  ): Promise<{ transactionHash: string }> {
    try {
      const provider = new Provider('https://sepolia.era.zksync.dev')

      if (!options.secret?.privateKey) {
        throw new Error('A privateKey is required to revoke a delegate from a did:zksync DID.')
      }
      const wallet = new Wallet(options.secret.privateKey, provider)

      const contract = new Contract(this.contractAddress, CONTRACT_ARTIFACT.abi, wallet)

      const tx = await contract.revokeDelegate(
        options.did.split(':')[2],
        padToBytes32(options.delegate.type),
        options.delegate.address
      )
      await tx.wait()

      return { transactionHash: tx.hash }
    } catch (error) {
      throw new Error(`Failed to revoke delegate: ${error.message}`)
    }
  }
}