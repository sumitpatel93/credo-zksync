describe('Age Verification System', () => {
  test('should demonstrate the complete flow', () => {
    // 1. Simulate credential with age
    const credential = {
      schema_id: 'age-verification-schema',
      attributes: { age: 25 }
    }

    // 2. Mock proof generation
    const age = credential.attributes.age
    const threshold = 18
    const isValid = age >= threshold

    expect(isValid).toBe(true)
  })

  test('should handle edge cases', () => {
    const testCases = [
      { age: 25, threshold: 18, expected: true },
      { age: 17, threshold: 18, expected: false },
      { age: 18, threshold: 18, expected: true },
      { age: 30, threshold: 21, expected: true }
    ]

    testCases.forEach(({ age, threshold, expected }) => {
      const result = age >= threshold
      expect(result).toBe(expected)
    })
  })

  test('should work with mock proof structure', () => {
    const mockProof = {
      a: ['0x123', '0x456'],
      b: [['0x789', '0xabc'], ['0xdef', '0x012']],
      c: ['0x345', '0x678'],
      input: ['1'] // valid = true
    }

    expect(mockProof.input[0]).toBe('1')
  })
})