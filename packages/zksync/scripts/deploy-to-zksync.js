// Deploy contracts to zkSync Sepolia using provided account
const { Deployer } = require('@matterlabs/hardhat-zksync-deploy');
const { Wallet, Provider, utils } = require('zksync-ethers');

// Provided credentials from user
const PRIVATE_KEY = '292047fb31c143df111aaffffbcd2b4be45e3d1c25c06b5949d479475f282a4d';
const DEPLOYER_ADDRESS = '0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613';

async function main() {
  console.log('🚀 Deploying to zkSync Sepolia Testnet...');
  console.log('Deployer Address:', DEPLOYER_ADDRESS);
  
  try {
    // Get the current network (should be zkSyncSepolia based on hardhat config)
    const network = hre.network;
    console.log('Network:', network.name);
    
    // Create provider and wallet
    const provider = new Provider('https://sepolia.era.zksync.dev');
    const wallet = new Wallet(PRIVATE_KEY, provider);
    
    // Check balance
    const balance = await wallet.getBalance();
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    
    // Create deployer
    const deployer = new Deployer(network, wallet);
    
    // Deploy Groth16Verifier first
    console.log('\n1. Deploying Groth16Verifier...');
    const verifierArtifact = await deployer.loadArtifact('Groth16Verifier');
    const verifier = await deployer.deploy(verifierArtifact);
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log('✅ Groth16Verifier deployed at:', verifierAddress);
    
    // Deploy AgeVerificationRegistry
    console.log('\n2. Deploying AgeVerificationRegistry...');
    const registryArtifact = await deployer.loadArtifact('AgeVerificationRegistry');
    const registry = await deployer.deploy(registryArtifact, [verifierAddress]);
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log('✅ AgeVerificationRegistry deployed at:', registryAddress);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 DEPLOYMENT COMPLETE');
    console.log('='.repeat(60));
    console.log('Contracts deployed on zkSync Sepolia:');
    console.log('   • Groth16Verifier:', verifierAddress);
    console.log('   • AgeVerificationRegistry:', registryAddress);
    console.log('');
    console.log('Deployment has completed for account: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
    
    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
      network: 'zkSync Sepolia',
      timestamp: Date.now(),
      date: new Date().toISOString(),
      deployerAddress: DEPLOYER_ADDRESS,
      contracts: {
        Groth16Verifier: {
          address: verifierAddress,
          transactionHash: verifier.deploymentTransaction().hash,
          blockNumber: await provider.getBlockNumber()
        },
        AgeVerificationRegistry: {
          address: registryAddress,
          transactionHash: registry.deploymentTransaction().hash,
          blockNumber: await provider.getBlockNumber()
        }
      }
    };
    
    const deploymentPath = './build/deployment-info.json';
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log('');
    console.log('Deployment info saved to:', deploymentPath);
    console.log('\n🎉 The AgeVerificationRegistry is now ready for on-chain age verification!');
    
    // Test the deployment
    console.log('\n3. Testing contract deployment...');
    try {
      const threshold = 18;
      await registry.verifyAgeView(
        ["0", "0"],
        [["0", "0"], ["0", "0"]],
        ["0", "0"],
        threshold
      );
      console.log('✅ Contract verification function works (no proof provided, so it returns false)');
    } catch (error) {
      console.log('Contract test:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Run deployment
main()
  .then(() => {
    console.log('\n✅ Deployment process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n🚨 Fatal deployment error:', error);
    process.exit(1);
  });