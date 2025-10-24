const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

async function setupWithExample() {
  console.log('Setting up with example approach...');
  
  try {
    const buildDir = path.join(__dirname, '../build');
    const ceremonyPath = path.join(__dirname, '../ceremony');
    
    // Create directories
    if (!fs.existsSync(ceremonyPath)) fs.mkdirSync(ceremonyPath, { recursive: true });
    
    // Check for circuit file
    const circuitFile = path.join(buildDir, 'age_verifier.r1cs');
    if (!fs.existsSync(circuitFile)) {
      console.error('Circuit not compiled. Run compile:circuit first.');
      process.exit(1);
    }
    
    // Try to create a minimal setup
    console.log('Creating minimal setup...');
    
    // First, let's try to understand the zkey structure
    console.log('Checking if we can create a valid zkey structure...');
    
    // Create a powers of tau file with reduced power
    const ptauFile = path.join(ceremonyPath, 'pot10_final.ptau');
    
    try {
      // Generate a small powers of tau
      console.log('Generating powers of tau...');
      await snarkjs.powersOfTau.newAccumulator('bn128', 10, ptauFile);
      
      // Contribute
      await snarkjs.powersOfTau.contribute(ptauFile, ptauFile + '.tmp', 'test', 'test');
      fs.renameSync(ptauFile + '.tmp', ptauFile);
      
      // Prepare phase 2
      await snarkjs.powersOfTau.preparePhase2(ptauFile, ptauFile + '.final');
      fs.renameSync(ptauFile + '.final', ptauFile);
      
      console.log('Powers of tau ceremony completed.');
      
      // Now create zkey
      const zkeyFile = path.join(buildDir, 'proving_key.zkey');
      await snarkjs.zKey.newZKey(circuitFile, ptauFile, zkeyFile);
      console.log('✓ ZKey created successfully!');
      
      // Export verification key
      const vKeyFile = path.join(buildDir, 'verification_key.json');
      await snarkjs.zKey.exportVerificationKey(zkeyFile, vKeyFile);
      console.log('✓ Verification key exported!');
      
      // Test the setup
      console.log('\nTesting the setup...');
      const wasmPath = path.join(buildDir, 'age_verifier.wasm');
      const inputs = { age: 25, age_threshold: 18 };
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath,
        zkeyFile
      );
      
      console.log('✓ Proof generated successfully!');
      console.log('Public signals:', publicSignals);
      
      // Verify
      const vKey = JSON.parse(fs.readFileSync(vKeyFile, 'utf-8'));
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
      if (isValid) {
        console.log('✓ Proof verified successfully!');
        console.log('\n🎉 Setup complete! Keys are ready for testing.');
      } else {
        console.log('✗ Proof verification failed!');
      }
      
    } catch (ptauError) {
      console.error('Powers of tau error:', ptauError.message);
      
      // Alternative: Try to find a working ptau file online
      console.log('\nTrying alternative approach...');
      
      // Let's try with a different power level
      try {
        const ptauFile2 = path.join(ceremonyPath, 'pot08_final.ptau');
        await snarkjs.powersOfTau.newAccumulator('bn128', 8, ptauFile2);
        
        // Use this for zkey generation
        const zkeyFile = path.join(buildDir, 'proving_key.zkey');
        await snarkjs.zKey.newZKey(circuitFile, ptauFile2, zkeyFile);
        
        console.log('✓ Alternative zKey created!');
        
      } catch (altError) {
        console.error('Alternative also failed:', altError.message);
        
        // Final fallback - create a mock setup
        console.log('\nCreating mock setup for development...');
        createMockSetup();
      }
    }
    
  } catch (error) {
    console.error('Setup error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function createMockSetup() {
  console.log('Creating mock setup for development...');
  
  const buildDir = path.join(__dirname, '../build');
  
  // Create a mock verification key structure
  const mockVKey = {
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
    JSON.stringify(mockVKey, null, 2)
  );
  
  // For proving key, we'll create a note that it's needed
  console.log('\nCreated mock verification key.');
  console.log('⚠️  Note: Real proving key generation requires proper ceremony.');
  console.log('Current setup allows testing witness calculation but not full proof generation.');
}

if (require.main === module) {
  setupWithExample();
}