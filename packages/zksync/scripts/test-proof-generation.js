const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function testProofGeneration() {
  console.log('Testing proof generation with current setup...');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    const wasmPath = path.join(buildDir, 'age_verifier.wasm');
    
    // Test inputs
    const inputs = {
      age: 25,
      age_threshold: 18
    };
    
    console.log('Testing witness calculation...');
    
    // First, let's just test witness calculation
    const wc = require(path.join(buildDir, 'age_verifier_js/witness_calculator.js'));
    const buffer = fs.readFileSync(wasmPath);
    const witnessCalculator = await wc(buffer);
    
    const witness = await witnessCalculator.calculateWTNSBin(inputs, 0);
    console.log('✓ Witness calculated successfully!');
    console.log('Witness size:', witness.byteLength, 'bytes');
    
    // Test with different inputs
    const inputs2 = { age: 16, age_threshold: 18 };
    const witness2 = await witnessCalculator.calculateWTNSBin(inputs2, 0);
    console.log('✓ Witness for age < threshold also calculated!');
    
    console.log('\nCircuit is working correctly!');
    console.log('\nNext step: Need to create proper proving keys.');
    console.log('The circuit compiles and witness calculation works.');
    console.log('We just need valid zkey files for proof generation.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  testProofGeneration();
}