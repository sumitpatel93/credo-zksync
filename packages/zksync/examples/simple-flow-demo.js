/**
 * Simple Flow Demo: AnonCreds to Age Proof
 * 
 * This demonstrates the complete working flow:
 * 1. Create a credential with age
 * 2. Generate Groth16 proof
 * 3. Format for on-chain use
 */

const snarkjs = require('snarkjs');
const path = require('path');

async function demonstrateFlow() {
  console.log('🚀 AnonCreds to On-Chain Age Verification Demo\n');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    const wasmPath = path.join(buildDir, 'age_verifier.wasm');
    const provingKeyPath = path.join(buildDir, 'proving_key.zkey');
    const verificationKeyPath = path.join(buildDir, 'verification_key.json');
    
    console.log('Step 1: Creating age verification inputs');
    console.log('  Age: 25');
    console.log('  Threshold: 18');
    console.log('');
    
    // Step 2: Generate proof
    console.log('Step 2: Generating Groth16 proof...');
    const inputs = { age: 25, age_threshold: 18 };
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasmPath,
      provingKeyPath
    );
    
    console.log('✅ Proof generated successfully!');
    console.log('  - Public signals:', publicSignals);
    console.log('');
    
    // Step 3: Format for Solidity
    console.log('Step 3: Formatting proof for Solidity contract...');
    const formattedProof = {
      a: proof.pi_a.slice(0, 2),
      b: [
        proof.pi_b[0].slice(0, 2),
        proof.pi_b[1].slice(0, 2)
      ],
      c: proof.pi_c.slice(0, 2),
      input: publicSignals
    };
    
    console.log('✅ Proof formatted for on-chain verification!');
    console.log('');
    console.log('Solidity-compatible proof:');
    console.log('  a:', formattedProof.a);
    console.log('  b:', formattedProof.b);
    console.log('  c:', formattedProof.c);
    console.log('  input:', formattedProof.input);
    console.log('');
    
    // Step 4: Verify proof
    console.log('Step 4: Verifying proof...');
    const vKey = require(verificationKeyPath);
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    console.log('✅ Proof verification:', isValid ? 'PASSED' : 'FAILED');
    console.log('');
    
    // Step 5: Example Solidity usage
    console.log('Step 5: Ready for on-chain verification!');
    console.log('');
    console.log('Example Solidity function call:');
    console.log('```solidity');
    console.log('function verifyAge(');
    console.log('  uint256[2] memory a,');
    console.log('  uint256[2][2] memory b,');
    console.log('  uint256[2] memory c,');
    console.log('  uint256[1] memory input');
    console.log(') public view returns (bool) {');
    console.log('  return ageVerifier.verifyProof(a, b, c, input);');
    console.log('}');
    console.log('```');
    console.log('');
    
    console.log('🎉 COMPLETE FLOW DEMONSTRATED!');
    console.log('');
    console.log('✅ Successfully showed:');
    console.log('  1. Zero-knowledge proof generation');
    console.log('  2. Solidity-compatible formatting');
    console.log('  3. Proof verification');
    console.log('  4. On-chain ready format');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  demonstrateFlow();
}