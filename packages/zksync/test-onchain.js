const { ethers } = require('ethers')

// zkSync Sepolia testnet configuration
const ZKSYNC_SEPOLIA_RPC = 'https://sepolia.era.zksync.dev'
const REGISTRY_ADDRESS = '0x4Ce8a725c63048bB42c95b064Ce3262790F1b80D'
const AGE_VERIFIER_ADDRESS = '0x2fe3701d02deB6B22F5B293aC0dd91f601A2B6D9'

// Contract ABI
const REGISTRY_ABI = [
  'function verifyAgeView(uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256 minAge) external view returns (bool)',
  'function verifyAge(uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c, uint256 minAge) external returns (bool)',
  'event AgeVerified(address indexed user, uint256 minAge, uint256 timestamp)'
]

const AGE_VERIFIER_ABI = [
  'function verifyProof(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[1] memory input) public view returns (bool)'
]

async function testOnChainVerification() {
  try {
    console.log('🔍 Testing on-chain verification...')
    
    const provider = new ethers.JsonRpcProvider(ZKSYNC_SEPOLIA_RPC)
    
    // Create a signer for transaction testing (using a random wallet)
    const testWallet = ethers.Wallet.createRandom()
    const signer = testWallet.connect(provider)
    console.log('📍 Test wallet address:', signer.address)
    
    const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider)
    const registryWithSigner = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer)
    
    // Check contract deployment
    const registryCode = await provider.getCode(REGISTRY_ADDRESS)
    const verifierCode = await provider.getCode(AGE_VERIFIER_ADDRESS)
    
    console.log('✅ Registry deployed:', registryCode !== '0x')
    console.log('✅ Verifier deployed:', verifierCode !== '0x')
    
    // Test network connection
    const blockNumber = await provider.getBlockNumber()
    console.log('✅ Connected to zkSync Sepolia at block:', blockNumber)
    
    // Test view function (gas-free, no transaction)
    console.log('🔍 Testing view function...')
    const viewResult = await registry.verifyAgeView(
      ['0x0', '0x0'],
      [['0x0', '0x0'], ['0x0', '0x0']],
      ['0x0', '0x0'],
      18
    ).catch(e => {
      console.log('❌ View call failed (expected with invalid proof):', e.message)
      return false
    })
    console.log('📊 View function result:', viewResult)
    
    // Test transaction (will fail due to invalid proof, but shows transaction flow)
    console.log('🔍 Testing transaction flow...')
    try {
      const tx = await registryWithSigner.verifyAge(
        ['0x0', '0x0'],
        [['0x0', '0x0'], ['0x0', '0x0']],
        ['0x0', '0x0'],
        18,
        { gasLimit: 100000 }
      )
      
      console.log('📤 Transaction sent!')
      console.log('📝 Transaction hash:', tx.hash)
      console.log('⏳ Awaiting confirmation...')
      
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed!')
      console.log('📋 Block number:', receipt.blockNumber)
      console.log('💰 Gas used:', receipt.gasUsed.toString())
      console.log('🔗 Transaction link:', `https://sepolia.explorer.zksync.io/tx/${tx.hash}`)
      
    } catch (error) {
      console.log('❌ Transaction failed (expected with invalid proof):', error.message)
      console.log('📋 Transaction hash would be generated for valid proofs')
    }
    
    // Test contract interaction
    console.log('📋 Summary:')
    console.log('- AgeVerifier.sol:', AGE_VERIFIER_ADDRESS)
    console.log('- AgeVerificationRegistry.sol:', REGISTRY_ADDRESS)
    console.log('- Network: zkSync Sepolia testnet')
    console.log('- RPC:', ZKSYNC_SEPOLIA_RPC)
    console.log('- Explorer: https://sepolia.explorer.zksync.io')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

console.log('Starting on-chain verification test...')
testOnChainVerification()