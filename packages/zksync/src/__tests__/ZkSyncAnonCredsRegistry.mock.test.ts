import { AgentContext, DependencyManager } from '@credo-ts/core'

// Mock the registry for testing purposes
class MockZkSyncAnonCredsRegistry {
  private schemas: Map<string, any> = new Map()
  private credentialDefinitions: Map<string, any> = new Map()
  private revocationStatusLists: Map<string, any> = new Map()

  public readonly methodName = 'zksync'

  public get supportedIdentifier() {
    return /did:zksync:.*/
  }

  async getSchema(agentContext: AgentContext, schemaId: string) {
    const schema = this.schemas.get(schemaId)
    return {
      schema: schema || null,
      schemaId,
      resolutionMetadata: {}
    }
  }

  async registerSchema(agentContext: AgentContext, options: { schema: any; options: any }) {
    const schema = options.schema
    this.schemas.set(schema.id, schema)
    
    return {
      schemaState: {
        state: 'finished' as const,
        schema: schema,
        schemaId: schema.id
      },
      registrationMetadata: {},
      schemaMetadata: {}
    }
  }

  async getCredentialDefinition(agentContext: AgentContext, credentialDefinitionId: string) {
    const credentialDefinition = this.credentialDefinitions.get(credentialDefinitionId)
    return {
      credentialDefinition: credentialDefinition || null,
      credentialDefinitionId,
      resolutionMetadata: {}
    }
  }

  async registerCredentialDefinition(agentContext: AgentContext, options: { credentialDefinition: any; options: any }) {
    const credentialDefinition = options.credentialDefinition
    this.credentialDefinitions.set(credentialDefinition.id, credentialDefinition)
    
    return {
      credentialDefinitionState: {
        state: 'finished' as const,
        credentialDefinition: credentialDefinition,
        credentialDefinitionId: credentialDefinition.id
      },
      registrationMetadata: {},
      credentialDefinitionMetadata: {}
    }
  }

  async getRevocationStatusList(agentContext: AgentContext, revocationRegistryDefinitionId: string, timestamp: number) {
    const key = `${revocationRegistryDefinitionId}-${timestamp}`
    const statusList = this.revocationStatusLists.get(key)
    
    return {
      revocationStatusList: statusList || null,
      revocationRegistryDefinitionId,
      timestamp,
      resolutionMetadata: {}
    }
  }

  async registerRevocationStatusList(agentContext: AgentContext, options: { revocationStatusList: any; options: any }) {
    const statusList = options.revocationStatusList
    const key = `${statusList.revRegDefId}-${statusList.timestamp}`
    this.revocationStatusLists.set(key, statusList)
    
    return {
      revocationStatusListState: {
        state: 'finished' as const,
        revocationStatusList: statusList,
        revocationRegistryDefinitionId: statusList.revRegDefId
      },
      registrationMetadata: {},
      revocationStatusListMetadata: {}
    }
  }
}

describe('ZkSyncAnonCredsRegistry (Mock)', () => {
  let registry: MockZkSyncAnonCredsRegistry
  let agentContext: AgentContext

  beforeAll(() => {
    const dependencyManager = new DependencyManager()
    agentContext = new AgentContext({
      dependencyManager,
      contextCorrelationId: 'test-context',
    })
    
    registry = new MockZkSyncAnonCredsRegistry()
  })

  it('should register and resolve a schema', async () => {
    const schema = {
      id: 'did:zksync:0x1234567890123456789012345678901234567890/schema/test/1.0',
      name: 'test-schema',
      version: '1.0',
      attrNames: ['name', 'age'],
      issuerId: 'did:zksync:0x1234567890123456789012345678901234567890',
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
      value: { primary: {} },
      issuerId: 'did:zksync:0x1234567890123456789012345678901234567890',
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
      issuerId: 'did:zksync:0x1234567890123456789012345678901234567890',
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