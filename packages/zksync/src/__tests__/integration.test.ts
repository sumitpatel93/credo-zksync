import { AnonCredsGroth16Adapter } from '../AnonCredsGroth16Adapter'
import * as snarkjs from 'snarkjs'
import path from 'path'

describe('End-to-End Integration Tests', () => {
  let adapter: AnonCredsGroth16Adapter

  beforeAll(() => {
    adapter = new AnonCredsGroth16Adapter()
  })

  describe('Full Integration Flow', () => {
    test('should complete AnonCreds to on-chain verification flow', async () => {
      // 1. Create test credential
      const credential = AnonCredsGroth16Adapter.createTestCredential(25)

      // 2. Convert to Groth16 proof
      const formattedProof = await adapter.convertFromAnonCreds(credential, 18)

      // 3. Verify proof structure
      expect(formattedProof).toHaveProperty('a')
      expect(formattedProof).toHaveProperty('b')
      expect(formattedProof).toHaveProperty('c')
      expect(formattedProof).toHaveProperty('input')

      // 4. Verify locally
      const proof = await adapter.generateAgeProof(25, 18)
      const localResult = await adapter.verifyLocal(proof, 18)
      expect(localResult).toBe(true)

      // 5. Format for contract
      const contractFriendly = adapter.formatProofForContract(proof)
      expect(contractFriendly.input[0]).toBe('1') // valid = true
    })

    test('should handle various age thresholds', async () => {
      const testCases = [
        { age: 25, threshold: 18, expected: true },
        { age: 30, threshold: 21, expected: true },
        { age: 17, threshold: 18, expected: false },
        { age: 65, threshold: 65, expected: true }
      ]

      for (const { age, threshold, expected } of testCases) {
        const credential = AnonCredsGroth16Adapter.createTestCredential(age)
        const proof = await adapter.convertFromAnonCreds(credential, threshold)
        
        expect(proof.input[0]).toBe(expected ? '1' : '0')
      }
    })

    test('should handle edge case scenarios', async () => {
      // Test with minimum age
      const minCredential = AnonCredsGroth16Adapter.createTestCredential(0)
      const minProof = await adapter.convertFromAnonCreds(minCredential, 0)
      expect(minProof.input[0]).toBe('1')

      // Test with maximum reasonable age
      const maxCredential = AnonCredsGroth16Adapter.createTestCredential(150)
      const maxProof = await adapter.convertFromAnonCreds(maxCredential, 100)
      expect(maxProof.input[0]).toBe('1')

      // Test with exact match
      const exactCredential = AnonCredsGroth16Adapter.createTestCredential(21)
      const exactProof = await adapter.convertFromAnonCreds(exactCredential, 21)
      expect(exactProof.input[0]).toBe('1')
    })

    test('should maintain proof consistency', async () => {
      const credential = AnonCredsGroth16Adapter.createTestCredential(30)
      
      // Generate multiple proofs for same inputs
      const proof1 = await adapter.convertFromAnonCreds(credential, 18)
      const proof2 = await adapter.convertFromAnonCreds(credential, 18)

      // Different randomness, same verification
      expect(proof1.a).not.toEqual(proof2.a)
      expect(proof1.b).not.toEqual(proof2.b)
      expect(proof1.c).not.toEqual(proof2.c)
      expect(proof1.input).toEqual(proof2.input) // Same public signals
    })
  })

  describe('Real-world Scenarios', () => {
    test('should simulate DeFi age verification', async () => {
      // Simulate user with credential
      const userCredential = AnonCredsGroth16Adapter.createTestCredential(25)
      
      // DeFi protocol requires age >= 18
      const proof = await adapter.convertFromAnonCreds(userCredential, 18)
      
      // Verify proof
      const localProof = await adapter.generateAgeProof(25, 18)
      const verificationResult = await adapter.verifyLocal(localProof, 18)
      
      expect(verificationResult).toBe(true)
      expect(proof.input[0]).toBe('1') // User is eligible
    })

    test('should simulate compliance check', async () => {
      // Simulate underage user
      const userCredential = AnonCredsGroth16Adapter.createTestCredential(16)
      
      // Compliance requires age >= 18
      const proof = await adapter.convertFromAnonCreds(userCredential, 18)
      
      // Verify proof
      const localProof = await adapter.generateAgeProof(16, 18)
      const verificationResult = await adapter.verifyLocal(localProof, 18)
      
      expect(verificationResult).toBe(true)
      expect(proof.input[0]).toBe('0') // User is NOT eligible
    })

    test('should handle batch verification scenarios', async () => {
      const testUsers = [
        { age: 25, expected: true },
        { age: 17, expected: false },
        { age: 30, expected: true },
        { age: 21, expected: true }
      ]

      const results = await Promise.all(
        testUsers.map(async ({ age, expected }) => {
          const credential = AnonCredsGroth16Adapter.createTestCredential(age)
          const proof = await adapter.convertFromAnonCreds(credential, 18)
          return { age, expected, actual: proof.input[0] === '1' }
        })
      )

      results.forEach(({ age, expected, actual }) => {
        expect(actual).toBe(expected)
      })
    })
  })

  describe('Performance Tests', () => {
    test('should measure proof generation time', async () => {
      const credential = AnonCredsGroth16Adapter.createTestCredential(25)
      
      const start = Date.now()
      await adapter.convertFromAnonCreds(credential, 18)
      const end = Date.now()
      
      const duration = end - start
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })

    test('should verify proof structure integrity', async () => {
      const credential = AnonCredsGroth16Adapter.createTestCredential(25)
      const proof = await adapter.convertFromAnonCreds(credential, 18)

      // Check proof format
      expect(Array.isArray(proof.a)).toBe(true)
      expect(Array.isArray(proof.b)).toBe(true)
      expect(Array.isArray(proof.c)).toBe(true)
      expect(proof.a.length).toBe(2)
      expect(proof.b.length).toBe(2)
      expect(proof.c.length).toBe(2)
      expect(proof.input.length).toBe(1)
    })
  })
})