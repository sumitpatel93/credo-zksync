const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function generateKeys() {
  console.log('Generating proving and verification keys...');
  
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
    
    // Download powers of tau if not exists
    const ptauFile = path.join(ceremonyPath, 'powersOfTau28_hez_final_10.ptau');
    if (!fs.existsSync(ptauFile)) {
      console.log('Downloading powers of tau...');
      await downloadFile(
        'https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau',
        ptauFile
      );
      console.log('Powers of tau downloaded successfully.');
    }
    
    // Generate initial zkey
    console.log('Generating initial zkey...');
    const initZkeyPath = path.join(buildDir, 'circuit_0000.zkey');
    await snarkjs.zKey.newZKey(circuitFile, ptauFile, initZkeyPath);
    console.log('Initial zkey generated.');
    
    // Contribute to ceremony (dummy contribution for testing)
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
    
    console.log('\nKeys generated successfully!');
    console.log('Files created:');
    console.log('- proving_key.zkey');
    console.log('- verification_key.json');
    console.log('- circuit_final.zkey (backup)');
    
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
    console.log('Proof structure verified.');
    
    // Verify the proof
    const vKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf-8'));
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    
    if (isValid) {
      console.log('✓ Sample proof verified successfully!');
    } else {
      console.log('✗ Sample proof verification failed!');
    }
    
  } catch (error) {
    console.error('Error generating keys:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  generateKeys();
}

module.exports = { generateKeys };