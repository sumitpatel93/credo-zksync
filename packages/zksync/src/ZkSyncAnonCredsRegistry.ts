import type { AgentContext } from '@credo-ts/core'
import type {
  AnonCredsRegistry,
  GetCredentialDefinitionReturn,
  GetRevocationRegistryDefinitionReturn,
  GetRevocationStatusListReturn,
  GetSchemaReturn,
  RegisterCredentialDefinitionOptions,
  RegisterCredentialDefinitionReturn,
  RegisterRevocationRegistryDefinitionOptions,
  RegisterRevocationRegistryDefinitionReturn,
  RegisterRevocationStatusListOptions,
  RegisterRevocationStatusListReturn,
  RegisterSchemaOptions,
  RegisterSchemaReturn,
} from '@credo-ts/anoncreds'
import { BaseContract, Contract, ethers } from 'ethers'
import { InjectionSymbols } from '@credo-ts/core'

import * as ZkSyncDidRegistryAbi from '../contracts/ZkSyncDidRegistry.abi.json'

// NOTE: This contract address is a placeholder. It needs to be replaced with the actual deployed contract address.
const ZkSyncDidRegistryContractAddress = '0x2886bb3bef431bCC790dE8ccC25C5B5CB80828bE'

export class ZkSyncAnonCredsRegistry implements AnonCredsRegistry {
  public readonly methodName = 'zksync'

  public get supportedIdentifier() {
    return /did:zksync:.*/
  }

  private contract: Contract
  private provider: ethers.Provider

  constructor() {
    // Initialize provider (e.g., for zkSync testnet)
    this.provider = new ethers.JsonRpcProvider('https://sepolia.era.zksync.dev') // Replace with actual zkSync RPC URL

    // Initialize contract instance
    this.contract = new ethers.Contract(ZkSyncDidRegistryContractAddress, ZkSyncDidRegistryAbi, this.provider)
  }

  private async getContractWithSigner(agentContext: AgentContext): Promise<BaseContract> {
    try {
      // Try to get wallet from dependency manager
      const wallet = agentContext.dependencyManager.resolve<any>('Wallet')
      if (!wallet?.signer) {
        throw new Error('Wallet with signer not found in dependency manager')
      }
      return this.contract.connect(wallet.signer)
    } catch (error) {
      // Fallback: try to get wallet directly from agentContext (for testing)
      const wallet = (agentContext as any).wallet
      if (!wallet?.signer) {
        throw new Error('Wallet with signer not found. Ensure wallet is registered in dependency manager or agentContext.')
      }
      return this.contract.connect(wallet.signer)
    }
  }

  public async getSchema(agentContext: AgentContext, schemaId: string): Promise<GetSchemaReturn> {
    try {
      const schema = await this.contract.schemas(ethers.id(schemaId)) // Using ethers.id for bytes32 hashing
      if (!schema) {
        return {
          schemaId,
          resolutionMetadata: { error: 'notFound' },
          schemaMetadata: {},
        }
      }
      return {
        schemaId,
        schema: JSON.parse(schema),
        resolutionMetadata: {},
        schemaMetadata: {},
      }
    } catch (error) {
      return {
        schemaId,
        resolutionMetadata: { error: 'error', message: `Error retrieving schema ${schemaId}: ${error.message}` },
        schemaMetadata: {},
      }
    }
  }

  public async registerSchema(agentContext: AgentContext, options: RegisterSchemaOptions): Promise<RegisterSchemaReturn> {
    try {
      const contractWithSigner = await this.getContractWithSigner(agentContext)
      // Construct schema ID: ${issuerId}/schemas/${schema.name}/${schema.version}
      const schemaId = `${options.schema.issuerId}/schemas/${options.schema.name}/${options.schema.version}`
      const schemaIdBytes = ethers.id(schemaId)
      const tx = await contractWithSigner.registerSchema(schemaIdBytes, JSON.stringify(options.schema))
      await tx.wait()

      return {
        schemaState: {
          state: 'finished',
          schema: options.schema,
          schemaId,
        },
        registrationMetadata: { transactionHash: tx.hash },
        schemaMetadata: {},
      }
    } catch (error) {
      return {
        schemaState: {
          state: 'failed',
          schema: options.schema,
          reason: error.message,
        },
        registrationMetadata: {},
        schemaMetadata: {},
      }
    }
  }

  

