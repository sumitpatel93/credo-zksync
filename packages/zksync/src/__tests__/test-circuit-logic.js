const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function testCircuitLogic() {
  console.log('Testing circuit logic with valid keys...');
  
  const buildDir = path.join(__dirname, '../../build');
  const wasmPath = path.join(buildDir, 'age_verifier.wasm');
  const provingKeyPath = path.join(buildDir, 'proving_key.zkey');
  const verificationKeyPath = path.join(buildDir, 'verification_key.json');
  
  // Test 1: age >= threshold (should be valid = 1)
  console.log('\nTest 1: Age 25 >= Threshold 18');
  const inputs1 = { age: 25, age_threshold: 18 };
  
  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs1,
      wasmPath,
      provingKeyPath
    );
    
    console.log('Proof generated!');
    console.log('Public signals:', publicSignals);
    console.log('Valid signal (should be 1):', publicSignals[0]);
    
    // Verify the proof
    const vKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf-8'));
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    console.log('Proof verified:', isValid);
    
  } catch (error) {
    console.error('Test 1 failed:', error.message);
  }
  
  // Test 2: age < threshold (should be valid = 0)
  console.log('\nTest 2: Age 16 < Threshold 18');
  const inputs2 = { age: 16, age_threshold: 18 };
  
  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs2,
      wasmPath,
      provingKeyPath
    );
    
    console.log('Proof generated!');
    console.log('Public signals:', publicSignals);
    console.log('Valid signal (should be 0):', publicSignals[0]);
    
    // Verify the proof
    const vKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf-8'));
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    console.log('Proof verified:', isValid);
    
  } catch (error) {
    console.error('Test 2 failed:', error.message);
  }
  
  console.log('\n✅ Circuit logic test complete!');
}

if (require.main === module) {
  testCircuitLogic();
}

module.exports = { testCircuitLogic };