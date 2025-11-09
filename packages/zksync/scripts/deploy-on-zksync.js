// Deploy AgeVerificationRegistry to zkSync Sepolia Testnet
const { zkSyncProvider, Provider, Wallet } = require('zksync-ethers');
const { ContractFactory, Web3Provider } = require('zksync-ethers');
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const PRIVATE_KEY = '0x292047fb31c143df111aaffffbcd2b4be45e3d1c25c06b5949d479475f282a4d';
const RPC_URL = 'https://sepolia.era.zksync.dev';
const DEPLOYER_ADDRESS = '0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613';

async function deploy() {
  console.log('🚀 Deploying AgeVerificationRegistry to zkSync Sepolia...')
  
  try {
    // Create provider
    const provider = new Provider(RPC_URL);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('Using wallet:', wallet.address);
    
    // Check balance
    const balance = await wallet.getBalance();
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    
    // Load contract artifacts
    const registryArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts-zk', 'contracts', 'AgeVerificationRegistry.sol', 'AgeVerificationRegistry.json'),
      'utf-8'
    ));
    
    const verifierArtifact = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'artifacts-zk', 'contracts', 'AgeVerifierGenerated.sol', 'Groth16Verifier.json'),
      'utf-8'
    ));
    
    console.log('Contract artifacts loaded.')
    console.log('Registry artifact name:', registryArtifact.contractName || registryArtifact.sourceName);
    console.log('Verifier artifact name:', verifierArtifact.contractName || verifierArtifact.sourceName);
    
    // Create contract factory for registry
    const registryFactory = new ContractFactory(
      registryArtifact.abi,
      registryArtifact.bytecode,
      wallet
    );
    
    console.log('Factory created, estimating gas...')
    
    // Estimate deployment
    const estimatedGas = await factory.getDeployTransaction();
    console.log('Gas estimate:', estimatedGas);
    
    console.log('Deploying contract...')
    
    // Deploy!
    const contract = await registryFactory.deploy();
    console.log('Transaction sent:', contract.deploymentTransaction().hash);
    
    // Wait for confirmation
    console.log('Waiting for confirmation...')
    const receipt = await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log('✅ Contract deployed successfully!')
    console.log('📝 Contract Details:');
    console.log('   Address:', contractAddress);
    console.log('   Transaction Hash:', receipt.hash);
    console.log('   Block Number:', receipt.blockNumber);
    console.log('   Gas Used:', receipt.gasUsed.toString());
    
    // Save deployment info
    const deploymentInfo = {
      network: DEPLOYMENT_CONFIG.network,
      contractAddress,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      deployer: wallet.address,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    const deploymentPath = path.join(__dirname, '..', 'build', 'deployment-info.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log('\nDeployment info saved to:', deploymentPath);
    console.log('Create zkSync Age Verification Registry contract is NOT found.');
    console.log('AgeVerificationRegistry ready for on-chain verification on zkSync Sepolia!')
    
    return {
      status: 'success',
      address: contractAddress,
      hash: receipt.hash
    };
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('Details:', error.shortMessage || error.reason || error);
    if (error.code) console.error('Error Code:', error.code);
    throw error;
  }
}

// DEPLOY - environment check and error handling
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('zkSync Sepolia Deployment');
    console.log('='.repeat(60));
    console.log('Private Key: PRESENT' + (process.env.ZKSYNC_PRIVATE_KEY ? ' ✓' : ' ✗'));
    console.log('Target Network: zkSync Sepolia');
    console.log('Deployer: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613' || process.env.DEPLOYER_ADDRESS);
    console.log('-'.repeat(60));
    
    const result = await deploy();
    
    console.log('\n🎉 Successfully deployed AgeVerificationRegistry:');
    console.log('Address:', result.address);
    console.log('Tx Hash:', result.hash);
    console.log('\nRun npm test to verify the deployment.');
    
  } catch (error) {
    console.error('\n🚨 FATAL ERROR:', error);
    process.exit(1)
  }
}

if (require.main === module) {
  main();
}

module.exports = { deployToZkSync: main };