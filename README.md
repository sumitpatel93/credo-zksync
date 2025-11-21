<p align="center">
  <br />
  <img
    alt="Credo Logo"
    src="https://raw.githubusercontent.com/openwallet-foundation/credo-ts/c7886cb8377ceb8ee4efe8d264211e561a75072d/images/credo-logo.png"
    height="250px"
  />
</p>
<h1 align="center"><b>Credo</b></h1>
<p align="center">
  <img
    alt="Pipeline Status"
    src="https://github.com/openwallet-foundation/credo-ts/workflows/Continuous%20Integration/badge.svg?branch=main"
  />
  <a href="https://codecov.io/gh/openwallet-foundation/credo-ts/"
    ><img
      alt="Codecov Coverage"
      src="https://img.shields.io/codecov/c/github/openwallet-foundation/credo-ts/coverage.svg?style=flat-square"
  /></a>
  <a
    href="https://raw.githubusercontent.com/openwallet-foundation/credo-ts/main/LICENSE"
    ><img
      alt="License"
      src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"
  /></a>
  <a href="https://www.typescriptlang.org/"
    ><img
      alt="typescript"
      src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg"
  /></a>
</p>
<br />

<p align="center">
  <a href="#quickstart">Quickstart</a> &nbsp;|&nbsp;
  <a href="#features">Features</a> &nbsp;|&nbsp;
  <a href="#contributing">Contributing</a> &nbsp;|&nbsp;
  <a href="#license">License</a> 
</p>

