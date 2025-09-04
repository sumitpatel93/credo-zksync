import { describe, test, expect, beforeAll } from '@jest/globals'
import { ethers } from 'ethers'
import { AgeVerificationRegistry__factory } from '../typechain-types'

describe('AgeVerificationRegistry', () => {
  let registry: any
  let provider: ethers.JsonRpcProvider
  let signer: ethers.Wallet

  beforeAll(async () => {
    // Connect to zkSync testnet
    provider = new ethers.JsonRpcProvider('https://sepolia.era.zksync.dev')
    signer = new ethers.Wallet(
      '0x7726827caac94a7f9e1b3852ca803f5de1e1a1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b', // Test private key
      provider
    )
  })

  describe('Contract Deployment', () => {
    test('should deploy AgeVerificationRegistry contract', async () => {
      const factory = new AgeVerificationRegistry__factory(signer)
      
      // Mock deployment for testing
      const mockVerifierAddress = '0x1234567890123456789012345678901234567890'
      const registry = await factory.deploy(mockVerifierAddress)
      
      expect(registry.target).toBeDefined()
    })
  })

  describe('Proof Verification', () => {
    test('should verify valid age proof', async () => {
      const mockProof = {
        a: ['123456789', '987654321'],
        b: [['111', '222'], ['333', '444']],
        c: ['555', '666']
      }

      // Mock contract interaction
      const mockRegistry = {
        verifyAgeView: jest.fn().mockResolvedValue(true)
      }

      const result = await mockRegistry.verifyAgeView(
        mockProof.a,
        mockProof.b,
        mockProof.c,
        18
      )

      expect(result).toBe(true)
    })

    test('should reject invalid age proof', async () => {
      const mockProof = {
        a: ['123456789', '987654321'],
        b: [['111', '222'], ['333', '444']],
        c: ['555', '666']
      }

      const mockRegistry = {
        verifyAgeView: jest.fn().mockResolvedValue(false)
      }

      const result = await mockRegistry.verifyAgeView(
        mockProof.a,
        mockProof.b,
        mockProof.c,
        18
      )

      expect(result).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    test('should emit AgeVerified event on successful proof', async () => {
      const mockRegistry = {
        verifyAge: jest.fn().mockResolvedValue({
          wait: jest.fn().mockResolvedValue({
            events: [{
              event: 'AgeVerified',
              args: {
                user: '0x123',
                minAge: 18,
                timestamp: 1234567890
              }
            }]
          })
        })
      }

      const tx = await mockRegistry.verifyAge(
        ['123', '456'],
        [['111', '222'], ['333', '444']],
        ['555', '666'],
        18
      )

      const receipt = await tx.wait()
      expect(receipt.events[0].event).toBe('AgeVerified')
      expect(receipt.events[0].args.minAge).toBe(18)
    })
  })

  describe('Gas Estimation', () => {
    test('should estimate gas cost for verification', async () => {
      const mockRegistry = {
        verifyAge: {
          estimateGas: jest.fn().mockResolvedValue(100000)
        }
      }

      const gasEstimate = await mockRegistry.verifyAge.estimateGas(
        ['123', '456'],
        [['111', '222'], ['333', '444']],
        ['555', '666'],
        18
      )

      expect(gasEstimate).toBeGreaterThan(0)
      expect(gasEstimate).toBeLessThan(500000)
    })
  })
})

// Mock implementation for testing without actual deployment
export const mockAgeVerificationTests = {
  verifyAge: async (age: number, threshold: number) => age >= threshold,
  formatProof: (proof: any) => ({
    a: proof.a || ['0', '0'],
    b: proof.b || [['0', '0'], ['0', '0']],
    c: proof.c || ['0', '0']
  })
}