  public async getCredentialDefinition(agentContext: AgentContext, credentialDefinitionId: string): Promise<GetCredentialDefinitionReturn> {
    try {
      const credentialDefinition = await this.contract.credentialDefinitions(ethers.id(credentialDefinitionId))
      if (!credentialDefinition) {
        return {
          credentialDefinitionId,
          resolutionMetadata: { error: 'notFound', message: `Credential definition ${credentialDefinitionId} not found.` },
          credentialDefinitionMetadata: {},
        }
      }
      return {
        credentialDefinitionId,
        credentialDefinition: JSON.parse(credentialDefinition),
        resolutionMetadata: {},
        credentialDefinitionMetadata: {},
      }
    } catch (error) {
      return {
        credentialDefinitionId,
        resolutionMetadata: { error: 'error', message: `Error retrieving credential definition ${credentialDefinitionId}: ${error.message}` },
        credentialDefinitionMetadata: {},
      }
    }
  }

  public async registerCredentialDefinition(agentContext: AgentContext, options: RegisterCredentialDefinitionOptions): Promise<RegisterCredentialDefinitionReturn> {
    try {
      const contractWithSigner = await this.getContractWithSigner(agentContext)
      // Use the provided schemaId directly, assuming it's already properly constructed
      const schemaId = options.credentialDefinition.schemaId
      // Construct credential definition ID: ${issuerId}/cred-defs/${schemaId}/${tag}
      const credentialDefinitionId = `${options.credentialDefinition.issuerId}/cred-defs/${schemaId}/${options.credentialDefinition.tag}`
      const credentialDefinitionIdBytes = ethers.id(credentialDefinitionId)
      const tx = await contractWithSigner.registerCredentialDefinition(credentialDefinitionIdBytes, JSON.stringify(options.credentialDefinition))
      await tx.wait()

      return {
        credentialDefinitionState: {
          state: 'finished',
          credentialDefinition: options.credentialDefinition,
          credentialDefinitionId,
        },
        registrationMetadata: { transactionHash: tx.hash },
        credentialDefinitionMetadata: {},
      }
    } catch (error) {
      return {
        credentialDefinitionState: {
          state: 'failed',
          credentialDefinition: options.credentialDefinition,
          reason: `Error registering credential definition: ${error.message}`,
        },
        registrationMetadata: {},
        credentialDefinitionMetadata: {},
      }
    }
  }

