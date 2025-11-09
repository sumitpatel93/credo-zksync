const { ethers } = require('hardhat');

// This ensures ethers is available in hardhat tasks
if (typeof window === 'undefined') {
  global.ethers = ethers;
}