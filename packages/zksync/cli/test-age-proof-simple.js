#!/usr/bin/env node

const snarkjs = require('snarkjs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

async function generateProof(age = 25, threshold = 18) {
  console.log('\n🚀 Testing AnonCreds to On-Chain Age Verification\n');
  
  try {
    console.log(`📋 Inputs:`);
    console.log(`  Age: ${age}`);
    console.log(`  Threshold: ${threshold}`);
    console.log();
    
    const buildDir = path.join(__dirname, '../build');
    const wasmPath = path.join(buildDir, 'age_verifier.wasm');
    const provingKeyPath = path.join(buildDir, 'proving_key.zkey');
    const verificationKeyPath = path.join(buildDir, 'verification_key.json');
    
    console.log('🔑 Generating Groth16 proof...');
    const inputs = { age, age_threshold: threshold };
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasmPath,
      provingKeyPath
    );
    
    console.log('✅ Proof generated successfully!');
    console.log(`   Public signals: ${JSON.stringify(publicSignals)}`);
    console.log();
    
    // Format for Solidity
    console.log('📝 Solidity-compatible format:');
    const formattedProof = {
      a: proof.pi_a.slice(0, 2),
      b: [proof.pi_b[0].slice(0, 2), proof.pi_b[1].slice(0, 2)],
      c: proof.pi_c.slice(0, 2),
      input: publicSignals
    };
    
    console.log('```solidity');
    console.log('// Proof data for age verification');
    console.log(`uint256[2] memory a = [${formattedProof.a.join(', ')}];`);
    console.log(`uint256[2][2] memory b = [`);
    console.log(`  [${formattedProof.b[0].join(', ')}],`);
    console.log(`  [${formattedProof.b[1].join(', ')}]`);
    console.log(`];`);
    console.log(`uint256[2] memory c = [${formattedProof.c.join(', ')}];`);
    console.log(`uint256[${publicSignals.length}] memory input = [${publicSignals.join(', ')}];`);
    console.log('```');
    
    // Verify the proof
    console.log('\n🔍 Verifying proof...');
    const vKey = require(verificationKeyPath);
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    console.log(`✅ Verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    
    if (isValid) {
      console.log('\n✨ The proof is valid and ready for on-chain verification!');
    }
    
    console.log('\n🎉 Demo complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

async function testScenarios() {
  console.log('\n🧪 Testing Multiple Age Scenarios\n');
  
  const scenarios = [
    { age: 16, threshold: 18, description: 'Below threshold' },
    { age: 18, threshold: 18, description: 'At threshold' },
    { age: 25, threshold: 18, description: 'Above threshold' },
    { age: 65, threshold: 18, description: 'Well above threshold' },
    { age: 21, threshold: 21, description: 'At threshold (21)' }
  ];
  
  const buildDir = path.join(__dirname, '../build');
  const wasmPath = path.join(buildDir, 'age_verifier.wasm');
  const provingKeyPath = path.join(buildDir, 'proving_key.zkey');
  
  for (const scenario of scenarios) {
    console.log(`Testing age ${scenario.age} with threshold ${scenario.threshold} (${scenario.description}):`);
    
    try {
      const { publicSignals } = await snarkjs.groth16.fullProve(
        { age: scenario.age, age_threshold: scenario.threshold },
        wasmPath,
        provingKeyPath
      );
      
      const isValid = publicSignals[0] === '1';
      console.log(`  Result: ${isValid ? 'VALID' : 'INVALID'} (signal: ${publicSignals[0]})`);
      
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
    
    console.log();
  }
  
  console.log('✅ All scenarios tested!');
}

async function main() {
  if (args.length === 0 || args[0] === 'help') {
    console.log(`
🛠️  AnonCreds Age Proof CLI Tool

Usage:
  node test-age-proof-simple.js generate [age] [threshold]  - Generate proof
  node test-age-proof-simple.js test-scenarios              - Test multiple scenarios
  node test-age-proof-simple.js help                        - Show this help

Examples:
  node test-age-proof-simple.js generate                    # Generate proof for age 25, threshold 18
  node test-age-proof-simple.js generate 30 21              # Generate proof for age 30, threshold 21
  node test-age-proof-simple.js test-scenarios              # Test various age scenarios
`);
    return;
  }
  
  switch (command) {
    case 'generate':
      const age = args[1] ? parseInt(args[1]) : 25;
      const threshold = args[2] ? parseInt(args[2]) : 18;
      await generateProof(age, threshold);
      break;
      
    case 'test-scenarios':
      await testScenarios();
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Run "node test-age-proof-simple.js help" for usage.');
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});