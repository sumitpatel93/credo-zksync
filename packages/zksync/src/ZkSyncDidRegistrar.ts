import type { AgentContext, DidCreateOptions, DidCreateResult, DidDeactivateResult, DidRegistrar, DidUpdateResult } from '@credo-ts/core'
import { DidDocument, DidDocumentRole, DidRecord, DidRepository, Kms, TypedArrayEncoder } from '@credo-ts/core'
import { Wallet } from 'zksync-ethers'

export class ZkSyncDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ['zksync']

  public async create(agentContext: AgentContext, options: DidCreateOptions): Promise<DidCreateResult> {
    try {
      const wallet = Wallet.createRandom()
      const did = `did:zksync:${wallet.address}`

      const didDocument = new DidDocument({
        id: did,
        verificationMethod: [
          {
            id: `${did}#key-1`,
            type: 'EcdsaSecp256k1VerificationKey2019',
            controller: did,
            publicKeyHex: wallet.publicKey,
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
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
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

  public async update(): Promise<DidUpdateResult> {
    return {
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: 'failed',
        reason: 'notImplemented: updating did:zksync not implemented yet',
      },
    }
  }

  public async deactivate(): Promise<DidDeactivateResult> {
    return {
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: 'failed',
        reason: 'notImplemented: deactivating did:zksync not implemented yet',
      },
    }
  }
}
