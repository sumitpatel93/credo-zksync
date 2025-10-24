const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function exportVKey() {
  console.log('Exporting verification key from zkey...');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    const finalZkeyPath = path.join(buildDir, 'proving_key_final.zkey');
    const verificationKeyPath = path.join(buildDir, 'verification_key.json');
    
    if (!fs.existsSync(finalZkeyPath)) {
      console.error('Final zkey not found');
      process.exit(1);
    }
    
    // Export without logger to avoid issues
    const vKey = await snarkjs.zKey.exportVerificationKey(finalZkeyPath);
    
    // Write the verification key
    fs.writeFileSync(verificationKeyPath, JSON.stringify(vKey, null, 2));
    
    console.log('✓ Verification key exported successfully!');
    console.log('Key structure:');
    console.log('- Protocol:', vKey.protocol);
    console.log('- Curve:', vKey.curve);
    console.log('- nPublic:', vKey.nPublic);
    
  } catch (error) {
    console.error('Error exporting verification key:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  exportVKey();
}

module.exports = { exportVKey };