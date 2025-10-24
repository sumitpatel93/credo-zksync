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

async function trustedSetup() {
  console.log('Running trusted setup...');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    const ceremonyPath = path.join(__dirname, '../ceremony');
    
    // Create directories
    if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
    if (!fs.existsSync(ceremonyPath)) fs.mkdirSync(ceremonyPath, { recursive: true });
    
    // Check for circuit file
    const circuitFile = path.join(__dirname, '../build/age_verifier.r1cs');
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
    await snarkjs.zKey.newZKey(
      circuitFile,
      ptauFile,
      path.join(buildDir, 'circuit_0000.zkey')
    );
    
    // Contribute to ceremony (dummy contribution for testing)
    console.log('Adding contribution...');
    await snarkjs.zKey.contribute(
      path.join(buildDir, 'circuit_0000.zkey'),
      path.join(buildDir, 'circuit_final.zkey'),
      'test contribution',
      'test entropy'
    );
    
    // Export verification key
    console.log('Generating verification key...');
    await snarkjs.zKey.exportVerificationKey(
      path.join(buildDir, 'circuit_final.zkey'),
      path.join(buildDir, 'verification_key.json')
    );
    
    // Rename to expected filenames
    fs.renameSync(
      path.join(buildDir, 'circuit_final.zkey'),
      path.join(buildDir, 'proving_key.zkey')
    );
    
    console.log('Trusted setup completed!');
    console.log('Files generated:');
    console.log('- proving_key.zkey');
    console.log('- verification_key.json');
    
  } catch (error) {
    console.error('Error in trusted setup:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  trustedSetup();
}

module.exports = { trustedSetup };