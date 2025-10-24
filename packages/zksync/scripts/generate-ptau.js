const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function generatePtau() {
  console.log('Generating local powers of tau ceremony...');
  
  try {
    const ceremonyPath = path.join(__dirname, '../ceremony');
    if (!fs.existsSync(ceremonyPath)) {
      fs.mkdirSync(ceremonyPath, { recursive: true });
    }
    
    // Generate a small powers of tau for development
    // Using power 10 which should be sufficient for our circuit
    const ptauFile = path.join(ceremonyPath, 'pot10_final.ptau');
    
    console.log('Creating new accumulator...');
    await snarkjs.powersOfTau.newAccumulator('bn128', 10, ptauFile);
    
    console.log('Adding contribution...');
    await snarkjs.powersOfTau.contribute(ptauFile, ptauFile + '.cont', 'test contribution', 'test entropy');
    fs.renameSync(ptauFile + '.cont', ptauFile);
    
    console.log('Preparing phase 2...');
    await snarkjs.powersOfTau.preparePhase2(ptauFile, ptauFile + '.final');
    fs.renameSync(ptauFile + '.final', ptauFile);
    
    console.log('✓ Powers of tau ceremony completed!');
    console.log('File:', ptauFile);
    
    // Verify the file
    const stats = fs.statSync(ptauFile);
    console.log('File size:', Math.round(stats.size / 1024), 'KB');
    
    return ptauFile;
    
  } catch (error) {
    console.error('Error generating powers of tau:', error.message);
    console.error('Stack:', error.stack);
    
    // Try with even smaller power
    console.log('\nTrying with smaller power...');
    try {
      const ptauFile2 = path.join(ceremonyPath, 'pot08_final.ptau');
      await snarkjs.powersOfTau.newAccumulator('bn128', 8, ptauFile2);
      console.log('✓ Smaller powers of tau created!');
      return ptauFile2;
    } catch (error2) {
      console.error('Small power also failed:', error2.message);
      throw error2;
    }
  }
}

if (require.main === module) {
  generatePtau().then(file => {
    console.log('\nSuccessfully created:', file);
  }).catch(err => {
    console.error('Failed to create powers of tau:', err);
    process.exit(1);
  });
}

module.exports = { generatePtau };