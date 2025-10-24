#!/usr/bin/env node

const snarkjs = require('snarkjs');
const path = require('path');
const { program } = require('commander');

program
  .name('test-age-proof')
  .description('CLI tool to test AnonCreds to on-chain age verification')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate age proof')
  .option('-a, --age <number>', 'Age to prove', '25')
  .option('-t, --threshold <number>', 'Age threshold', '18')
  .option('-v, --verify', 'Verify the proof')
  .option('-f, --format <type>', 'Output format (json|solidity)', 'json')
  .action(async (options) => {
    console.log('\n🚀 Testing AnonCreds to On-Chain Age Verification\n');
    
    try {
      const age = parseInt(options.age);
      const threshold = parseInt(options.threshold);
      
      console.log(`📋 Inputs:`);
      console.log(`  Age: ${age}`);
      console.log(`  Threshold: ${threshold}`);
      console.log();
      
      // Set up paths
      const buildDir = path.join(__dirname, '../../build');
      const wasmPath = path.join(buildDir, 'age_verifier.wasm');
      const provingKeyPath = path.join(buildDir, 'proving_key.zkey');
      const verificationKeyPath = path.join(buildDir, 'verification_key.json');
      
      // Check files exist
      const fs = require('fs');
      if (!fs.existsSync(wasmPath) || !fs.existsSync(provingKeyPath)) {
        console.error('❌ Circuit files not found. Run compile:circuit first.');
        process.exit(1);
      }
      
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
      
      // Format proof based on user choice
      if (options.format === 'solidity') {
        console.log('📝 Solidity-compatible format:');
        const formattedProof = {
          a: proof.pi_a.slice(0, 2),
          b: [proof.pi_b[0].slice(0, 2), proof.pi_b[1].slice(0, 2)],
          c: proof.pi_c.slice(0, 2),
          input: publicSignals
        };
        
        console.log('```solidity');
        console.log('// Proof data for age verification');
        console.log(`uint256[2] memory a = [${formattedProof.a.map(s => s).join(', ')}];`);
        console.log(`uint256[2][2] memory b = [`);
        console.log(`  [${formattedProof.b[0].join(', ')}],`);
        console.log(`  [${formattedProof.b[1].join(', ')}]`);
        console.log(`];`);
        console.log(`uint256[2] memory c = [${formattedProof.c.join(', ')}];`);
        console.log(`uint256[${publicSignals.length}] memory input = [${publicSignals.join(', ')}];`);
        console.log('```');
      } else {
        console.log('📊 Complete proof data:');
        console.log(JSON.stringify({
          proof: {
            pi_a: proof.pi_a,
            pi_b: proof.pi_b,
            pi_c: proof.pi_c
          },
          publicSignals,
          formattedForSolidity: {
            a: proof.pi_a.slice(0, 2),
            b: [proof.pi_b[0].slice(0, 2), proof.pi_b[1].slice(0, 2)],
            c: proof.pi_c.slice(0, 2),
            input: publicSignals
          }
        }, null, 2));
      }
      
      // Verify if requested
      if (options.verify) {
        console.log('\n🔍 Verifying proof...');
        const vKey = require(verificationKeyPath);
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        console.log(`✅ Verification: ${isValid ? 'PASSED' : 'FAILED'}`);
        
        if (isValid) {
          console.log('\n✨ The proof is valid and ready for on-chain verification!');
        } else {
          console.log('\n❌ The proof verification failed.');
        }
      }
      
      console.log('\n🎉 Demo complete!');
      
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('verify')
  .description('Verify a proof')
  .option('-p, --proof <file>', 'Proof file path')
  .option('-s, --signals <array>', 'Public signals (JSON array)')
  .action(async (options) => {
    console.log('\n🔍 Verifying Proof\n');
    
    try {
      const buildDir = path.join(__dirname, '../../build');
      const verificationKeyPath = path.join(buildDir, 'verification_key.json');
      
      // For demo purposes, verify the proof we just generated
      const fs = require('fs');
      const vKey = require(verificationKeyPath);
      
      // Simple verification with known values
      console.log('Verifying with test values...');
      const testProof = await snarkjs.groth16.fullProve(
        { age: 25, age_threshold: 18 },
        path.join(buildDir, 'age_verifier.wasm'),
        path.join(buildDir, 'proving_key.zkey')
      );
      
      const isValid = await snarkjs.groth16.verify(vKey, testProof.publicSignals, testProof.proof);
      console.log(`✅ Test verification: ${isValid ? 'PASSED' : 'FAILED'}`);
      
      if (options.proof && options.signals) {
        // Custom verification would go here
        console.log('\nNote: Custom verification with provided proof files would be implemented here.');
      }
      
    } catch (error) {
      console.error('\n❌ Verification error:', error.message);
      process.exit(1);
    }
  });

program
  .command('test-scenarios')
  .description('Test multiple age scenarios')
  .action(async () => {
    console.log('\n🧪 Testing Multiple Age Scenarios\n');
    
    const scenarios = [
      { age: 16, threshold: 18, expected: 'below' },
      { age: 18, threshold: 18, expected: 'at' },
      { age: 25, threshold: 18, expected: 'above' },
      { age: 65, threshold: 18, expected: 'above' },
      { age: 21, threshold: 21, expected: 'at' }
    ];
    
    const buildDir = path.join(__dirname, '../../build');
    const wasmPath = path.join(buildDir, 'age_verifier.wasm');
    const provingKeyPath = path.join(buildDir, 'proving_key.zkey');
    
    for (const scenario of scenarios) {
      console.log(`Testing age ${scenario.age} with threshold ${scenario.threshold} (${scenario.expected} threshold):`);
      
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
  });

program.parse();