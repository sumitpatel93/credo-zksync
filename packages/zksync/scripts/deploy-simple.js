
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());
  
  // Deploy Groth16Verifier first
  console.log('Deploying Groth16Verifier...');
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log('Groth16Verifier deployed to:', verifierAddress);
  
  // Deploy Registry with verifier address
  console.log('Deploying AgeVerificationRegistry...');
  const Registry = await ethers.getContractFactory("AgeVerificationRegistry");
  const registry = await Registry.deploy(verifierAddress);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log('AgeVerificationRegistry deployed to:', registryAddress);
  
  // Save deployment info
  const deploymentInfo = {
    timestamp: Date.now(),
    date: new Date().toISOString(),
    network: 'zkSync Sepolia',
    deployer: deployer.address,
    contracts: {
      Groth16Verifier: verifierAddress,
      AgeVerificationRegistry: registryAddress
    }
  };
  
  if (!fs.existsSync('./build')) {
    fs.mkdirSync('./build');
  }
  fs.writeFileSync('./build/deployment.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log();
  console.log('✅ Deployment successful!');
  console.log('Contracts deployed:');
  console.log('  Registry:', registryAddress);
  console.log('  Verifier:', verifierAddress);
  console.log('Deployment info saved to build/deployment.json');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});