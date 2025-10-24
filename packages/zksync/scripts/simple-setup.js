const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function simpleSetup() {
  console.log('Running simple trusted setup...');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    
    // Check for circuit file
    const wasmFile = path.join(buildDir, 'age_verifier_js/age_verifier.wasm');
    const r1csFile = path.join(buildDir, 'age_verifier.r1cs');
    
    if (!fs.existsSync(wasmFile) || !fs.existsSync(r1csFile)) {
      console.error('Circuit not compiled. Run compile:circuit first.');
      process.exit(1);
    }
    
    // For testing purposes, we'll create a dummy verification key
    // In production, this should use a proper trusted setup ceremony
    console.log('Creating test keys...');
    
    // Create a dummy proving key structure
    const dummyProvingKey = {
      protocol: 'groth16',
      curve: 'bn128',
      nPublic: 1,
      vk_alpha_1: ['0', '0', '0'],
      vk_beta_2: [['0', '0'], ['0', '0'], ['0', '0']],
      vk_gamma_2: [['0', '0'], ['0', '0'], ['0', '0']],
      vk_delta_2: [['0', '0'], ['0', '0'], ['0', '0']],
      vk_ic: [['0', '0', '0']]
    };
    
    // Create a dummy verification key
    const dummyVerificationKey = {
      protocol: 'groth16',
      curve: 'bn128',
      nPublic: 1,
      vk_alpha_1: ['20491192805390485299153009773594534940189261866228447918068658498370491509146', '204833930492403355294488957297707537393840626032930030137441661922681994285', '1'],
      vk_beta_2: [['637561435168872520640394826286896279362574404379430571522152080559648719488', '18162075897409609901965544275298808689052998710401566197405438621037551758839'], ['1', '0'], ['1', '0']],
      vk_gamma_2: [['10857046999023057135944570762232829481370756359578518086990519993285655852781', '11559732032986387107991004021392285783925812861821192530917403151452391805634'], ['1', '0'], ['1', '0']],
      vk_delta_2: [['10857046999023057135944570762232829481370756359578518086990519993285655852781', '11559732032986387107991004021392285783925812861821192530917403151452391805634'], ['1', '0'], ['1', '0']],
      vk_ic: [['20491192805390485299153009773594534940189261866228447918068658498370491509146', '204833930492403355294488957297707537393840626032930030137441661922681994285', '1']]
    };
    
    // Write the files
    fs.writeFileSync(
      path.join(buildDir, 'proving_key.zkey'),
      JSON.stringify(dummyProvingKey, null, 2)
    );
    
    fs.writeFileSync(
      path.join(buildDir, 'verification_key.json'),
      JSON.stringify(dummyVerificationKey, null, 2)
    );
    
    console.log('Test keys created successfully!');
    console.log('Files generated:');
    console.log('- proving_key.zkey (test key)');
    console.log('- verification_key.json (test key)');
    console.log('\nNote: These are test keys for development only!');
    console.log('For production, use a proper trusted setup ceremony.');
    
  } catch (error) {
    console.error('Error in setup:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  simpleSetup();
}

module.exports = { simpleSetup };