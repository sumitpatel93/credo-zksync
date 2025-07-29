import type { AgentContext, DidResolutionResult, DidResolver } from '@credo-ts/core'
import { DidDocument, DidDocumentRole, DidRecord, DidRepository, Kms, TypedArrayEncoder } from '@credo-ts/core'
import { Provider, Contract } from 'zksync-ethers'

// TODO: Replace with your contract's ABI
const CONTRACT_ABI: any[] = []

// TODO: Replace with your contract's deployed address on zksync testnet
const CONTRACT_ADDRESS = ''

export class ZkSyncDidResolver implements DidResolver {
  public readonly supportedMethods = ['zksync']

  public async resolve(agentContext: AgentContext, did: string): Promise<DidResolutionResult> {
    try {
      const provider = new Provider('https://zksync2-testnet.zksync.dev')
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

      // Extract the address from the DID
      const address = did.split(':')[2]

      // TODO: Replace with the actual function name from your smart contract
      const didDocumentJson = await contract.getDidDocument(address)

      const didDocument = DidDocument.fromJson(JSON.parse(didDocumentJson))

      return {
        didDocument,
        didDocumentMetadata: {},
        didResolutionMetadata: {
          contentType: 'application/did+ld+json',
        },
      }
    } catch (error) {
      return {
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: {
          error: 'notFound',
          message: `resolver_error: Unable to resolve did '${did}': ${error.message}`,
        },
      }
    }
  }
}
