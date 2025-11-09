const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying AgeVerificationRegistry and Groth16Verifier to zkSync Sepolia...');
  
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log('Using account:', deployer.address);
  console.log('Network:', network.name);
  const balance = await deployer.getBalance();
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  
  console.log('\n' + '='.repeat(60));
  
  // Deploy Groth16Verifier  
  console.log('1. Deploying Groth16Verifier...');
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log('✅ Deployment tx:', verifier.deployTransaction.hash);
  console.log('   Address:', verifier.address);
  
  // Deploy AgeVerificationRegistry
  console.log('\n2. Deploying AgeVerificationRegistry...');
  const Registry = await ethers.getContractFactory("AgeVerificationRegistry");
  const registry = await Registry.deploy(verifier.address);
  await registry.deployed();
  console.log('✅ Deployment tx:', registry.deployTransaction.hash);
  console.log('   Address:', registry.address);
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 DEPLOYMENT COMPLETE');
  console.log('='.repeat(60));
  
  console.log('\n🎯 Successfully deployed to zkSync Sepolia:');
  console.log('   • Groth16Verifier:', verifier.address);
  console.log('   • AgeVerificationRegistry:', registry.address);
  console.log('\nUsing account: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
  
  // Save deployment addresses
  const fs = require('fs');
  const path = require('path');
  
  const deployment = {
    timestamp: Date.now(),
    date: new Date().toISOString(),
    network: network.name,
    deployerAddress: deployer.address,
    contracts: {
      Groth16Verifier: {
        address: verifier.address,
        transactionHash: verifier.deployTransaction.hash
      },
      AgeVerificationRegistry: {
        address: registry.address,
        transactionHash: registry.deployTransaction.hash
      }
    }
  };
  
  // Ensure build directory exists  
  const buildDir = path.join(__dirname, '../..', 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  // Save deployment info
  fs.writeFileSync(
    path.join(buildDir, 'deployment.json'),
    JSON.stringify(deployment, null, 2)
  );
  
  console.log('\n✅ Deployment info saved to: build/deployment.json');
  console.log('\n🎊 Mission accomplished! 🎊');
}

main()
  .then(() => console.log('\n✅ Deployment completed successfully!'))
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  });