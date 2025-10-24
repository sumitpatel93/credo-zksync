const fs = require('fs');
const path = require('path');

// Create a test setup that mimics what integration tests expect
async function createTestSetup() {
  console.log('Creating test setup for integration tests...');
  
  const buildDir = path.join(__dirname, '../build');
  
  // Create mock proving and verification keys that work with the test structure
  const mockProvingKey = {
    protocol: "groth16",
    curve: "bn128",
    nPublic: 1,
    vk_alpha_1: ["20491192805390485299153009773594534940189261866228447918068658498370491509146", "204833930492403355294488957297707537393840626032930030137441661922681994285", "1"],
    vk_beta_2: [["637561435168872520640394826286896279362574404379430571522152080559648719488", "18162075897409609901965544275298808689052998710401566197405438621037551758839"], ["1", "0"], ["1", "0"]],
    vk_gamma_2: [["10857046999023057135944570762232829481370756359578518086990519993285655852781", "11559732032986387107991004021392285783925812861821192530917403151452391805634"], ["1", "0"], ["1", "0"]],
    vk_delta_2: [["10857046999023057135944570762232829481370756359578518086990519993285655852781", "11559732032986387107991004021392285783925812861821192530917403151452391805634"], ["1", "0"], ["1", "0"]],
    vk_ic: [["20491192805390485299153009773594534940189261866228447918068658498370491509146", "204833930492403355294488957297707537393840626032930030137441661922681994285", "1"]]
  };
  
  // Write verification key
  fs.writeFileSync(
    path.join(buildDir, 'verification_key.json'),
    JSON.stringify(mockProvingKey, null, 2)
  );
  
  // Create a binary-like proving key file
  // This is a simplified approach - in production, use proper ceremony
  const provingKeyData = Buffer.concat([
    Buffer.from('zkey'), // Magic header
    Buffer.from([0, 0, 0, 1]), // Version
    Buffer.from(JSON.stringify(mockProvingKey))
  ]);
  
  fs.writeFileSync(
    path.join(buildDir, 'proving_key.zkey'),
    provingKeyData
  );
  
  console.log('✓ Test setup created!');
  console.log('\nNote: This is a test setup for development.');
  console.log('For production, use proper trusted setup ceremony.');
  
  // Now let's test if we can at least run the adapter tests
  console.log('\nTesting adapter with current setup...');
  
  // Test that the files are in place
  const files = [
    'age_verifier.wasm',
    'age_verifier.r1cs',
    'proving_key.zkey',
    'verification_key.json'
  ];
  
  files.forEach(file => {
    const exists = fs.existsSync(path.join(buildDir, file));
    console.log(`${exists ? '✓' : '✗'} ${file}`);
  });
}

if (require.main === module) {
  createTestSetup();
}

module.exports = { createTestSetup };