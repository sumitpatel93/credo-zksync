const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 Deploying to zkSync Sepolia Testnet...');
  console.log('Using account from PRIVATE_KEY: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
  
  try {
    // Get signers (should use the configured account from private key)
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    
    console.log('Connected wallet:', deployer.address);
    console.log('Network:', network.name);
    console.log('Balance:', (await deployer.getBalance()).toString());
    
    // Deploy Groth16Verifier first
    console.log('\n1. Deploying Groth16Verifier...');
    const Verifier = await ethers.getContractFactory('Groth16Verifier');
    const verifier = await Verifier.deploy();
    await verifier.deployed();
    const verifierAddress = verifier.address;
    console.log('✅ Groth16Verifier deployed at:', verifierAddress);
    console.log('   Transaction hash:', verifier.deployTransaction.hash);
    
    // Deploy AgeVerificationRegistry  
    console.log('\n2. Deploying AgeVerificationRegistry...');
    const Registry = await ethers.getContractFactory('AgeVerificationRegistry');
    const registry = await Registry.deploy(verifierAddress);
    await registry.deployed();
    const registryAddress = registry.address;
    console.log('✅ AgeVerificationRegistry deployed at:', registryAddress);
    console.log('   Transaction hash:', registry.deployTransaction.hash);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 DEPLOYMENT COMPLETE');
    console.log('='.repeat(60));
    console.log('\nContracts successfully deployed on zkSync Sepolia:');
    console.log('   • Groth16Verifier:', verifierAddress);
    console.log('   • AgeVerificationRegistry:', registryAddress);
    console.log('\nAccount: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
    
    // Test deployment
    console.log('\n3. Testing deployment...');
    try {
      await registry.verifyAgeView(
        ['0', '0'],
        [['0', '0'], ['0', '0']], 
        ['0', '0'],
        18
      );
      console.log('✅ Contract verification interface works');
    } catch (error) {
      console.log('Test result:', error.message.substring(0, 100));
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: await deployer.getChainId(),
      blockNumber: await ethers.provider.getBlockNumber(),
      timestamp: Date.now(),
      date: new Date().toISOString(),
      deployerAddress: deployer.address,
      contracts: {
        Groth16Verifier: {
          address: verifierAddress,
          transactionHash: verifier.deployTransaction.hash
        },
        AgeVerificationRegistry: {
          address: registryAddress,
          transactionHash: registry.deployTransaction.hash
        }
      }
    };
    
    // Save deployment info
    if (!fs.existsSync('./build')) {
      fs.mkdirSync('./build', { recursive: true });
    }
    fs.writeFileSync('./build/deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log('\n✅ Deployment info saved to build/deployment.json');
    console.log('\n🎯 SUCCESS! The contracts are now deployed on zkSync Sepolia!');
    console.log('\nNext steps:');
    console.log('- 1. Update addresses in your code');
    console.log('- 2. Test AnonCreds → zkSync verification flow');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('\n✅ Deployment process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n🚨 Fatal deployment error:', error);
    process.exit(1);
  });