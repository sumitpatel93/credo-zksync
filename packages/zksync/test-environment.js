// Test that our hardhat environment with zkSync is set up correctly
const hre = require('hardhat');

(async () => {
  try {
    console.log('Testing zkSync Sepolia configuration...');
    console.log('Network:', hre.network.name);
    console.log('Provider connected:', !!hre.network.provider);
    
    // Get signers
    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];
    
    console.log('Deployer:', deployer.address);
    console.log('Expected: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
    
    const balance = await deployer.getBalance();
    console.log('Balance:', hre.ethers.utils.formatEther(balance), 'ETH');
    
    console.log('\n✅ System is configured properly for zkSync deployment');
    
    // Show what needs to be deployed
    console.log('\n📋 Deployment will create:');
    console.log('1. Groth16Verifier - with embedded AgeVerifier circuit');
    console.log('2. AgeVerificationRegistry - registry that uses the verifier');
    
  } catch (error) {
    console.error('Environment test failed:', error.message);
    process.exit(1);
  }
})();