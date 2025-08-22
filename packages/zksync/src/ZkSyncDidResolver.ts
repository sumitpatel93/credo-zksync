import type { AgentContext, DidResolutionResult, DidResolver } from '@credo-ts/core'
import type { AgentContext, DidResolutionResult, DidResolver } from '@credo-ts/core'
import { DidDocument, TypedArrayEncoder, Buffer } from '@credo-ts/core'
import { Contract, Provider } from 'zksync-ethers'

import CONTRACT_ARTIFACT from '../contracts/ZkSyncDidRegistry.abi.json'

function padToBytes32(value: string): Buffer {
  const buf = Buffer.from(value)
  if (buf.length > 32) {
    throw new Error('Value too long to be padded to 32 bytes')
  }
  const padded = Buffer.alloc(32)
  buf.copy(padded)
  return padded
}

export class ZkSyncDidResolver implements DidResolver {
  private contractAddress: string;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }
  public readonly allowsCaching = false;
  public readonly supportedMethods = ['zksync']

  public async resolve(agentContext: AgentContext, did: string): Promise<DidResolutionResult> {
    const didResolutionMetadata = {}

    try {
      // Connect to the zkSync Sepolia Testnet
      const provider = new Provider('https://sepolia.era.zksync.dev')
      const contract = new Contract(this.contractAddress, CONTRACT_ARTIFACT.abi, provider)

      const identity = did.split(':')[2]

      // Get the owner of the DID from the registry
      const owner = await contract.identityOwner(identity)

      // If the owner is the zero address, the DID has not been claimed or has been deactivated.
      if (owner === '0x0000000000000000000000000000000000000000') {
        return {
          didDocument: null,
          didDocumentMetadata: {},
          didResolutionMetadata: {
            ...didResolutionMetadata,
            error: 'notFound',
            message: `DID ${did} not found. It has not been created on the registry.`,
          },
        }
      }

      // Fetch the public key attribute from the registry
      const publicKeyHex = await contract.attributes(
        identity,
        TypedArrayEncoder.fromString('did/pub/Secp256k1/veriKey/hex')
      )

      const didDocument = new DidDocument({
        id: did,
        controller: `did:zksync:${owner}`,
        verificationMethod: [
          {
            id: `${did}#key-1`,
            type: 'EcdsaSecp256k1VerificationKey2019',
            controller: did,
            publicKeyHex: TypedArrayEncoder.toString(publicKeyHex),
          },
        ],
        authentication: [`${did}#key-1`],
      })

      return {
        didDocument,
        didDocumentMetadata: {},
        didResolutionMetadata: {
          ...didResolutionMetadata,
          contentType: 'application/did+ld+json',
        },
      }
    } catch (error) {
      return {
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: {
          ...didResolutionMetadata,
          error: 'notFound',
          message: `resolver_error: Unable to resolve did '${did}': ${error.message}`,
        },
      }
    }
  }

  public async resolveDelegate(agentContext: AgentContext, did: string, type: string): Promise<string | null> {
    try {
      const provider = new Provider('https://sepolia.era.zksync.dev')
      const contract = new Contract(this.contractAddress, CONTRACT_ARTIFACT.abi, provider)

      const identity = did.split(':')[2]

      const delegate = await contract.delegates(identity, padToBytes32(type))

      return delegate === '0x0000000000000000000000000000000000000000' ? null : delegate
    } catch (error) {
      return null
    }
  }
}
