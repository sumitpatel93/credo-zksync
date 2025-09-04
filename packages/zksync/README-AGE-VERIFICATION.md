# Age Verification with zkSync and AnonCreds

This package provides zero-knowledge age verification using AnonCreds credentials on zkSync Layer2.

## Overview

The system allows users to:
- **Prove age ≥ threshold** without revealing actual age
- **Use existing AnonCreds credentials** for verification
- **Verify on-chain** with minimal gas costs (~$5-10)

## Architecture

```
AnonCreds Credential → Groth16 Proof → On-chain Verification
```

## Components

### 1. Circuit (`circuits/age_verifier.circom`)
- **Simple age verification**: Proves age ≥ threshold
- **Zero-knowledge**: Doesn't reveal actual age
- **Groth16 proof system**: Efficient on zkSync

### 2. Solidity Contracts
- **AgeVerifier.sol**: Auto-generated verifier from circuit
- **AgeVerificationRegistry.sol**: Registry integration with events

### 3. TypeScript Adapter (`src/AnonCredsGroth16Adapter.ts`)
- **AnonCreds integration**: Converts credentials to proofs
- **Proof generation**: Creates Groth16 proofs
- **Contract formatting**: Formats proofs for Solidity

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Circuit
```bash
npm run compile:circuit
```

### 3. Setup Trusted Ceremony
```bash
npm run setup:trusted
```

### 4. Run Tests
```bash
npm run test:all
```

## Usage Example

```typescript
import { AnonCredsGroth16Adapter } from '@credo-ts/zksync'

// Create adapter
const adapter = new AnonCredsGroth16Adapter()

// Convert AnonCreds credential to proof
const credential = {
  attributes: [{ name: 'age', value: '25' }]
}
const proof = await adapter.convertFromAnonCreds(credential, 18)

// Verify on-chain
const registry = new ethers.Contract(address, abi, signer)
const isValid = await registry.verifyAgeView(
  proof.a,
  proof.b,
  proof.c,
  18
)
```

## Testing

### Circuit Tests
```bash
npm test packages/zksync/src/__tests__/AgeVerifier.test.ts
```

### Integration Tests
```bash
npm test packages/zksync/src/__tests__/integration.test.ts
```

### All Tests
```bash
npm run test:all
```

## Gas Costs

- **Circuit compilation**: One-time setup
- **Proof generation**: ~50ms local
- **On-chain verification**: ~100k gas ($5-10 on zkSync)

## Development

### Project Structure
```
packages/zksync/
├── circuits/
│   └── age_verifier.circom
├── contracts/
│   ├── AgeVerifier.sol
│   └── AgeVerificationRegistry.sol
├── scripts/
│   ├── compile-circuit.js
│   └── setup-trusted.js
├── src/
│   ├── AnonCredsGroth16Adapter.ts
│   └── __tests__/
└── build/
    ├── age_verifier.wasm
    ├── proving_key.zkey
    └── verification_key.json
```

### Adding New Thresholds
Modify the circuit's `age_threshold` public input to support different age requirements.