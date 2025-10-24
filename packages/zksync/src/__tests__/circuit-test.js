const snarkjs = require('snarkjs');
const path = require('path');
const fs = require('fs');

async function testCircuit() {
  console.log('Testing age verification circuit...');
  
  try {
    const wasmPath = path.join(__dirname, '../../build/age_verifier.wasm');
    const r1csPath = path.join(__dirname, '../../build/age_verifier.r1cs');
    
    // Test witness calculation
    const inputs = {
      age: 25,
      age_threshold: 18
    };
    
    console.log('Calculating witness...');
    const witness = await snarkjs.wtns.calculate(inputs, wasmPath);
    
    console.log('Witness calculated successfully!');
    console.log('First few witness values:', witness.slice(0, 5));
    
    // Test witness against constraints
    console.log('Checking witness against constraints...');
    await snarkjs.wtns.check(r1csPath, witness);
    console.log('✓ Witness satisfies constraints!');
    
    // Test with age < threshold
    console.log('\nTesting with age < threshold...');
    const inputs2 = {
      age: 16,
      age_threshold: 18
    };
    
    const witness2 = await snarkjs.wtns.calculate(inputs2, wasmPath);
    await snarkjs.wtns.check(r1csPath, witness2);
    console.log('✓ Witness for age < threshold also valid!');
    
    console.log('\nCircuit test completed successfully!');
    
  } catch (error) {
    console.error('Circuit test failed:', error.message);
    process.exit(1);
  }
}

testCircuit();