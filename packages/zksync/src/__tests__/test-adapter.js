const { AnonCredsGroth16Adapter } = require('../AnonCredsGroth16Adapter.ts');

async function testAdapter() {
  console.log('Testing AnonCredsGroth16Adapter with valid keys...');
  
  try {
    const adapter = new AnonCredsGroth16Adapter();
    
    console.log('Testing proof generation...');
    const proof = await adapter.generateAgeProof(25, 18);
    
    console.log('✓ Proof generated successfully!');
    console.log('Proof structure:');
    console.log('- Protocol:', proof.proof.protocol);
    console.log('- Curve:', proof.proof.curve);
    console.log('- Public signals:', proof.publicSignals);
    
    console.log('\nTesting local verification...');
    const isValid = await adapter.verifyLocal(proof, 18);
    console.log('✓ Local verification:', isValid);
    
    console.log('\n✅ Adapter test complete!');
    
  } catch (error) {
    console.error('Adapter test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

if (require.main === module) {
  testAdapter();
}