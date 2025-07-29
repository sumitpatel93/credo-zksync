// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Ethereum DID Registry
 * @author uPort
 * @notice This contract is a registry for DIDs on the Ethereum blockchain, based on the ERC-1056 standard.
 * It allows for managing DID ownership, delegates, and attributes.
 */
contract ZkSyncDidRegistry {
    // Mapping from identity address to the current owner of that identity
    mapping(address => address) public owners;

    // Mapping from identity address and delegate type to the delegate address
    mapping(address => mapping(bytes32 => address)) public delegates;

    // Mapping from identity address and attribute name to the attribute value
    mapping(address => mapping(bytes32 => bytes)) public attributes;

    // Mapping from identity address to the block number of the last change
    mapping(address => uint) public changed;

    // --- Events ---

    event DIDOwnerChanged(
        address indexed identity,
        address owner,
        uint previousChange
    );

    event DIDDelegateChanged(
        address indexed identity,
        bytes32 delegateType,
        address delegate,
        uint validTo,
        uint previousChange
    );

    event DIDAttributeChanged(
        address indexed identity,
        bytes32 name,
        bytes value,
        uint validTo,
        uint previousChange
    );

    // --- Modifier ---

    modifier isOwner(address identity) {
        require(owners[identity] == msg.sender, "Not owner");
        _;
    }

    // --- Functions ---

    constructor() {
        // The deployer of the contract is the initial owner of their own DID
        owners[msg.sender] = msg.sender;
    }

    function identityOwner(address identity) public view returns (address) {
        return owners[identity];
    }

    function changeOwner(address identity, address newOwner) public isOwner(identity) {
        owners[identity] = newOwner;
        emit DIDOwnerChanged(identity, newOwner, changed[identity]);
        changed[identity] = block.number;
    }

    function addDelegate(address identity, bytes32 delegateType, address delegate, uint validTo) public isOwner(identity) {
        delegates[identity][delegateType] = delegate;
        emit DIDDelegateChanged(identity, delegateType, delegate, validTo, changed[identity]);
        changed[identity] = block.number;
    }

    function revokeDelegate(address identity, bytes32 delegateType, address delegate) public isOwner(identity) {
        require(delegates[identity][delegateType] == delegate, "Delegate not found");
        delegates[identity][delegateType] = address(0);
        emit DIDDelegateChanged(identity, delegateType, delegate, 0, changed[identity]);
        changed[identity] = block.number;
    }

    function setAttribute(address identity, bytes32 name, bytes calldata value, uint validTo) public isOwner(identity) {
        attributes[identity][name] = value;
        emit DIDAttributeChanged(identity, name, value, validTo, changed[identity]);
        changed[identity] = block.number;
    }

    function revokeAttribute(address identity, bytes32 name, bytes calldata value) public isOwner(identity) {
        // This is a convention. To revoke, we set the attribute to an empty byte array.
        attributes[identity][name] = new bytes(0);
        emit DIDAttributeChanged(identity, name, value, 0, changed[identity]);
        changed[identity] = block.number;
    }
}