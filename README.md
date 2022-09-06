<div align="center">
    <img src="img/logo.png" width="256"/>
</div>

<div align="center">

# Ethereum Revocation Registry

#### A reference implementation of an EIP-5539-compatible revocation registry for Ethereum.

[![EIP Draft](https://img.shields.io/badge/EIP--5539-Draft-blue)](https://github.com/ethereum/EIPs/pull/5539)
[![GitHub contributors](https://badgen.net/github/contributors/spherity/Ethereum-Revocation-Registry)](https://GitHub.com/spherity/Ethereum-Revocation-Registry/graphs/contributors/)
[![GitHub issues](https://img.shields.io/github/issues/spherity/Ethereum-Revocation-Registry)](https://GitHub.com/spherity/Ethereum-Revocation-Registry/issues/)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/spherity/Ethereum-Revocation-Registry.svg)](https://GitHub.com/spherity/Ethereum-Revocation-Registry/pull/)

</div>

## Motivation

The EIP-5539 draft proposes a new RBAC-enabled revocation registry that can be used by any valid Ethereum address to maintain a set of revocation lists. In those, arbitrary revocation keys can be marked as either revoked or not. Additionally, the registry includes a set of management features that enables owners to have features like delegates, owner changes, and meta transactions.

This repository includes a well-tested reference implementation that implements all described features in EIP-5539.

## Concepts


### Namespace

A namespace is a representation of an Ethereum `address` inside the registry that corresponds to its owners `address`. All revocation lists within a namespace are initially owned by the namespace's owner `address`. All namespaces are already claimed by their corresponding owners.

### Revocation List

A namespace can contain an (almost) infinite number of revocation lists. Each revocation list is identified by a unique key of the type `bytes32` that can be used to address it in combination with the namespace `address`. 

### Revocation Key

A revocation list can contain an (almost) infinite number of revocation keys of the type `bytes32`. In combination with the namespace `address` and the revocation list key, it resolves to a boolean value that indicates whether the revocation key is revoked or not. Revocations can always be undone.

### Owner

An Ethereum `address` that has modifying rights to revocation lists within its own and possibly foreign namespaces. An owner can give up modifying rights of revocation lists within its namespace by transferring ownership to another `address`. The revocation list will still reside in its original namespace though.

### Delegate

An Ethereum `address` that received temporary access to a revocation list in a namespace. It has to be granted by the current owner of the revocation list in question.

### Meta Transaction

Owners and delegates can provide a signed payload off-band to another `address` (transaction sender) that initiates the Ethereum interaction with the smart contract. This might be helpful for services providing easy-to-use access to the registry.

## Interacting with the Registry

Implementers can call all methods of the registry directly with already existing web3 libraries. Alternatively, the Typescript library [Ethereum-Revocation-Registry-Controller](https://github.com/spherity/Ethereum-Revocation-Registry-Controller) can be used as an easy-to-use interface to interact with the registry.

## Contract Deployments

| Network Name | name    | chainId | hexChainId | Registry Address   | Registry version      |
|--------------|---------|---------|------------|--------------------|-----------------------|
| Mainnet      | mainnet | 1       | 0x01       |||

## Development

### Requirements

To get the test suite running you need a local instance of Ganache.
This projects supplies a `docker-compose` that starts up a local instance:

```
npm run init
```

The migration will deploy the contract to the local chain:

```
npm run migrate
```

Then you can generate the contract's types:

```
npm run generate-types
```

Everytime you change something at the contract you need to run a migration & generate the types anew if the interfaces changed.

### Test Suite

To start the test suite, you can call:

```
npm run test
```

To get a coverage report  you need to run:

```
npm run test:coverage
```

### Versioning

This repository has three deliverables with versions:

* node module
* contract
* contract types

All of these leverage semantic versioning.

#### Node Module
The node module version is separated from the other ones.

#### Contract
The contract's version will always be bumped in a major version when the public interface changes (public methods, public fields).
If this happens, a new contract file should be used with the changes you intend to apply.

#### Contract Types
The contract types version will follow the contract's version accordingly, but will only carry the
major version in their name (V1, V2).