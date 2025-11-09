// Hardhat tasks for deployment
task("deploy-zksync", "Deploy AgeVerificationRegistry to zkSync Sepolia")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    
    console.log('🚀 Deploying to zkSync Sepolia Testnet...');
    console.log('Using account:', deployer.address);
    console.log('Account balance:', (await deployer.getBalance()).toString());
    
    // Deploy Groth16Verifier first
    console.log('\n1. Deploying Groth16Verifier...');
    const Verifier = await ethers.getContractFactory('Groth16Verifier');
    const verifier = await Verifier.deploy();
    await verifier.deployed();
    const verifierAddress = verifier.address;
    console.log('✅ Groth16Verifier deployed at:', verifierAddress);
    
    // Deploy AgeVerificationRegistry
    console.log('\n2. Deploying AgeVerificationRegistry...');
    const Registry = await ethers.getContractFactory('AgeVerificationRegistry');
    const registry = await Registry.deploy(verifierAddress);
    await registry.deployed();
    const registryAddress = registry.address;
    console.log('✅ AgeVerificationRegistry deployed at:', registryAddress);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 DEPLOYMENT COMPLETE');
    console.log('='.repeat(60));
    console.log('\n✅ Successfully deployed to zkSync Sepolia Testnet:');
    console.log('   • Groth16Verifier:', verifierAddress);
    console.log('   • AgeVerificationRegistry:', registryAddress);
    console.log('\nUsing your account: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
    
    // Test deployment
    console.log('\n3. Testing deployment...');
    try {
      const testResult = await registry.verifyAgeView(
        ['0', '0'],
        [['0', '0'], ['0', '0']],
        ['0', '0'],
        18
      );
      console.log('✅ Contract test (should return false for empty proof):', testResult);
    } catch (error) {
      console.log('Contract test error:', error.message.substring(0, 200));
    }
    
    const deployment = {
      network: 'zkSync Sepolia',
      deployer: deployer.address,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      contracts: {
        Groth16Verifier: { address: verifierAddress, txHash: verifier.deployTransaction.hash },
        AgeVerificationRegistry: { address: registryAddress, txHash: registry.deployTransaction.hash }
      }
    };
    
    console.log('\n📁 Deployment info saved to build/deployment.json');
    const fs = require('fs');
    if (!fs.existsSync('./build')) fs.mkdirSync('./build');
    fs.writeFileSync('./build/deployment.json', JSON.stringify(deployment, null, 2));
    
    console.log('\n🎯 Mission accomplished! Contracts are deployed on zkSync Sepolia!');
    console.log('The AgeVerificationRegistry is ready for AnonCreds to on-chain verification!');
  });