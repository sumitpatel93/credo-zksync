const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function generateDevKeys() {
  console.log('Generating development keys...');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    const ceremonyPath = path.join(__dirname, '../ceremony');
    
    // Create directories
    if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
    if (!fs.existsSync(ceremonyPath)) fs.mkdirSync(ceremonyPath, { recursive: true });
    
    // Check for circuit file
    const circuitFile = path.join(buildDir, 'age_verifier.r1cs');
    if (!fs.existsSync(circuitFile)) {
      console.error('Circuit not compiled. Run compile:circuit first.');
      process.exit(1);
    }
    
    // For development, we'll use a simpler approach
    // Create a mock powers of tau file with minimal parameters
    console.log('Creating development powers of tau...');
    
    // Create a minimal ptau file for development
    // Note: This is NOT secure for production!
    const ptauFile = path.join(ceremonyPath, 'pot12_final.ptau');
    
    // Generate a small powers of tau ceremony
    console.log('Generating small powers of tau ceremony...');
    await snarkjs.powersOfTau.newAccumulator('bn128', 12, ptauFile);
    console.log('Powers of tau ceremony created.');
    
    // Contribute to the ceremony
    console.log('Adding contribution...');
    await snarkjs.powersOfTau.contribute(ptauFile, ptauFile + '.cont', 'dev contribution', 'dev-entropy');
    fs.renameSync(ptauFile + '.cont', ptauFile);
    
    // Prepare phase 2
    console.log('Preparing phase 2...');
    await snarkjs.powersOfTau.preparePhase2(ptauFile, ptauFile + '.final');
    fs.renameSync(ptauFile + '.final', ptauFile);
    
    // Generate initial zkey
    console.log('Generating initial zkey...');
    const initZkeyPath = path.join(buildDir, 'circuit_0000.zkey');
    await snarkjs.zKey.newZKey(circuitFile, ptauFile, initZkeyPath);
    console.log('Initial zkey generated.');
    
    // Contribute to ceremony
    console.log('Adding contribution...');
    const finalZkeyPath = path.join(buildDir, 'circuit_final.zkey');
    await snarkjs.zKey.contribute(
      initZkeyPath,
      finalZkeyPath,
      'test contribution',
      'test entropy for development'
    );
    console.log('Contribution added.');
    
    // Export verification key
    console.log('Generating verification key...');
    const verificationKeyPath = path.join(buildDir, 'verification_key.json');
    await snarkjs.zKey.exportVerificationKey(finalZkeyPath, verificationKeyPath);
    console.log('Verification key generated.');
    
    // Copy to expected filenames
    const provingKeyPath = path.join(buildDir, 'proving_key.zkey');
    fs.copyFileSync(finalZkeyPath, provingKeyPath);
    
    console.log('\nDevelopment keys generated successfully!');
    console.log('Files created:');
    console.log('- proving_key.zkey');
    console.log('- verification_key.json');
    console.log('- circuit_final.zkey (backup)');
    console.log('\n⚠️  WARNING: These are development keys only!');
    console.log('Do not use in production!');
    
    // Test the keys with a simple proof
    console.log('\nTesting key generation with sample proof...');
    const wasmPath = path.join(buildDir, 'age_verifier.wasm');
    const inputs = { age: 25, age_threshold: 18 };
    
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasmPath,
      provingKeyPath
    );
    
    console.log('✓ Sample proof generated successfully!');
    console.log('Public signals:', publicSignals);
    
    // Verify the proof
    const vKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf-8'));
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    
    if (isValid) {
      console.log('✓ Sample proof verified successfully!');
      console.log('\n🎉 Development setup complete! You can now run integration tests.');
    } else {
      console.log('✗ Sample proof verification failed!');
    }
    
  } catch (error) {
    console.error('Error generating development keys:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  generateDevKeys();
}

module.exports = { generateDevKeys };