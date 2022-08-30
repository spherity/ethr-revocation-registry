// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract RevocationRegistry {
    // Revocations happen in revocation lists that belong to an address/ user namespace
    mapping(address => mapping(bytes32 => mapping(bytes32 => bool))) registry;

    // New Owners: Incase an owner has changed the owner of one of the lists in its namespaces
    // Acts as a lookup table of what addresses have delegate access to what revocation list in which namespaces
    //(hash(ownerNamespace,list,version) => newOwner => bool
    mapping(bytes32 => address) public newOwners;

    // Delegates: A namespace owner can add access to one of its lists to another namespace/ address
    // Acts as a lookup table of what addresses have delegate access to what revocation list in which namespaces
    //     (hash(ownerNamespace, list) => newOwner => expiryTiemstamp
    mapping(bytes32 => mapping(address => uint)) delegates;

    // Nonce tracking for meta transactions
    mapping(address => uint) nonces;

    constructor() {}

    function isRevoked(address namespace, bytes32 list, bytes32 revocationKey) public view returns (bool) {
        return (registry[namespace][list][revocationKey]);
    }

    function changeStatus(bool revoked, address namespace, bytes32 list, bytes32 revocationKey) isOwner(namespace, list) public {
        registry[namespace][list][revocationKey] = revoked;
    }

    function changeStatusesInList(bool[] memory revoked, address namespace, bytes32 list, bytes32[] memory revocationKeys) isOwner(namespace, list) public {
        for (uint i = 0; i < revoked.length; i++) {
            changeStatus(revoked[i], namespace, list, revocationKeys[i]);
        }
    }

    function changeStatusDelegated(bool revoked, address namespace, bytes32 list, bytes32 revocationKey) isDelegate(namespace, list) public {
        registry[namespace][list][revocationKey] = revoked;
    }

    function changeListOwner(address namespace, address newOwner, bytes32 list) isOwner(namespace, list) public {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        newOwners[listLocationHash] = newOwner;
    }

    function addListDelegate(address namespace, address delegate, bytes32 list, uint validity) isOwner(namespace, list) public {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        delegates[listLocationHash][delegate] = validity;
    }

    function removeListDelegate(address namespace, address delegate, bytes32 list) isOwner(namespace, list) public {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        delegates[listLocationHash][delegate] = 0;
    }

    function generateListLocationHash(address namespace, bytes32 list) pure internal returns(bytes32) {
        return keccak256(abi.encodePacked(namespace, list));
    }
    function generateListLocationVersionHash(address namespace, bytes32 list, uint version) pure internal returns(bytes32) {
        return keccak256(abi.encodePacked(namespace, list, version));
    }


    // Check if
    // - caller is acting in its namespace
    // - or they got owner rights in a foreign namespace
    modifier isOwner(address namespace, bytes32 list) {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        if (newOwners[listLocationHash] == address(0)) {
            require(msg.sender == namespace, "Caller is not an owner");
        } else {
            require(msg.sender == newOwners[listLocationHash], "Caller is not an owner");
        }
        _;
    }

    // Check if caller got delegate rights in a foreign namespace before expiry
    modifier isDelegate(address namespace, bytes32 list) {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        require(delegates[listLocationHash][msg.sender] > block.timestamp, "Caller is not a delegate");
        _;
    }
}