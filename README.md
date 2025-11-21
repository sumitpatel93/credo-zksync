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

## Project Timeline

### Week of 2025-11-03 to 2025-11-09
- **zkSync:** Updated circuit logic, fixed TypeScript errors for on-chain verification, and resolved compilation issues in `AnonCredsRegistry` and `DidRegistrar`.

### Week of 2025-10-27 to 2025-11-02
- **zkSync:** Added a complete credential flow example for AnonCreds age verification and improved documentation.

### Week of 2025-10-20 to 2025-10-26
- **zkSync:** Completed the implementation of AnonCreds to on-chain age verification.

### Week of 2025-10-13 to 2025-10-19
- **zkSync:** Fixed `AnonCredsGroth16Adapter` tests and documented testing progress.

### Week of 2025-09-01 to 2025-09-07
- **zkSync:** Updated `AgeVerifier` input size, added on-chain verification tests for zkSync Sepolia, and added mock circuit tests.

### Week of 2025-08-18 to 2025-08-24
- **zkSync:** Enhanced `README` with details on DID management, AnonCreds registry, and real zkSync Layer2 integration. Refactored `DidsModuleConfig` and updated `ZkSyncAnonCredsRegistry` to use ABI from a JSON file. Implemented `ZkSyncAnonCredsRegistry` with schema and credential management functions.

### Week of 2025-07-28 to 2025-08-03
- **zkSync:** Added detailed explanation of DID format, testing instructions, and sample output to `README`. Updated delegate management methods and refactored code structure.

### Week of 2025-07-21 to 2025-07-27
- **zkSync:** Implemented delegate management in `ZkSyncDidRegistrar` and `ZkSyncDidResolver`, enhanced them with contract integration, and added `ZkSyncDidRegistry` contract. Implemented `ZkSyncDidRegistrar` with create, update, and deactivate methods.
