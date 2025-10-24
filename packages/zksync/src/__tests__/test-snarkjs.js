const snarkjs = require('snarkjs');
const path = require('path');

async function testSnarkjs() {
  console.log('Testing snarkjs directly...');
  
  try {
    const buildDir = path.join(__dirname, '../../build');
    const wasmPath = path.join(buildDir, 'age_verifier.wasm');
    const provingKeyPath = path.join(buildDir, 'proving_key.zkey');
    
    console.log('Testing with age 25, threshold 18...');
    const inputs = { age: 25, age_threshold: 18 };
    
    const result = await snarkjs.groth16.fullProve(
      inputs,
      wasmPath,
      provingKeyPath
    );
    
    console.log('✓ snarkjs.groth16.fullProve() succeeded!');
    console.log('Result:', {
      hasProof: !!result.proof,
      hasPublicSignals: !!result.publicSignals,
      publicSignals: result.publicSignals
    });
    
  } catch (error) {
    console.error('✗ snarkjs.groth16.fullProve() failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

if (require.main === module) {
  testSnarkjs();
}