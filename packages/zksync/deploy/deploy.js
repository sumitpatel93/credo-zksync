const { ethers } = require("hardhat");

async function main() {
  const PRIVATE_KEY = "292047fb31c143df111aaffffbcd2b4be45e3d1c25c06b5949d479475f282a4d";
  
  console.log('🚀 Deploying to zkSync Sepolia Testnet...');
  console.log('Using private key for account: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
  
  // Get network information
  console.log('Network:', network.name);
  console.log('Chain ID:', await network.provider.send('eth_chainId'));
  
  // Get signers (should include our configured account)
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address:', deployer.address);
  
  // Verify this is the expected account
  if (deployer.address.toLowerCase() !== "0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613".toLowerCase()) {
    console.log('⚠️  Warning: using different account than expected!');
    console.log('Expected: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
    console.log('Actual:', deployer.address);
  }
  
  console.log('Balance:', (await deployer.getBalance()).toString(), 'wei');
  
  console.log('\n' + '='.repeat(60));
  
  // Deploy Groth16Verifier
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
  console.log('📋 DEPLOYMENT SUMMARY');
  console.log('='.repeat(60));
  console.log('\nDeployed on zkSync Sepolia Testnet:');
  console.log('   • Groth16Verifier:', verifierAddress);
  console.log('   • AgeVerificationRegistry:', registryAddress);
  console.log('\nAccount used: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613');
  
  // Save deployment addresses
  const fs = require('fs');
  const deployment = {
    network: network.name,
    deployer: deployer.address,
    timestamp: Date.now(),
    date: new Date().toISOString(),
    contracts: {
      Groth16Verifier: verifierAddress,
      AgeVerificationRegistry: registryAddress
    }
  };
  
  fs.writeFileSync('./build/deployment.json', JSON.stringify(deployment, null, 2));
  console.log('\n✅ Deployment addresses saved to build/deployment.json');
  
  console.log('\n🎯 Mission Accomplished!');
  console.log('The AgeVerificationRegistry is ready for AnonCreds to on-chain age verification!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});