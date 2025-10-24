import * as snarkjs from 'snarkjs'
import { promises as fs } from 'fs'
import path from 'path'

describe('Age Verification Circuit', () => {
  let wasmPath: string
  let provingKeyPath: string
  let verificationKey: any

  beforeAll(async () => {
    wasmPath = path.join(__dirname, '../../build/age_verifier.wasm')
    provingKeyPath = path.join(__dirname, '../../build/proving_key.zkey')
    
    try {
      const verificationKeyPath = path.join(__dirname, '../../build/verification_key.json')
      verificationKey = JSON.parse(await fs.readFile(verificationKeyPath, 'utf-8'))
    } catch (error) {
      console.warn('Verification key not found - circuit may need compilation')
    }
  })

  describe('Circuit Functionality', () => {
    test('should verify age >= threshold', async () => {
      const inputs = {
        age: 25,
        age_threshold: 18
      }

      const proof = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        provingKeyPath
      )

      const verified = await snarkjs.groth16.verify(
        verificationKey,
        proof.publicSignals,
        proof.proof
      )

      expect(verified).toBe(true)
      expect(proof.publicSignals[0]).toBe('1') // valid = true
    })

    test('should reject age < threshold', async () => {
      const inputs = {
        age: 16,
        age_threshold: 18
      }

      const proof = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        provingKeyPath
      )

      const verified = await snarkjs.groth16.verify(
        verificationKey,
        proof.publicSignals,
        proof.proof
      )

      expect(verified).toBe(true) // Circuit should still produce valid proof
      expect(proof.publicSignals[0]).toBe('0') // valid = false
    })

    test('should handle edge cases', async () => {
      // Exact match
      const inputs = {
        age: 18,
        age_threshold: 18
      }

      const proof = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        provingKeyPath
      )

      expect(proof.publicSignals[0]).toBe('1') // 18 >= 18 = true
    })

    test('should handle maximum age values', async () => {
      const inputs = {
        age: 150,
        age_threshold: 100
      }

      const proof = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        provingKeyPath
      )

      const verified = await snarkjs.groth16.verify(
        verificationKey,
        proof.publicSignals,
        proof.proof
      )

      expect(verified).toBe(true)
      expect(proof.publicSignals[0]).toBe('1')
    })

    test('should handle minimum age values', async () => {
      const inputs = {
        age: 0,
        age_threshold: 0
      }

      const proof = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        provingKeyPath
      )

      const verified = await snarkjs.groth16.verify(
        verificationKey,
        proof.publicSignals,
        proof.proof
      )

      expect(verified).toBe(true)
      expect(proof.publicSignals[0]).toBe('1') // 0 >= 0 = true
    })
  })

  describe('Proof Structure', () => {
    test('should generate valid proof structure', async () => {
      const inputs = {
        age: 30,
        age_threshold: 21
      }

      const proof = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        provingKeyPath
      )

      expect(proof).toHaveProperty('proof')
      expect(proof).toHaveProperty('publicSignals')
      expect(proof.proof).toHaveProperty('pi_a')
      expect(proof.proof).toHaveProperty('pi_b')
      expect(proof.proof).toHaveProperty('pi_c')
      expect(Array.isArray(proof.publicSignals)).toBe(true)
    })

    test('should have consistent proof format', async () => {
      const inputs = {
        age: 25,
        age_threshold: 18
      }

      const proof1 = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        provingKeyPath
      )

      const proof2 = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        provingKeyPath
      )

      // Different proofs but same verification
      expect(proof1.proof.pi_a).not.toEqual(proof2.proof.pi_a)
      expect(proof1.publicSignals).toEqual(proof2.publicSignals)
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid inputs gracefully', async () => {
      const inputs = {
        age: -1, // Invalid negative age
        age_threshold: 18
      }

      await expect(
        snarkjs.groth16.fullProve(inputs, wasmPath, provingKeyPath)
      ).rejects.toThrow()
    })

    test('should handle missing inputs', async () => {
      const inputs = {
        age: 25
        // Missing age_threshold
      } as any

      await expect(
        snarkjs.groth16.fullProve(inputs, wasmPath, provingKeyPath)
      ).rejects.toThrow()
    })
  })
})