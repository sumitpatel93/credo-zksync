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
import { Contract, ethers } from 'ethers'

// NOTE: This ABI is a placeholder. The actual ABI needs to be generated after compiling the updated smart contract.
const ZkSyncDidRegistryAbi = [
  // Existing DID methods
  "function identityOwner(address identity) view returns (address)",
  "function changeOwner(address identity, address newOwner)",
  "function addDelegate(address identity, bytes32 delegateType, address delegate, uint validTo)",
  "function revokeDelegate(address identity, bytes32 delegateType, address delegate)",
  "function setAttribute(address identity, bytes32 name, bytes calldata value, uint validTo)",
  "function revokeAttribute(address identity, bytes32 name, bytes calldata value)",

  // AnonCreds methods
  "function schemas(bytes32 schemaId) view returns (string)",
  "function credentialDefinitions(bytes32 credentialDefinitionId) view returns (string)",
  "function revocationRegistryDefinitions(bytes32 revocationRegistryDefinitionId) view returns (string)",
  "function revocationStatusLists(bytes32 statusListId) view returns (string)",

  "function registerSchema(bytes32 schemaId, string calldata schema)",
  "function registerCredentialDefinition(bytes32 credentialDefinitionId, string calldata credentialDefinition)",
  "function registerRevocationRegistryDefinition(bytes32 revocationRegistryDefinitionId, string calldata revocationRegistryDefinition)",
  "function registerRevocationStatusList(bytes32 revocationRegistryDefinitionId, uint timestamp, string calldata revocationStatusList)",

  // Events
  "event SchemaRegistered(bytes32 indexed schemaId, string schema)",
  "event CredentialDefinitionRegistered(bytes32 indexed credentialDefinitionId, string credentialDefinition)",
  "event RevocationRegistryDefinitionRegistered(bytes32 indexed revocationRegistryDefinitionId, string revocationRegistryDefinition)",
  "event RevocationStatusListRegistered(bytes32 indexed revocationRegistryDefinitionId, uint timestamp, string revocationStatusList)",
]

// NOTE: This contract address is a placeholder. It needs to be replaced with the actual deployed contract address.
const ZkSyncDidRegistryContractAddress = '0xYourDeployedContractAddressHere'

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

  private async getContractWithSigner(agentContext: AgentContext): Promise<Contract> {
    // In a real application, you would get a signer from the agentContext's wallet or a configured private key.
    // For now, we'll use a placeholder signer.
    const signer = new ethers.Wallet('0xprivateKeyHere', this.provider) // Replace with actual private key or signer
    return this.contract.connect(signer)
  }

  public async getSchema(agentContext: AgentContext, schemaId: string): Promise<GetSchemaReturn> {
    try {
      const schema = await this.contract.schemas(ethers.utils.id(schemaId)) // Using ethers.utils.id for bytes32 hashing
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
      const schemaIdBytes = ethers.utils.id(options.schema.id)
      const tx = await contractWithSigner.registerSchema(schemaIdBytes, JSON.stringify(options.schema))
      await tx.wait()

      return {
        schemaState: {
          state: 'finished',
          schema: options.schema,
          schemaId: options.schema.id,
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

  schema: options.schema,
        reason: `Error registering schema ${options.schema.id}: ${error.message}`,
        },
        registrationMetadata: {},
        schemaMetadata: {},
      }
    }
  }

  public async getCredentialDefinition(agentContext: AgentContext, credentialDefinitionId: string): Promise<GetCredentialDefinitionReturn> {
    try {
      const credentialDefinition = await this.contract.credentialDefinitions(ethers.utils.id(credentialDefinitionId))
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
      const credentialDefinitionIdBytes = ethers.utils.id(options.credentialDefinition.id)
      const tx = await contractWithSigner.registerCredentialDefinition(credentialDefinitionIdBytes, JSON.stringify(options.credentialDefinition))
      await tx.wait()

      return {
        credentialDefinitionState: {
          state: 'finished',
          credentialDefinition: options.credentialDefinition,
          credentialDefinitionId: options.credentialDefinition.id,
        },
        registrationMetadata: { transactionHash: tx.hash },
        credentialDefinitionMetadata: {},
      }
    } catch (error) {
      return {
        credentialDefinitionState: {
          state: 'failed',
          credentialDefinition: options.credentialDefinition,
          reason: `Error registering credential definition ${options.credentialDefinition.id}: ${error.message}`,
        },
        registrationMetadata: {},
        credentialDefinitionMetadata: {},
      }
    }
  }

  public async getRevocationRegistryDefinition(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<GetRevocationRegistryDefinitionReturn> {
    try {
      const revocationRegistryDefinition = await this.contract.revocationRegistryDefinitions(ethers.utils.id(revocationRegistryDefinitionId))
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
    try {
      const contractWithSigner = await this.getContractWithSigner(agentContext)
      const revocationRegistryDefinitionIdBytes = ethers.utils.id(options.revocationRegistryDefinition.id)
      const tx = await contractWithSigner.registerRevocationRegistryDefinition(revocationRegistryDefinitionIdBytes, JSON.stringify(options.revocationRegistryDefinition))
      await tx.wait()

      return {
        revocationRegistryDefinitionState: {
          state: 'finished',
          revocationRegistryDefinition: options.revocationRegistryDefinition,
          revocationRegistryDefinitionId: options.revocationRegistryDefinition.id,
        },
        registrationMetadata: { transactionHash: tx.hash },
        revocationRegistryDefinitionMetadata: {},
      }
    } catch (error) {
      return {
        revocationRegistryDefinitionState: {
          state: 'failed',
          revocationRegistryDefinition: options.revocationRegistryDefinition,
          reason: `Error registering revocation registry definition ${options.revocationRegistryDefinition.id}: ${error.message}`,
        },
        registrationMetadata: {},
        revocationRegistryDefinitionMetadata: {},
      }
    }
  }

  public async getRevocationStatusList(agentContext: AgentContext, revocationRegistryDefinitionId: string, timestamp: number): Promise<GetRevocationStatusListReturn> {
    try {
      const statusListId = ethers.utils.id(revocationRegistryDefinitionId + timestamp.toString())
      const revocationStatusList = await this.contract.revocationStatusLists(statusListId)
      if (!revocationStatusList) {
        return {
          resolutionMetadata: { error: 'notFound', message: `Revocation status list for ${revocationRegistryDefinitionId} at timestamp ${timestamp} not found.` },
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
        resolutionMetadata: { error: 'error', message: `Error retrieving revocation status list for ${revocationRegistryDefinitionId} at timestamp ${timestamp}: ${error.message}` },
        revocationStatusListMetadata: {},
      }
    }
  }

  public async registerRevocationStatusList(agentContext: AgentContext, options: RegisterRevocationStatusListOptions): Promise<RegisterRevocationStatusListReturn> {
    try {
      const contractWithSigner = await this.getContractWithSigner(agentContext)
      const tx = await contractWithSigner.registerRevocationStatusList(
        ethers.utils.id(options.revocationStatusList.revRegDefId),
        options.revocationStatusList.timestamp,
        JSON.stringify(options.revocationStatusList)
      )
      await tx.wait()

      return {
        revocationStatusListState: {
          state: 'finished',
          revocationStatusList: options.revocationStatusList,
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