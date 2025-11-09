// Direct deployment for zkSync Sepolia
const main = async () => {
  console.log('🚀 Deploying contracts to zkSync Sepolia...');
  const hre = await import('hardhat');
  const { ethers } = hre;
  
  const [deployer] = await ethers.getSigners();
  
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());
  
  // Deploy Groth16Verifier first
  console.log('\n1. Deploying Groth16Verifier...');
  const Verifier = await ethers.getContractFactory('Groth16Verifier');
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log('✅ Groth16Verifier deployed to:', verifier.address);
  
  // Deploy AgeVerificationRegistry
  console.log('\n2. Deploying AgeVerificationRegistry...');
  const Registry = await ethers.getContractFactory('AgeVerificationRegistry');
  const registry = await Registry.deploy(verifier.address);
  await registry.deployed();
  console.log('✅ AgeVerificationRegistry deployed to:', registry.address);
  
  // Test deployment
  console.log('\n3. Testing contract deployment...');
  const testResult = await registry.verifyAgeView(
    ['0', '0'],
    [['0', '0'], ['0', '0']],
    ['0', '0'],
    18
  );
  console.log('Contract test (empty proof):', testResult);
  
  console.log('\n🎊 Deployment Summary 🎊');
  console.log('Network: zkSync Sepolia Testnet');
  console.log('Groth16Verifier:', verifier.address);
  console.log('AgeVerificationRegistry:', registry.address);
  console.log('\nThe AgeVerificationRegistry is ready for AnonCreds to on-chain verification!');
};

(async () => {
  try {
    await main();
    console.log('\n✅ Deployment completed successfully!');
  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
})();