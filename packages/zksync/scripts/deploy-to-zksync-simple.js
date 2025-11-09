// Simple deployment script for zkSync Sepolia using ethers
async function main() {
  console.log('🚀 Deploying to zkSync Sepolia Testnet...');
  console.log('Using account: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
  
  // Get the signer accounts
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log('Connected wallet:', deployer.address);
  console.log('Network:', hre.network.name);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log('Balance:', ethers.formatEther(balance), 'ETH');
  
  console.log('\n' + '='.repeat(60));
  
  // Deploy Groth16Verifier first
  console.log('\n1. Deploying Groth16Verifier...');
  const VerifierArtifact = await hre.artifacts.readArtifact('Groth16Verifier');
  const Verifier = await ethers.getContractFactory('Groth16Verifier');
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  const verifierAddress = verifier.address;
  console.log('✅ Groth16Verifier deployed at:', verifierAddress);
  console.log('   Transaction hash:', verifier.deployTransaction.hash);
  
  // Deploy AgeVerificationRegistry
  console.log('\n2. Deploying AgeVerificationRegistry...');
  const RegistryArtifact = await hre.artifacts.readArtifact('AgeVerificationRegistry');
  const Registry = await ethers.getContractFactory('AgeVerificationRegistry');
  const registry = await Registry.deploy(verifierAddress);
  await registry.deployed();
  const registryAddress = registry.address;
  console.log('✅ AgeVerificationRegistry deployed at:', registryAddress);
  console.log('   Transaction hash:', registry.deployTransaction.hash);
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 DEPLOYMENT COMPLETE');
  console.log('='.repeat(60));
  console.log('\n✨ Successfully deployed to zkSync Sepolia:');
  console.log('   • Groth16Verifier:', verifierAddress);
  console.log('   • AgeVerificationRegistry:', registryAddress);
  console.log('\nAccount used: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
  
  // Save deployment info
  const fs = require('fs');
  const path = require('path');
  
  const deploymentInfo = {
    network: hre.network.name,
    chainId: await deployer.getChainId(),
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: Date.now(),
    date: new Date().toISOString(),
    deployerAddress: deployer.address,
    contracts: {
      Groth16Verifier: {
        address: verifierAddress,
        transactionHash: verifier.deployTransaction.hash,
        blockNumber: verifier.deployTransaction.blockNumber
      },
      AgeVerificationRegistry: {
        address: registryAddress,
        transactionHash: registry.deployTransaction.hash,
        blockNumber: registry.deployTransaction.blockNumber
      }
    }
  };
  
  // Ensure build directory exists
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  const deploymentPath = path.join(buildDir, 'deployment-info.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log('\n📁 Deployment info saved to:', deploymentPath);
  console.log('\n🎉 The AgeVerificationRegistry is now ready for on-chain verification!');
  console.log('\nNext steps:');
  console.log('- 1. Update contract addresses in code');
  console.log('- 2. Test AnonCreds → On-chain verification flow');
  console.log('- 3. Configure contract for your application');
}

// Execute deployment
main().then(() => {
  console.log('\n✅ Deployment process completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n🚨 Deployment failed:', error);
  process.exit(1);
});