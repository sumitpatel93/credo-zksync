import { AnonCredsGroth16Adapter } from '../AnonCredsGroth16Adapter'

// Mock implementation for testing without circuit compilation
describe('Mock Circuit Tests', () => {
  test('should simulate age verification logic', async () => {
    const adapter = new AnonCredsGroth16Adapter()
    
    // Mock the circuit behavior
    const mockGenerateAgeProof = async (age: number, threshold: number) => {
      return {
        proof: {
          pi_a: ['0x123', '0x456'],
          pi_b: [['0x789', '0xabc'], ['0xdef', '0x012']],
          pi_c: ['0x345', '0x678']
        },
        publicSignals: [age >= threshold ? '1' : '0']
      }
    }
    
    // Test cases
    const testCases = [
      { age: 25, threshold: 18, expected: true },
      { age: 17, threshold: 18, expected: false },
      { age: 18, threshold: 18, expected: true },
      { age: 30, threshold: 21, expected: true }
    ]
    
    for (const { age, threshold, expected } of testCases) {
      const result = await mockGenerateAgeProof(age, threshold)
      expect(result.publicSignals[0]).toBe(expected ? '1' : '0')
    }
  })

  test('should handle AnonCreds credential extraction', () => {
    const adapter = new AnonCredsGroth16Adapter()
    const credential = AnonCredsGroth16Adapter.createTestCredential(25)
    
    // Test the adapter logic
    const age = adapter.extractAge(credential)
    expect(age).toBe(25)
  })
})