import type { AgentContext, DidResolutionResult, DidResolver } from '@credo-ts/core'
import type { AgentContext, DidResolutionResult, DidResolver } from '@credo-ts/core'
import { DidDocument } from '@credo-ts/core'
import { Contract, Provider } from 'zksync-ethers'

import CONTRACT_ABI from '../contracts/ZkSyncDidRegistry.abi.json'

// The address of your deployed ZkSyncDidRegistry contract
const CONTRACT_ADDRESS = '0xB175e1F72ec786d6c0c2fc9A5329ADDb95D39b2a'

export class ZkSyncDidResolver implements DidResolver {
  public readonly supportedMethods = ['zksync']

  public async resolve(agentContext: AgentContext, did: string): Promise<DidResolutionResult> {
    const didResolutionMetadata = {}

    try {
      // Connect to the zkSync Sepolia Testnet
      const provider = new Provider('https://sepolia.era.zksync.dev')
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

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

      // For now, we will construct a minimal DID Document.
      // A complete implementation would fetch verification methods and services from the contract attributes.
      const didDocument = new DidDocument({
        id: did,
        controller: `did:zksync:${owner}`,
        // NOTE: The ZkSyncDidRegistrar needs to be updated to store the public key
        // as an attribute on the contract (e.g., 'did/pub/Secp256k1/veriKey/hex').
        // The resolver would then fetch this attribute to construct the verificationMethod.
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
}
