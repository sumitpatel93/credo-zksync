const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function deployAgeVerificationRegistry() {
  console.log('🚀 Deploying AgeVerificationRegistry to zkSync Sepolia...')
  
  try {
    // Load verification key for constructor
    const verificationKeyPath = path.join(__dirname, '..', 'build', 'verification_key.json');
    const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf-8'));
    
    // Configure zkSync provider
    const providerUrl = 'https://sepolia.era.zksync.dev';
    const provider = new ethers.JsonRpcProvider(providerUrl);
    
    // Create wallet from provided private key
    // Note: This private key should be loaded from environment variables in production
    const privateKey = process.env.ZKSYNC_PRIVATE_KEY || '292047fb31c143df111aaffffbcd2b4be45e3d1c25c06b5949d479475f282a4d';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const deployerAddress = wallet.address; // 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613
    console.log('Deployer address:', deployerAddress)
    
    // Load contract artifacts
    const contractArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'contracts', 'AgeVerificationRegistry.json'), 'utf-8'));
    
    // Filter ABI to be compatible
    const abi = contractArtifact.abi.map(item => {
      const cleanedItem = { ...item };
      delete cleanedItem._format;
      delete cleanedItem._hex;
      return cleanedItem;
    });
    
    console.log('Creating contract factory...')
    
    // Create contract factory
    const factory = new ethers.ContractFactory(
      abi,
      contractArtifact.bytecode,
      wallet
    );
    
    // Convert Solidity verification key to acceptable format
    // The Solidity contract might need the data in a specific format
    const vkData = {
      IC: verificationKey.IC.map(g1 => [g1[0], g1[1], g1[2].toString()]),
      vk_a_1: verificationKey.vk_a_1 || verificationKey.IC[0].slice(0, 2),
      vk_b_2: verificationKey.vk_b_2 || verificationKey.vk_beta_2,
      vk_f: verificationKey.vk_f || verificationKey.IC[1].slice(0, 2),\n      vk_gamma_2: verificationKey.vk_gamma_2 || verificationKey.vk_gamma_2
    };
    
    // Get deployer address properties
    console.log('Getting balance...')
    const balance = await wallet.getBalance();
    const balanceInEth = ethers.formatEther(balance);
    console.log(`Balance: ${balanceInEth} ETH`);
    
    console.log('Calculating gas estimate...')
    
    try {
      // Estimate gas
      const gasEstimate = await factory.getDeployTransaction(vkData);
      console.log('Contract deployment data prepared.')
    } catch (error) {
      console.log('Gas estimation notes:', error.message);
    }
    
    console.log('Deploying contract with verification key...')
    
    // Deploy contract
    const contract = await factory.deploy(vkData);
    console.log('Deployment transaction sent.')
    
    // Wait for confirmation
    console.log('Waiting for deployment confirmation...')
    const receipt = await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Contract deployed successfully!')
    console.log('📋 Contract Details:');
    console.log('   Address:', contractAddress.toString());
    console.log('   Transaction Hash:', receipt.hash);
    console.log('   Block Number:', receipt.blockNumber);
    console.log('   Gas Used:', receipt.gasUsed.toString());
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress.toString(),
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      deployer: deployerAddress,
      timestamp: Date.now(),
      verificationKeyHash: verificationKey.IC[0][0] + verificationKey.IC[0][1]
    };
    
    const deploymentPath = path.join(__dirname, '..', 'build', 'deployment-info.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log('\n✨ Deployment complete!')
    console.log('Contract is ready for on-chain age verification.');
    
    return {
      contractAddress,
      ...deploymentInfo
    };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    throw error;
  }
}

// DEPLOYMENT NOTES:
// - Contract expects verification key in specific format
// - Integration contracts might be needed
// - Environment variables should be used for private keys in production

deployAgeVerificationRegistry()
  .then(result => {
    console.log('\nDeployment successful:', {
      address: result.contractAddress.toString(),
      hash: result.transactionHash
    });
    process.exit(0);
  })
  .catch(error => {
    console.error('\nDeployment failed:', error);
    process.exit(1);
  });