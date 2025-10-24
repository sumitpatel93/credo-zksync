const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function createTestZKey() {
  console.log('Creating test zkey file...');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    
    // Check for circuit files
    const wasmFile = path.join(buildDir, 'age_verifier.wasm');
    const r1csFile = path.join(buildDir, 'age_verifier.r1cs');
    
    if (!fs.existsSync(wasmFile) || !fs.existsSync(r1csFile)) {
      console.error('Circuit files not found. Run compile:circuit first.');
      process.exit(1);
    }
    
    // For testing, we'll use a simple approach
    // Create a mock proof to get the structure right
    const inputs = {
      age: 25,
      age_threshold: 18
    };
    
    // First, let's create a mock zkey structure
    // Note: This is for testing only and won't produce valid proofs
    const mockZKey = {
      protocol: 'groth16',
      curve: 'bn128',
      nPublic: 1,
      vk_alpha_1: ['0', '0', '0'],
      vk_beta_2: [['0', '0'], ['0', '0'], ['0', '0']],
      vk_gamma_2: [['0', '0'], ['0', '0'], ['0', '0']],
      vk_delta_2: [['0', '0'], ['0', '0'], ['0', '0']],
      vk_ic: [['0', '0', '0']],
      // Add some dummy binary data
      _data: Buffer.from('dummy zkey data for testing')
    };
    
    // Write as binary file
    const zkeyPath = path.join(buildDir, 'proving_key.zkey');
    
    // Create a minimal valid zkey structure
    // This is a hack for testing - in production, use proper ceremony
    const minimalZKey = Buffer.concat([
      Buffer.from('zkey'), // Magic bytes
      Buffer.from([1, 0, 0, 0]), // Version
      Buffer.from([0, 0, 0, 0]), // Header size
      Buffer.from(JSON.stringify(mockZKey))
    ]);
    
    fs.writeFileSync(zkeyPath, minimalZKey);
    
    console.log('Test zkey created at:', zkeyPath);
    
    // Also create a proper verification key
    const verificationKey = {
      protocol: 'groth16',
      curve: 'bn128',
      nPublic: 1,
      vk_alpha_1: ['20491192805390485299153009773594534940189261866228447918068658498370491509146', '204833930492403355294488957297707537393840626032930030137441661922681994285', '1'],
      vk_beta_2: [['637561435168872520640394826286896279362574404379430571522152080559648719488', '18162075897409609901965544275298808689052998710401566197405438621037551758839'], ['1', '0'], ['1', '0']],
      vk_gamma_2: [['10857046999023057135944570762232829481370756359578518086990519993285655852781', '11559732032986387107991004021392285783925812861821192530917403151452391805634'], ['1', '0'], ['1', '0']],
      vk_delta_2: [['10857046999023057135944570762232829481370756359578518086990519993285655852781', '11559732032986387107991004021392285783925812861821192530917403151452391805634'], ['1', '0'], ['1', '0']],
      vk_ic: [['20491192805390485299153009773594534940189261866228447918068658498370491509146', '204833930492403355294488957297707537393840626032930030137441661922681994285', '1']]
    };
    
    fs.writeFileSync(
      path.join(buildDir, 'verification_key.json'),
      JSON.stringify(verificationKey, null, 2)
    );
    
    console.log('Verification key created');
    console.log('\nNote: These are test keys for development only!');
    
  } catch (error) {
    console.error('Error creating test zkey:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  createTestZKey();
}