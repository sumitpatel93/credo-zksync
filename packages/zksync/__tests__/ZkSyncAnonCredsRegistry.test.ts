import { ZkSyncAnonCredsRegistry } from '../src/ZkSyncAnonCredsRegistry'
import { AgentContext } from '@credo-ts/core'
import { AnonCredsSchema } from '@credo-ts/anoncreds'

// Mock ethers for testing
const mockEthers: any = {
  JsonRpcProvider: jest.fn(() => ({
    // Mock provider methods if needed
  })),
  Contract: jest.fn(() => ({
    schemas: jest.fn(),
    credentialDefinitions: jest.fn(),
    revocationRegistryDefinitions: jest.fn(),
    revocationStatusLists: jest.fn(),
    registerSchema: jest.fn(),
    registerCredentialDefinition: jest.fn(),
    registerRevocationRegistryDefinition: jest.fn(),
    registerRevocationStatusList: jest.fn(),
    connect: jest.fn(() => mockEthers.Contract()), // Allow chaining .connect()
  })),
  Wallet: jest.fn(() => ({
    // Mock wallet methods if needed
  })),
  utils: {
    id: jest.fn((value: string) => `mocked_id_${value}`), // Mock id hashing
  },
}

// Mock AgentContext
const mockAgentContext = {} as AgentContext

describe('ZkSyncAnonCredsRegistry', () => {
  let registry: ZkSyncAnonCredsRegistry

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    registry = new ZkSyncAnonCredsRegistry()
  })

  describe('getSchema', () => {
    test('should return a schema if found', async () => {
      const schemaId = 'test-schema-id'
      const mockSchema: AnonCredsSchema = {
        attrNames: ['name', 'age'],
        name: 'test-schema',
        version: '1.0',
        issuerId: 'did:zksync:test-issuer',
      }
      mockEthers.Contract().schemas.mockResolvedValueOnce(JSON.stringify(mockSchema))

      const result = await registry.getSchema(mockAgentContext, schemaId)

      expect(mockEthers.Contract().schemas).toHaveBeenCalledWith(`mocked_id_${schemaId}`)
      expect(result.schema).toEqual(mockSchema)
      expect(result.resolutionMetadata).toEqual({})
    })

    test('should return notFound if schema is not found', async () => {
      const schemaId = 'non-existent-schema-id'
      mockEthers.Contract().schemas.mockResolvedValueOnce(null)

      const result = await registry.getSchema(mockAgentContext, schemaId)

      expect(mockEthers.Contract().schemas).toHaveBeenCalledWith(`mocked_id_${schemaId}`)
      expect(result.schema).toBeUndefined()
      expect(result.resolutionMetadata).toEqual({ error: 'notFound', message: `Schema ${schemaId} not found.` })
    })

    test('should return error if an exception occurs', async () => {
      const schemaId = 'error-schema-id'
      const errorMessage = 'Network error'
      mockEthers.Contract().schemas.mockRejectedValueOnce(new Error(errorMessage))

      const result = await registry.getSchema(mockAgentContext, schemaId)

      expect(mockEthers.Contract().schemas).toHaveBeenCalledWith(`mocked_id_${schemaId}`)
      expect(result.schema).toBeUndefined()
      expect(result.resolutionMetadata).toEqual({ error: 'error', message: `Error retrieving schema ${schemaId}: ${errorMessage}` })
    })
  })

  describe('registerSchema', () => {
    test('should register a schema successfully', async () => {
      const schemaId = 'new-schema-id'
      const mockSchema: AnonCredsSchema = {
        attrNames: ['name', 'age'],
        name: 'new-schema',
        version: '1.0',
        issuerId: 'did:zksync:new-issuer',
      }
      mockEthers.Contract().registerSchema.mockResolvedValueOnce({ wait: jest.fn().mockResolvedValueOnce({}) })

      const result = await registry.registerSchema(mockAgentContext, { schema: mockSchema, options: {} })

      expect(mockEthers.Contract().registerSchema).toHaveBeenCalledWith(`mocked_id_${schemaId}`, JSON.stringify(mockSchema))
      expect(result.schemaState.state).toBe('finished')
      expect(result.schemaState.schema).toEqual(mockSchema)
    })

    test('should return failed state if registration fails', async () => {
      const schemaId = 'fail-schema-id'
      const mockSchema: AnonCredsSchema = {
        attrNames: ['data'],
        name: 'fail-schema',
        version: '1.0',
        issuerId: 'did:zksync:fail-issuer',
      }
      const errorMessage = 'Transaction failed'
      mockEthers.Contract().registerSchema.mockRejectedValueOnce(new Error(errorMessage))

      const result = await registry.registerSchema(mockAgentContext, { schema: mockSchema, options: {} })

      expect(mockEthers.Contract().registerSchema).toHaveBeenCalledWith(`mocked_id_${schemaId}`, JSON.stringify(mockSchema))
      expect(result.schemaState.state).toBe('failed')
      expect((result.schemaState as any).reason).toBe(`Error registering schema ${schemaId}: ${errorMessage}`)
    })
  })
})
