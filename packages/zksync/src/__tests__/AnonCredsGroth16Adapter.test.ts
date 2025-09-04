import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals'
import { AnonCredsGroth16Adapter } from '../AnonCredsGroth16Adapter'

// Mock fs for testing
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}))

// Mock snarkjs
jest.mock('snarkjs', () => ({
  groth16: {
    fullProve: jest.fn(),
    verify: jest.fn()
  }
}))

const mockedSnarkjs = require('snarkjs') as any
const mockedFs = require('fs').promises as any

describe('AnonCredsGroth16Adapter', () => {
  let adapter: AnonCredsGroth16Adapter

  beforeAll(() => {
    adapter = new AnonCredsGroth16Adapter()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Age Extraction', () => {
    test('should extract age from credential attributes', () => {
      const credential = {
        schema_id: 'test-schema',
        attributes: [
          { name: 'age', value: '25' },
          { name: 'name', value: 'Alice' }
        ]
      } as any

      const age = (adapter as any).extractAge(credential)
      expect(age).toBe(25)
    })

    test('should throw error if age attribute missing', () => {
      const credential = {
        schema_id: 'test-schema',
        attributes: [
          { name: 'name', value: 'Alice' }
        ]
      } as any

      expect(() => (adapter as any).extractAge(credential)).toThrow('Age attribute not found')
    })

    test('should throw error for invalid age values', () => {
      const credential = {
        schema_id: 'test-schema',
        attributes: [
          { name: 'age', value: 'invalid' }
        ]
      } as any

      expect(() => (adapter as any).extractAge(credential)).toThrow('Invalid age value')
    })

    test('should handle edge case ages', () => {
      const credential = {
        schema_id: 'test-schema',
        attributes: [
          { name: 'age', value: '0' }
        ]
      } as any

      const age = (adapter as any).extractAge(credential)
      expect(age).toBe(0)
    })
  })

  describe('Proof Generation', () => {
    test('should generate valid age proof', async () => {
      const mockProof = {
        proof: {
          pi_a: ['0x1', '0x2'],
          pi_b: [['0x3', '0x4'], ['0x5', '0x6']],
          pi_c: ['0x7', '0x8']
        },
        publicSignals: ['1']
      }

      mockedSnarkjs.groth16.fullProve.mockResolvedValue(mockProof)

      const result = await adapter.generateAgeProof(25, 18)
      
      expect(mockedSnarkjs.groth16.fullProve).toHaveBeenCalledWith(
        { age: 25, age_threshold: 18 },
        expect.any(String),
        expect.any(String)
      )
      expect(result).toEqual(mockProof)
    })

    test('should handle proof generation errors', async () => {
      mockedSnarkjs.groth16.fullProve.mockRejectedValue(new Error('Circuit error'))

      await expect(adapter.generateAgeProof(25, 18)).rejects.toThrow('Failed to generate age proof')
    })
  })

  describe('AnonCreds Integration', () => {
    test('should convert AnonCreds credential to proof', async () => {
      const mockProof = {
        proof: {
          pi_a: ['0x1', '0x2'],
          pi_b: [['0x3', '0x4'], ['0x5', '0x6']],
          pi_c: ['0x7', '0x8']
        },
        publicSignals: ['1']
      }

      mockedSnarkjs.groth16.fullProve.mockResolvedValue(mockProof)

      const credential = {
        schema_id: 'test-schema',
        attributes: [
          { name: 'age', value: '30' }
        ]
      } as any

      const result = await adapter.convertFromAnonCreds(credential, 21)

      expect(result).toEqual({
        a: ['0x1', '0x2'],
        b: [['0x3', '0x4'], ['0x5', '0x6']],
        c: ['0x7', '0x8'],
        input: ['1']
      })
    })

    test('should format proof for Solidity contract', () => {
      const mockProof = {
        proof: {
          pi_a: ['0x1', '0x2'],
          pi_b: [['0x3', '0x4'], ['0x5', '0x6']],
          pi_c: ['0x7', '0x8']
        },
        publicSignals: ['1', '2']
      }

      const result = adapter.formatProofForContract(mockProof as any)

      expect(result).toEqual({
        a: ['0x1', '0x2'],
        b: [['0x3', '0x4'], ['0x5', '0x6']],
        c: ['0x7', '0x8'],
        input: ['1', '2']
      })
    })
  })

  describe('Test Credential Creation', () => {
    test('should create test credential with specified age', () => {
      const credential = AnonCredsGroth16Adapter.createTestCredential(25)

      expect(credential.schema_id).toBe('test-schema-id')
      expect(credential.attributes[0].value).toBe('25')
      expect(credential.attributes[0].name).toBe('age')
    })

    test('should create test credential with zero age', () => {
      const credential = AnonCredsGroth16Adapter.createTestCredential(0)

      expect(credential.attributes[0].value).toBe('0')
    })
  })

  describe('Local Verification', () => {
    test('should verify proof locally', async () => {
      const mockProof = {
        proof: {
          pi_a: ['0x1', '0x2'],
          pi_b: [['0x3', '0x4'], ['0x5', '0x6']],
          pi_c: ['0x7', '0x8']
        },
        publicSignals: ['1']
      }

      mockedFs.readFile.mockResolvedValue(JSON.stringify({ key: 'value' }))
      mockedSnarkjs.groth16.verify.mockResolvedValue(true)

      const result = await adapter.verifyLocal(mockProof as any, 18)

      expect(result).toBe(true)
      expect(mockedSnarkjs.groth16.verify).toHaveBeenCalled()
    })

    test('should handle verification errors', async () => {
      const mockProof = {
        proof: {
          pi_a: ['0x1', '0x2'],
          pi_b: [['0x3', '0x4'], ['0x5', '0x6']],
          pi_c: ['0x7', '0x8']
        },
        publicSignals: ['1']
      }

      mockedFs.readFile.mockRejectedValue(new Error('File not found'))

      await expect(adapter.verifyLocal(mockProof as any, 18)).rejects.toThrow('Failed to verify proof locally')
    })
  })
})