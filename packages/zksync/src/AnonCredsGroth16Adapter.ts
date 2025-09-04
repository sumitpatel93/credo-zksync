import { AgentContext } from '@credo-ts/core'
import { AnonCredsCredential, AnonCredsPresentation } from '@credo-ts/anoncreds'
import snarkjs from 'snarkjs'
import { promises as fs } from 'fs'
import path from 'path'

export interface AgeProofInput {
  age: number
  age_threshold: number
}

export interface AgeProofOutput {
  proof: {
    pi_a: string[]
    pi_b: string[][]
    pi_c: string[]
  }
  publicSignals: string[]
}

export interface FormattedProof {
  a: [string, string]
  b: [[string, string], [string, string]]
  c: [string, string]
  input: string[]
}

export class AnonCredsGroth16Adapter {
  // Contract addresses for zkSync Sepolia testnet
  private readonly ageVerifierAddress = '0x2fe3701d02deB6B22F5B293aC0dd91f601A2B6D9'
  private readonly registryAddress = '0x4Ce8a725c63048bB42c95b064Ce3262790F1b80D'
  
  private wasmPath: string
  private provingKeyPath: string

  constructor() {
    this.wasmPath = path.join(__dirname, '../../build/age_verifier.wasm')
    this.provingKeyPath = path.join(__dirname, '../../build/proving_key.zkey')
  }

  /**
   * Extract age from AnonCreds credential attributes
   */
  private extractAge(credential: AnonCredsCredential): number {
    const ageAttribute = credential.attributes.find(attr => attr.name === 'age')
    if (!ageAttribute) {
      throw new Error('Age attribute not found in credential')
    }
    
    const age = parseInt(ageAttribute.value)
    if (isNaN(age) || age < 0 || age > 150) {
      throw new Error('Invalid age value')
    }
    
    return age
  }

  /**
   * Generate Groth16 proof from age and threshold
   */
  async generateAgeProof(age: number, ageThreshold: number): Promise<AgeProofOutput> {
    const inputs: AgeProofInput = {
      age,
      age_threshold: ageThreshold
    }

    try {
      const proof = await snarkjs.groth16.fullProve(
        inputs,
        this.wasmPath,
        this.provingKeyPath
      )

      return proof as AgeProofOutput
    } catch (error) {
      throw new Error(`Failed to generate age proof: ${error.message}`)
    }
  }

  /**
   * Convert AnonCreds credential to age proof
   */
  async convertFromAnonCreds(
    credential: AnonCredsCredential,
    ageThreshold: number
  ): Promise<FormattedProof> {
    const age = this.extractAge(credential)
    const proof = await this.generateAgeProof(age, ageThreshold)
    
    return this.formatProofForContract(proof)
  }

  /**
   * Format proof for Solidity contract
   */
  formatProofForContract(proof: AgeProofOutput): FormattedProof {
    return {
      a: [proof.proof.pi_a[0], proof.proof.pi_a[1]] as [string, string],
      b: [
        [proof.proof.pi_b[0][0], proof.proof.pi_b[0][1]],
        [proof.proof.pi_b[1][0], proof.proof.pi_b[1][1]]
      ] as [[string, string], [string, string]],
      c: [proof.proof.pi_c[0], proof.proof.pi_c[1]] as [string, string],
      input: proof.publicSignals
    }
  }

  /**
   * Verify proof locally (for testing)
   */
  async verifyLocal(proof: AgeProofOutput, ageThreshold: number): Promise<boolean> {
    try {
      const verificationKeyPath = path.join(__dirname, '../../build/verification_key.json')
      const verificationKey = JSON.parse(await fs.readFile(verificationKeyPath, 'utf-8'))
      
      return await snarkjs.groth16.verify(
        verificationKey,
        proof.publicSignals,
        proof.proof
      )
    } catch (error) {
      throw new Error(`Failed to verify proof locally: ${error.message}`)
    }
  }

  /**
   * Create test credential for development
   */
  static createTestCredential(age: number): AnonCredsCredential {
    return {
      schema_id: 'test-schema-id',
      cred_def_id: 'test-cred-def-id',
      signature: 'test-signature',
      signature_correctness_proof: 'test-proof',
      values: {
        age: { raw: age.toString(), encoded: age.toString() }
      },
      attributes: [
        { name: 'age', value: age.toString() }
      ]
    } as any // Type assertion for testing
  }
}