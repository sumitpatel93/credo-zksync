const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy Groth16Verifier first
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  
  console.log("Groth16Verifier deployed to:", verifier.address);
  
  // Deploy AgeVerificationRegistry with the verifier
  const Registry = await ethers.getContractFactory("AgeVerificationRegistry");
  const registry = await Registry.deploy(verifier.address);
  await registry.deployed();
  
  console.log("AgeVerificationRegistry deployed to:", registry.address);
  console.log("Deployment complete! Now deployed to zkSync Sepolia with your account.");
  
  // Save deployment info
  const fs = require('fs');
  const deployment = {
    network: "zkSyncSepolia",
    deployer: deployer.address,
    contracts: {
      Groth16Verifier: verifier.address,
      AgeVerificationRegistry: registry.address
    }
  };
  fs.writeFileSync('./build/deployment.json', JSON.stringify(deployment, null, 2));
  
  console.log("Deployment info saved to build/deployment.json");
  console.log("Contracts are ready for AnonCreds to on-chain verification!");
}

main()
  .then(() => {
    console.log('\nDeployment successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nDeployment failed:', error.message);
    process.exit(1);
  });