  public async getRevocationRegistryDefinition(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<GetRevocationRegistryDefinitionReturn> {
    try {
      const revocationRegistryDefinition = await this.contract.revocationRegistryDefinitions(ethers.id(revocationRegistryDefinitionId))
      if (!revocationRegistryDefinition) {
        return {
          revocationRegistryDefinitionId,
          resolutionMetadata: { error: 'notFound', message: `Revocation registry definition ${revocationRegistryDefinitionId} not found.` },
          revocationRegistryDefinitionMetadata: {},
        }
      }
      return {
        revocationRegistryDefinitionId,
        revocationRegistryDefinition: JSON.parse(revocationRegistryDefinition),
        resolutionMetadata: {},
        revocationRegistryDefinitionMetadata: {},
      }
    } catch (error) {
      return {
        revocationRegistryDefinitionId,
        resolutionMetadata: { error: 'error', message: `Error retrieving revocation registry definition ${revocationRegistryDefinitionId}: ${error.message}` },
        revocationRegistryDefinitionMetadata: {},
      }
    }
  }

  public async registerRevocationRegistryDefinition(agentContext: AgentContext, options: RegisterRevocationRegistryDefinitionOptions): Promise<RegisterRevocationRegistryDefinitionReturn> {
    let revocationRegistryDefinitionId: string
    try {
      const contractWithSigner = await this.getContractWithSigner(agentContext)
      revocationRegistryDefinitionId = `${options.revocationRegistryDefinition.issuerId}/anoncreds/v0/REV_REG_DEF/${options.revocationRegistryDefinition.credDefId}/${options.revocationRegistryDefinition.tag}`
      const revocationRegistryDefinitionIdBytes = ethers.id(revocationRegistryDefinitionId)
      const tx = await contractWithSigner.registerRevocationRegistryDefinition(revocationRegistryDefinitionIdBytes, JSON.stringify(options.revocationRegistryDefinition))
      await tx.wait()

      return {
        revocationRegistryDefinitionState: {
          state: 'finished',
          revocationRegistryDefinition: options.revocationRegistryDefinition,
          revocationRegistryDefinitionId,
        },
        registrationMetadata: { transactionHash: tx.hash },
        revocationRegistryDefinitionMetadata: {},
      }
    } catch (error) {
      return {
        revocationRegistryDefinitionState: {
          state: 'failed',
          revocationRegistryDefinition: options.revocationRegistryDefinition,
          reason: `Error registering revocation registry definition ${revocationRegistryDefinitionId!}: ${error.message}`,
        },
        registrationMetadata: {},
        revocationRegistryDefinitionMetadata: {},
      }
    }
  }

  public async getRevocationStatusList(agentContext: AgentContext, revocationRegistryDefinitionId: string, timestamp?: number): Promise<GetRevocationStatusListReturn> {
    try {
      // Use current timestamp if not provided
      const effectiveTimestamp = timestamp || Date.now()
      const statusListId = ethers.keccak256(ethers.toUtf8Bytes(revocationRegistryDefinitionId + effectiveTimestamp.toString()))
      const revocationStatusList = await this.contract.revocationStatusLists(statusListId)
      if (!revocationStatusList) {
        return {
          resolutionMetadata: { error: 'notFound', message: `Revocation status list for ${revocationRegistryDefinitionId} at timestamp ${effectiveTimestamp} not found.` },
          revocationStatusListMetadata: {},
        }
      }
      return {
        revocationStatusList: JSON.parse(revocationStatusList),
        resolutionMetadata: {},
        revocationStatusListMetadata: {},
      }
    } catch (error) {
      return {
        resolutionMetadata: { error: 'error', message: `Error retrieving revocation status list for ${revocationRegistryDefinitionId} at timestamp ${timestamp || 'current'}: ${error.message}` },
        revocationStatusListMetadata: {},
      }
    }
  }

  public async registerRevocationStatusList(agentContext: AgentContext, options: RegisterRevocationStatusListOptions): Promise<RegisterRevocationStatusListReturn> {
    try {
      const contractWithSigner = await this.getContractWithSigner(agentContext)
      // Use current timestamp since AnonCredsRevocationStatusListWithoutTimestamp doesn't have timestamp
      const timestamp = Date.now()
      const tx = await contractWithSigner.registerRevocationStatusList(
        ethers.id(options.revocationStatusList.revRegDefId),
        timestamp,
        JSON.stringify(options.revocationStatusList)
      )
      await tx.wait()

      // Add timestamp to create AnonCredsRevocationStatusListWithOptionalTimestamp
      const revocationStatusListWithTimestamp = {
        ...options.revocationStatusList,
        timestamp,
      }

      return {
        revocationStatusListState: {
          state: 'finished',
          revocationStatusList: revocationStatusListWithTimestamp,
        },
        registrationMetadata: { transactionHash: tx.hash },
        revocationStatusListMetadata: {},
      }
    } catch (error) {
      return {
        revocationStatusListState: {
          state: 'failed',
          revocationStatusList: options.revocationStatusList,
          reason: `Error registering revocation status list for ${options.revocationStatusList.revRegDefId}: ${error.message}`,
        },
        registrationMetadata: {},
        revocationStatusListMetadata: {},
      }
    }
  }
}