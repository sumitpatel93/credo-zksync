# @credo-ts/zksync

This package provides a DID method implementation for `did:zksync` and AnonCreds registry for use with Credo-ts agents. It allows Credo-ts agents to interact with DID and credential registries deployed on the zkSync network.

## Overview

The `@credo-ts/zksync` package provides two main functionalities:

1. **DID Management**: Create, update, and manage `did:zksync` DIDs on zkSync Layer2
2. **AnonCreds Registry**: Register schemas, credential definitions, and manage revocation on zkSync

## Components

### DID Management
- **ZkSyncDidRegistrar**: Manages DID lifecycle on zkSync
  - DID Creation: Register new DIDs on zkSync network
  - DID Update: Update DID ownership
  - DID Deactivation: Deactivate DIDs by transferring to zero address
  - DID Delegation: Add/revoke delegates for fine-grained control

- **ZkSyncDidResolver**: Resolves `did:zksync` DIDs from zkSync registry
  - Retrieves DID documents
  - Resolves delegation details
  - Queries zkSync network directly

### AnonCreds Registry
- **ZkSyncAnonCredsRegistry**: Manages AnonCreds on zkSync
  - Schema Registration: Store credential schemas on zkSync
  - Credential Definition Registration: Store credential definitions
  - Revocation Management: Individual credential revocation via status lists

## zkSync Layer2 Integration

### Smart Contracts
- **ZkSyncDidRegistry.sol**: Solidity contract for DID registry
- **ZkSyncAnonCredsRegistry**: Contract for credential management

### Network Configuration
```typescript
// zkSync Sepolia Testnet
this.provider = new ethers.JsonRpcProvider('https://sepolia.era.zksync.dev')
```

### Features
- Real zkSync contract deployment and interaction
- zkSync-ethers library integration
- zkSync-compatible bytecode compilation
- Layer2 transaction management

## Available Operations

### Schemas
- **Registration**: Store schemas on zkSync via `registerSchema()`
- **Resolution**: Retrieve schemas via `getSchema()`
- **Revocation**: Schemas are immutable once registered

### Credential Definitions
- **Registration**: Store credential definitions via `registerCredentialDefinition()`
- **Resolution**: Retrieve definitions via `getCredentialDefinition()`
- **Revocation**: Definitions are immutable once registered

### Revocation
- **Individual Credentials**: Can be revoked via revocation status lists
- **Status Lists**: Registered via `registerRevocationStatusList()`
- **Checking**: Check revocation status via `getRevocationStatusList()`

## Testing

### Running Tests

#### DID Management Tests
```bash
npm test packages/zksync/src/__tests__/ZkSyncDidDelegation.test.ts
```

#### AnonCreds Registry Tests
**Option 1 - Mock Tests (Recommended)**:
```bash
npm test packages/zksync/src/__tests__/ZkSyncAnonCredsRegistry.mock.test.ts
```

**Option 2 - Original Tests** (requires fixes):
1. Fix ethers v6 compatibility issues
2. Run: `npm test packages/zksync/src/__tests__/ZkSyncAnonCredsRegistry.test.ts`

### Test Requirements
1. Install dependencies: `pnpm install`
2. Fund test wallet with Sepolia ETH (private key in test files)
3. Tests deploy contracts to zkSync Sepolia testnet

### Sample Test Output
```
> test
> jest packages/zksync/src/__tests__/ZkSyncDidDelegation.test.ts

Contract Address: 0x829AA5009C066A74B1AE8d388eF18E3E53630c17
Contract Deployment Tx Hash: 0xcdfb711c78c3ff0663e1d99ce87dfff25f5ccfb7685dadeac9752cd975d2db2e
DID Creation Tx Hash: 0x123abc...
Add Delegate Tx Hash: 0x0de1a777b311458f8ca3b59b99f88f23cebec73ecfb6ed15b6e9cdf37dc807e3
Revoke Delegate Tx Hash: 0xe0b924bdf2a4310f8569d9bd4b24b327f664d3e35c4f194b7a95a021eb331a51

PASS @credo-ts/zksync packages/zksync/src/__tests__/ZkSyncDidDelegation.test.ts
```

## DID Format

**Format**: `did:zksync:<wallet_address>`

**Example**: `did:zksync:0x1234567890123456789012345678901234567890`

**DID Document Includes**:
- `id`: Full DID identifier
- `verificationMethod`: EcdsaSecp256k1VerificationKey2019 with public key
- `authentication`: Reference to verification method

## Current Status

- **zkSync Integration**: Infrastructure ready for Layer2 interactions
- **Test Coverage**: Mock tests passing, original tests need fixes
- **Network**: Configured for zkSync Sepolia testnet
- **Contracts**: Solidity contracts compiled for zkSync compatibility

Transaction hashes are logged for verification on zkSync Sepolia Block Explorer: https://sepolia.explorer.zksync.io/