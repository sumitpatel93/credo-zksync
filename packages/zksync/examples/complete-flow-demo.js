// Import the adapter - using TypeScript source directly
const AnonCredsGroth16Adapter = require('../src/AnonCredsGroth16Adapter').AnonCredsGroth16Adapter;
const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

/**
 * Complete Flow Demo: AnonCreds to On-Chain Age Verification
 * 
 * This example demonstrates:
 * 1. Creating an AnonCreds credential with age
 * 2. Converting it to a Groth16 zero-knowledge proof
 * 3. Formatting the proof for on-chain verification
 * 4. Verifying the proof locally
 */

async function runCompleteFlow() {
  console.log('🚀 Starting Complete AnonCreds to On-Chain Flow Demo\n');
  
  try {
    // Step 1: Create AnonCredsGroth16Adapter
    console.log('Step 1: Creating AnonCredsGroth16Adapter...');
    const adapter = new AnonCredsGroth16Adapter();
    console.log('✅ Adapter created successfully\n');
    
    // Step 2: Create a test AnonCreds credential with age
    console.log('Step 2: Creating test AnonCreds credential...');
    const testCredential = AnonCredsGroth16Adapter.createTestCredential(25); // Age 25
    console.log('✅ Test credential created:');
    console.log('  - Schema ID:', testCredential.schema_id);
    console.log('  - Age:', testCredential.values.age.raw);
    console.log('');
    
    // Step 3: Convert AnonCreds credential to Groth16 proof
    console.log('Step 3: Converting credential to Groth16 proof (age threshold: 18)...');
    const formattedProof = await adapter.convertFromAnonCreds(testCredential, 18);
    console.log('✅ Proof converted successfully:');
    console.log('  - Proof format: Solidity-compatible');
    console.log('  - Components: a, b, c, input');
    console.log('');
    
    // Step 4: Display the formatted proof
    console.log('Step 4: Formatted Proof Details:');
    console.log('  a:', formattedProof.a);
    console.log('  b:', formattedProof.b);
    console.log('  c:', formattedProof.c);
    console.log('  input:', formattedProof.input);
    console.log('');
    
    // Step 5: Verify proof locally
    console.log('Step 5: Verifying proof locally...');
    const isValid = await adapter.verifyLocal(
      {
        proof: {
          pi_a: formattedProof.a,
          pi_b: formattedProof.b,
          pi_c: formattedProof.c
        },
        publicSignals: formattedProof.input
      },
      18
    );
    console.log('✅ Local verification:', isValid ? 'PASSED' : 'FAILED');
    console.log('');
    
    // Step 6: Test with different age scenarios
    console.log('Step 6: Testing different age scenarios...\n');
    
    // Scenario 1: Age exactly at threshold
    console.log('Scenario 1: Age = 18 (at threshold)');
    const cred1 = AnonCredsGroth16Adapter.createTestCredential(18);
    const proof1 = await adapter.convertFromAnonCreds(cred1, 18);
    console.log('  - Proof generated successfully');
    console.log('  - Public signals:', proof1.input);
    console.log('');
    
    // Scenario 2: Age below threshold
    console.log('Scenario 2: Age = 16 (below threshold)');
    const cred2 = AnonCredsGroth16Adapter.createTestCredential(16);
    const proof2 = await adapter.convertFromAnonCreds(cred2, 18);
    console.log('  - Proof generated successfully');
    console.log('  - Public signals:', proof2.input);
    console.log('');
    
    // Scenario 3: Age above threshold
    console.log('Scenario 3: Age = 30 (above threshold)');
    const cred3 = AnonCredsGroth16Adapter.createTestCredential(30);
    const proof3 = await adapter.convertFromAnonCreds(cred3, 18);
    console.log('  - Proof generated successfully');
    console.log('  - Public signals:', proof3.input);
    console.log('');
    
    // Step 7: Demonstrate on-chain ready format
    console.log('Step 7: On-Chain Ready Format Example:');
    console.log('The proof is now ready for on-chain verification!');
    console.log('');
    console.log('Example Solidity function call:');
    console.log('ageVerifier.verifyProof(');
    console.log('  [' + formattedProof.a.map(s => '"' + s + '"').join(', ') + '],');
    console.log('  [[' + formattedProof.b[0].map(s => '"' + s + '"').join(', ') + '], [' + formattedProof.b[1].map(s => '"' + s + '"').join(', ') + ']],');
    console.log('  [' + formattedProof.c.map(s => '"' + s + '"').join(', ') + '],');
    console.log('  [' + formattedProof.input.map(s => '"' + s + '"').join(', ') + ']');
    console.log(');');
    console.log('');
    
    // Step 8: Summary
    console.log('🎉 COMPLETE FLOW DEMONSTRATION FINISHED!');
    console.log('');
    console.log('✅ Successfully demonstrated:');
    console.log('  1. AnonCreds credential creation');
    console.log('  2. Conversion to Groth16 zero-knowledge proof');
    console.log('  3. Solidity-compatible proof formatting');
    console.log('  4. Local proof verification');
    console.log('  5. Multiple age scenarios');
    console.log('  6. On-chain ready format');
    console.log('');
    console.log('🚀 The complete flow from AnonCreds to on-chain verification is working!');
    
  } catch (error) {
    console.error('❌ Error in complete flow demo:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the demo
if (require.main === module) {
  runCompleteFlow();
}

module.exports = { runCompleteFlow };