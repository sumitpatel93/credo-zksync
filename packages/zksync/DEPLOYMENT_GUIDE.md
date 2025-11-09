# Deployment Guide: AnonCreds to zkSync Age Verification

## Pre-Requisites
- zkSync Sepolia RPC: https://sepolia.era.zksync.dev
- Private Key: 292047fb31c143df111aaffffbcd2b4be45e3d1c25c06b5949d479475f282a4d  
- Deployer Address: 0x3712B46d02d0943aF5282BE56A2Bc21Ade7d1613

## Contracts Deployed
1. **Groth16Verifier** - Verifies AgeVerifier circuit proofs
2. **AgeVerificationRegistry** - Registry that uses the verifier for age checks

## Deployment Addresses (To be filled manually)
Once deployed, update these addresses in your code:

```json
{
  "network": "zkSyncSepolia",
  "contracts": {
    "Groth16Verifier": {
      "address": "0x...",
      "verifyURL": "https://explorer.sepolia.era.zksync.dev/"
    },
    "AgeVerificationRegistry": {
      "address": "0x...",
      "verifyURL": "https://explorer.sepolia.era.zksync.dev/"
    }
  }
}
```

## How the Circuit Works

The AgeVerifier circuit implements:
```circom
valid = age >= threshold
```

It uses Groth16 proof system where:
- age >= threshold → outputs 1 (TRUE)
- age < threshold → outputs 0 (FALSE)

## Integration Flow

1. **AnonCreds Credential** → contains age attribute
2. **Groth16 Proof Generation** → creates zk-proof of age ≥ threshold
3. **On-Chain Verification** → AgeVerificationRegistry verifies proof

## Usage Example

```javascript
// 1. Generate proof from AnonCreds credential
const proof = await AnonCredsGroth16Adapter.generateAgeProof(
  credential,
  ageThreshold
);

// 2. Convert to on-chain format
const formattedProof = await AnonCredsGroth16Adapter.convertFromAnonCreds(
  credential,
  ageThreshold
);

// 3. Verify on-chain
const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI);
const isValid = await registry.verifyAge(
  formattedProof.a,
  formattedProof.b,
  formattedProof.c,
  formattedProof.input[0]  // threshold
);
```

## Next Steps
1. Run `npm run compile` to ensure contracts are compiled
2. Deploy contracts on zkSync Sepolia mainnet/testnet
3. Update CONTRACT_ADDRESSES in your application
4. Test the complete flow with actual AnonCreds credentials