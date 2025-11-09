import { HardhatUserConfig } from 'hardhat/config'
import '@matterlabs/hardhat-zksync-solc'
import '@typechain/hardhat'
require('./hardhat-tasks')

import { task } from 'hardhat/config'
import { ethers } from 'ethers'

const config: HardhatUserConfig = {
  zksolc: {
    version: '1.5.7',
    settings: {},
  },
  defaultNetwork: 'zkSyncSepolia',
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncSepolia: {
      url: 'https://sepolia.era.zksync.dev',
      ethNetwork: 'sepolia',
      zksync: true,
      verifyURL: 'https://explorer.sepolia.era.zksync.dev/contract_verification',
    },
  },
  solidity: {
    version: '0.8.20',
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false,
    externalArtifacts: ['contracts/*.json'],
    dontOverrideCompile: false,
  },
}

export default config

// Helper function to run tasks with proper access
declare global {
  var __hardhat_context: any
}

task("deploy", "Deploy contracts to zkSync", async (taskArgs, hre) => {
  await runDeployment(hre);
});

async function runDeployment(hre: any) {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log('🚀 Deploying to zkSync Sepolia...');
  console.log('Using account:', deployer.address);
  
  // Deploy verifier
  const Verifier = await hre.ethers.getContractFactory('Groth16Verifier');
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  
  // Deploy registry
  const Registry = await hre.ethers.getContractFactory('AgeVerificationRegistry');
  const registry = await Registry.deploy(verifier.address);
  await registry.deployed();
  
  console.log('\n✅ Deployment successful!');
  console.log('Groth16Verifier:', verifier.address);
  console.log('AgeVerificationRegistry:', registry.address);
}