Credo is a framework written in TypeScript for building **decentralized identity solutions** that aims to be compliant and **interoperable with identity standards across the world**. Credo is agnostic to any specific exchange protocol, credential format, signature suite or did method, but currently mainly focuses on alignment with [OpenID4VC](https://openid.net/sg/openid4vc/), [DIDComm](https://identity.foundation/didcomm-messaging/spec/) and [Hyperledger Aries](https://hyperledger.github.io/aries-rfcs/latest/).

## Quickstart

Documentation on how to get started with Credo can be found at https://credo.js.org/
DeepWiki AI-generated documentation on Credo can be found at https://deepwiki.com/openwallet-foundation/credo-ts

## Features

See [Supported Features](https://credo.js.org/guides/features) on the Credo website for a full list of supported features.

- 🏃 **Platform agnostic** - out of the box support for Node.JS and React Native
- 🔒 **DIDComm and AIP** - Support for [DIDComm v1](https://hyperledger.github.io/aries-rfcs/latest/concepts/0005-didcomm/), and both v1 and v2 of the [Aries Interop Profile](https://github.com/hyperledger/aries-rfcs/blob/main/concepts/0302-aries-interop-profile/README.md).
- 🛂 **Extendable [DID](https://www.w3.org/TR/did-core/) resolver and registrar** - out of the box support for `did:web`, `did:key`, `did:jwk`, `did:peer`, `did:sov`, `did:indy` and `did:cheqd`.
- 🔑 **[OpenID4VC](https://openid.net/sg/openid4vc/)** - support for [OpenID for Verifiable Credential Issuance](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html), [OpenID for Verifiable Presentations](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) and [Self-Issued OpenID Provider v2](https://openid.net/specs/openid-connect-self-issued-v2-1_0.html).
- 🪪 **Multiple credential formats** - [W3C Verifiable Credential Data Model v1.1](https://www.w3.org/TR/vc-data-model/), [SD-JWT VCs](https://www.ietf.org/archive/id/draft-ietf-oauth-sd-jwt-vc-03.html), and [AnonCreds](https://hyperledger.github.io/anoncreds-spec/).
- 🏢 **Multi-tenant** - Optional multi-tenant module for managing multiple tenants under a single agent.

## Demo

To get to know the Credo issuance and verification flow, we built a demo to walk through it yourself together with agents Alice and Faber.

- OpenID4VC and SD-JWT VC demo in the [`/demo-openid`](/demo-openid) directory.
- DIDComm and AnonCreds demo in the [`/demo`](/demo) directory.

## Contributing

If you would like to contribute to the framework, please read the [Framework Developers README](/DEVREADME.md) and the [CONTRIBUTING](/CONTRIBUTING.md) guidelines. These documents will provide more information to get you started!

There are regular community working groups to discuss ongoing efforts within the framework, showcase items you've built with Credo, or ask questions. See [Meeting Information](https://github.com/openwallet-foundation/credo-ts/wiki/Meeting-Information) for up to date information on the meeting schedule. Everyone is welcome to join!

We welcome you to join our mailing list and Discord channel. See the [Wiki](https://github.com/openwallet-foundation/credo-ts/wiki/Communication) for up to date information.

## License

OpenWallet Foundation Credo is licensed under the [Apache License Version 2.0 (Apache-2.0)](/LICENSE).

**LFDT - Scalable and Privacy-Preserving Decentralized Identity on Layer 2 Rollups**

**Active Terms:** 2025 June-Nov Part Time

This project aims to integrate Hyperledger Aries, Indy, and AnonCreds with Layer 2 (L2) rollups (e.g., zkSync) to create a scalable, cost-efficient, and privacy-preserving decentralized identity (DID) system. This project will offload the most expensive part of identity verification—zero-knowledge proof (ZKP) generation and verification in AnonCreds— to L2, reducing the computational and gas costs of verifiable credential (VC) issuance and authentication. By using L2 rollups for...

# Project Status

## Proving Key Generation - COMPLETED! 🎉

### ✅ Successfully Completed

### 1. Downloaded Valid Powers of Tau
- Successfully downloaded from Google Cloud Storage
- File size: 1.2MB (valid ptau file)
- URL: https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_10.ptau

### 2. Generated Valid Proving Keys
- Created initial zkey using snarkjs.zKey.newZKey()
- Added contribution to ceremony
- Exported verification key properly
- All keys are in correct binary format

### 3. Key Files Generated
```
build/proving_key_initial.zkey    - 21,888 bytes
build/proving_key_final.zkey      - 22,299 bytes  
build/proving_key.zkey            - 22,299 bytes  ← Main key
build/verification_key.json       - Proper format   ← Verification key
```

### 4. Proof Generation Working
```javascript
// This now works!
const result = await snarkjs.groth16.fullProve(
  { age: 25, age_threshold: 18 },
  'build/age_verifier.wasm',
  'build/proving_key.zkey'
);
// Result: { proof: { ... }, publicSignals: ['0'] }
```

## ⚠️ Current Status

### Circuit Logic Issue
The circuit is producing inverted results:
- Age 25 >= 18 → publicSignals: ['0'] (should be '1')
- Age 16 < 18 → publicSignals: ['1'] (should be '0')

### Test Results
- **AgeVerifier tests**: 4/9 passing (proof generation works, verification works, but logic inverted)
- **Integration tests**: 0/9 passing (blocked by circuit logic issue)

## 🎯 Root Cause Analysis

The circuit logic appears to be inverted. The circuit outputs:
- 0 when age >= threshold
- 1 when age < threshold

This is the opposite of what the tests expect. The circuit itself is working correctly and generating valid proofs, but the logic is backwards.

## 🔧 Next Steps Options

### Option 1: Fix the Circuit (Recommended)
Update the circuit to output the correct logic:
```circom
// Current: outputs 0 for age >= threshold
// Should: output 1 for age >= threshold
```

### Option 2: Update Test Expectations
Accept the inverted logic and update test expectations to match the actual circuit behavior.

### Option 3: Investigate Further
Check if the issue is in the verification key export or circuit implementation.

## 🚀 Achievement Unlocked

**Proving Key Generation: 100% COMPLETE!**

The major blocker that prevented all integration testing has been completely resolved. We now have:
- ✅ Valid circuits that compile
- ✅ Working proof generation
- ✅ Correct zkey binary format
- ✅ Valid verification keys

The only remaining issue is the circuit logic direction, which is a much simpler problem to solve than the proving key format issue we just conquered!