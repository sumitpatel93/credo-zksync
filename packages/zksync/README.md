# @credo-ts/zksync

This package provides a DID method implementation for `did:zksync` for use with Credo-ts agents. It allows Credo-ts agents to interact with a DID registry deployed on the zkSync network.

## How it Works

The `@credo-ts/zksync` package consists of two main components:

-   **`ZkSyncDidRegistrar`**: This class is responsible for managing the lifecycle of `did:zksync` DIDs on the zkSync DID registry. It provides functionalities for:
    -   **DID Creation**: Registers a new DID on the zkSync network.
    -   **DID Update**: Allows updating the owner of a DID.
    -   **DID Deactivation**: Deactivates a DID by transferring ownership to a zero address.
    -   **DID Delegation**: Adds and revokes delegates for a DID, enabling fine-grained control over DID operations.

-   **`ZkSyncDidResolver`**: This class handles the resolution of `did:zksync` DIDs. It queries the zkSync DID registry to retrieve DID document information and resolve delegation details.

Both the registrar and resolver interact with a deployed `ZkSyncDidRegistry` smart contract on the zkSync network. The contract address is configured during the instantiation of these classes.

## Testing

The tests for this package (`ZkSyncDidDelegation.test.ts`) are designed to verify the end-to-end functionality of DID management on the zkSync network.

### How to Run Tests

1.  **Install Dependencies**: Ensure you have `pnpm` installed. Then, install the project dependencies:
    ```bash
    pnpm install
    ```

2.  **Fund Your Wallet**: The tests deploy a smart contract and perform transactions on the zkSync Sepolia Testnet. You need to fund the private key used in `ZkSyncDidDelegation.test.ts` (currently `0x292047fb31c143df111aaffffbcd2b4be45e3d1c25c06b5949d479475f282a4d`) with Sepolia ETH. You can obtain Sepolia ETH from a faucet.

3.  **Run Tests**: Navigate to the root of the `credo-ts` project and run the specific test suite:
    ```bash
    npm test packages/zksync/src/__tests__/ZkSyncDidDelegation.test.ts
    ```

### Sample Test Output

```
> test
> jest packages/zksync/src/__tests__/ZkSyncDidDelegation.test.ts

  console.log
    Contract Address: 0x829AA5009C066A74B1AE8d388eF18E3E53630c17

  console.log
    Contract Deployment Tx Hash: 0xcdfb711c78c3ff0663e1d99ce87dfff25f5ccfb7685dadeac9752cd975d2db2e

  console.log
    DID Creation Tx Hash: 0x123abc...

  console.log
    Add Delegate Tx Hash: 0x0de1a777b311458f8ca3b59b99f88f23cebec73ecfb6ed15b6e9cdf37dc807e3

  console.log
    Revoke Delegate Tx Hash: 0xe0b924bdf2a4310f8569d9bd4b24b327f664d3e35c4f194b7a95a021eb331a51

PASS @credo-ts/zksync packages/zksync/src/__tests__/ZkSyncDidDelegation.test.ts (16.936 s)
  ZkSyncDidDelegation
    ✓ should add and resolve a delegate (4536 ms)
    ✓ should revoke a delegate (4680 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        16.991 s
Ran all test suites matching /ZkSyncDidDelegation.test.ts/i.
```

## How it Works

The `@credo-ts/zksync` package consists of two main components:

-   **`ZkSyncDidRegistrar`**: This class is responsible for managing the lifecycle of `did:zksync` DIDs on the zkSync DID registry. It provides functionalities for:
    -   **DID Creation**: Registers a new DID on the zkSync network.
    -   **DID Update**: Allows updating the owner of a DID.
    -   **DID Deactivation**: Deactivates a DID by transferring ownership to a zero address.
    -   **DID Delegation**: Adds and revokes delegates for a DID, enabling fine-grained control over DID operations.

-   **`ZkSyncDidResolver`**: This class handles the resolution of `did:zksync` DIDs. It queries the zkSync DID registry to retrieve DID document information and resolve delegation details.

Both the registrar and resolver interact with a deployed `ZkSyncDidRegistry` smart contract on the zkSync network. The contract address is configured during the instantiation of these classes.

The type of DID created in this package is did:zksync.


  Specifically, the ZkSyncDidRegistrar creates DIDs in the format did:zksync:<wallet_address>,
  where <wallet_address> is the Ethereum address derived from the private key used to register
  the DID.


  The DID Document for this type of DID includes:
   * An id field with the did:zksync:<wallet_address> format.
   * A verificationMethod entry, typically of type EcdsaSecp256k1VerificationKey2019, which uses
     the public key derived from the wallet.
   * An authentication entry that references the verificationMethod, indicating that the wallet's
     key can be used to authenticate the DID.

## Testing

The tests for this package (`ZkSyncDidDelegation.test.ts`) are designed to verify the end-to-end functionality of DID management on the zkSync network. The testing flow is as follows:

1.  **Local Hardhat Environment**: The tests utilize a local Hardhat environment to deploy a fresh instance of the `ZkSyncDidRegistry` smart contract for each test run. This ensures a clean and isolated testing environment.

2.  **`zksync-ethers`**: The `zksync-ethers` library is used to interact with the zkSync network, including deploying the contract and sending transactions.

3.  **zkSync-Compatible Bytecode**: The `ZkSyncDidRegistry` contract is compiled using `zksolc` (via Hardhat's zkSync plugin) to generate zkSync-compatible bytecode. This bytecode is then used to deploy the contract in the tests.

4.  **Test Flow (`ZkSyncDidDelegation.test.ts`)**:
    -   **`beforeAll` Hook**: Before all tests run, the `beforeAll` hook performs the following setup:
        -   Initializes a `Wallet` with a provided private key. This wallet is used to deploy the contract and sign transactions.
        -   Connects to the zkSync Sepolia Testnet using a `Provider`.
        -   Deploys the `ZkSyncDidRegistry` smart contract using the `CONTRACT_ABI` and `CONTRACT_BYTECODE`.
        -   Logs the deployed contract address and its deployment transaction hash.
        -   Instantiates `ZkSyncDidRegistrar` and `ZkSyncDidResolver` with the deployed contract address.
        -   Creates a new DID on the zkSync network using the `registrar.create()` method and logs its transaction hash.

    -   **`should add and resolve a delegate` Test**: This test case verifies the delegation functionality:
        -   Defines `delegateOptions` including a delegate type, address, and validity period.
        -   Calls `registrar.addDelegate()` to add a delegate for the created DID and logs the transaction hash.
        -   Calls `resolver.resolveDelegate()` to resolve the added delegate.
        -   Asserts that the resolved delegate matches the expected delegate address.

    -   **`should revoke a delegate` Test**: This test case verifies the revocation functionality:
        -   Defines `delegateOptions` for the delegate to be revoked.
        -   Calls `registrar.revokeDelegate()` to revoke the delegate and logs the transaction hash.
        -   Calls `resolver.resolveDelegate()` to attempt to resolve the revoked delegate.
        -   Asserts that the resolved delegate is `null`, indicating successful revocation.

Transaction hashes are logged to the console for each significant on-chain operation, allowing for easy verification on the ZkSync Sepolia Block Explorer (`https://sepolia.explorer.zksync.io/`).
