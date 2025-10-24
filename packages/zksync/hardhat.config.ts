import { HardhatUserConfig } from 'hardhat/config'
import '@matterlabs/hardhat-zksync-solc'
import '@typechain/hardhat'

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