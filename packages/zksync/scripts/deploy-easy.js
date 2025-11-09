const hre = require("hardhat");
const ethers = require('ethers');

async function main() {
  console.log('🚀 Deploying AgeVerificationRegistry to zkSync Sepolia...');
  
  try {
    // Get signers from the configured network
    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];
    
    console.log('Deployer address:', deployer.address);
    console.log('Network:', hre.network.name);
    
    // Get the contract factory
    const RegistryFactory = await hre.ethers.getContractFactory("AgeVerificationRegistry");
    
    console.log('Deploying AgeVerificationRegistry...')
    
    // Deploy the contract
    const registry = await RegistryFactory.deploy();
    await registry.waitForDeployment();
    
    const registryAddress = await registry.getAddress();
    console.log('✅ Deployed at:', registryAddress);
    console.log('Transaction hash:', registry.deploymentTransaction().hash);
    
    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: registryAddress,
      transactionHash: registry.deploymentTransaction().hash,
      deployer: deployer.address,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    const fs = require('fs');
    const path = require('path');
    const deploymentPath = path.join(__dirname, '..', 'build', 'deployment.json');
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log('\n✅ Deployment successful!');
    console.log('Contract address:', registryAddress);
    console.log('Deployment info saved to:', deploymentPath);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});