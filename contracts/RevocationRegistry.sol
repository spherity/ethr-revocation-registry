// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.11 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RevocationRegistry is EIP712 {
    // Revocations happen in revocation lists that belong to an address/ user namespace
    mapping(address => mapping(bytes32 => mapping(bytes32 => bool))) registry;

    // New Owners: In case an owner has changed the owner of one of the lists in its namespaces
    // Acts as a lookup table of what addresses have delegate access to what revocation list in which namespaces
    //(hash(ownerNamespace,list) => newOwner
    mapping(bytes32 => address) public newOwners;

    // Delegates: A namespace owner can add access to one of its lists to another namespace/ address
    // Acts as a lookup table of what addresses have delegate access to what revocation list in which namespaces
    //     (hash(ownerNamespace, list) => newOwner => expiryTimestamp
    mapping(bytes32 => mapping(address => uint)) delegates;

    // Nonce tracking for meta transactions
    mapping(address => uint) nonces;

    string public constant VERSION_MAJOR = "1";
    string public constant VERSION_MINOR = "0";
    string public constant VERSION_PATCH = "0";
    string constant VERSION_DELIMITER = ".";

    constructor()
    EIP712("Revocation Registry", version()) {}

    function version() public pure returns(string memory) {
        return string.concat(VERSION_MAJOR, VERSION_DELIMITER, VERSION_MINOR, VERSION_DELIMITER, VERSION_PATCH);
    }

    function isRevoked(address namespace, bytes32 list, bytes32 revocationKey) public view returns (bool) {
        return (registry[namespace][list][revocationKey]);
    }

    // CHANGE STATUS
    //    BY OWNER

    function _changeStatus(bool revoked, address namespace, bytes32 list, bytes32 revocationKey) internal {
        registry[namespace][list][revocationKey] = revoked;
        // emit Event
    }

    function changeStatus(bool revoked, address namespace, bytes32 list, bytes32 revocationKey) isOwner(namespace, list) public {
        _changeStatus(revoked, namespace, list, revocationKey);
    }

    // TODO: rename `signed` suffix to something more self explanatory? Like `meta` maybe?
    function changeStatusSigned(bool revoked, address namespace, bytes32 list, bytes32 revocationKey, bytes calldata signature) public {
        bytes32 hash = _hashChangeStatus(revoked, namespace, list, revocationKey);
        address signer = ECDSA.recover(hash, signature);
        require(_identityIsOwner(namespace, list, signer), "Signer is not an owner");
        nonces[signer]++;
        _changeStatus(revoked, namespace, list, revocationKey);
    }

    function _hashChangeStatus(bool revoked, address namespace, bytes32 list, bytes32 revocationKey) view public returns(bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
                keccak256("ChangeStatus(bool revoked,address namespace,bytes32 list,bytes32 revocationKey)"),
                revoked,
                namespace,
                list,
                revocationKey
            )));
    }

    //    BY DELEGATE
    function _changeStatusDelegated(bool revoked, address namespace, bytes32 list, bytes32 revocationKey) internal {
        registry[namespace][list][revocationKey] = revoked;
    }

    function changeStatusDelegated(bool revoked, address namespace, bytes32 list, bytes32 revocationKey) isDelegate(namespace, list) public {
        _changeStatusDelegated(revoked, namespace, list, revocationKey);
    }

    function changeStatusDelegatedSigned(bool revoked, address namespace, bytes32 list, bytes32 revocationKey, bytes calldata signature) public {
        bytes32 hash = _hashChangeStatusDelegated(revoked, namespace, list, revocationKey);
        address signer = ECDSA.recover(hash, signature);
        require(_identityIsDelegate(namespace, list, signer), "Signer is not a delegate");
        nonces[signer]++;
        _changeStatusDelegated(revoked, namespace, list, revocationKey);
    }

    function _hashChangeStatusDelegated(bool revoked, address namespace, bytes32 list, bytes32 revocationKey) view public returns(bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
                keccak256("ChangeStatusDelegated(bool revoked,address namespace,bytes32 list,bytes32 revocationKey)"),
                revoked,
                namespace,
                list,
                revocationKey
            )));
    }

    // CHANGE OWNER BATCH
    //    BY OWNER
    function _changeStatusesInList(bool[] memory revoked, address namespace, bytes32 list, bytes32[] memory revocationKeys) internal {
        for (uint i = 0; i < revoked.length; i++) {
            _changeStatus(revoked[i], namespace, list, revocationKeys[i]);
        }
    }

    function changeStatusesInList(bool[] memory revoked, address namespace, bytes32 list, bytes32[] memory revocationKeys) isOwner(namespace, list) public {
        _changeStatusesInList(revoked, namespace, list, revocationKeys);
    }

    function changeStatusesInListSigned(bool[] memory revoked, address namespace, bytes32 list, bytes32[] memory revocationKeys, bytes calldata signature) public {
        bytes32 hash = _hashChangeStatusesInList(revoked, namespace, list, revocationKeys);
        address signer = ECDSA.recover(hash, signature);
        require(_identityIsOwner(namespace, list, signer), "Signer is not an owner");
        nonces[signer]++;
        _changeStatusesInList(revoked, namespace, list, revocationKeys);
    }

    function _hashChangeStatusesInList(bool[] memory revoked, address namespace, bytes32 list, bytes32[] memory revocationKeys) view public returns(bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
                keccak256("ChangeStatusesInList(bool[] revoked,address namespace,bytes32 list,bytes32[] revocationKeys)"),
                revoked,
                namespace,
                list,
                revocationKeys
            )));
    }

    //    BY DELEGATE
    function changeStatusesInListDelegate(bool[] memory revoked, address namespace, bytes32 list, bytes32[] memory revocationKeys) isDelegate(namespace, list) public {
        _changeStatusesInList(revoked, namespace, list, revocationKeys);
    }

    function changeStatusesInListDelegateSigned(bool[] memory revoked, address namespace, bytes32 list, bytes32[] memory revocationKeys, bytes calldata signature) public {
        bytes32 hash = _hashChangeStatusesInListDelegate(revoked, namespace, list, revocationKeys);
        address signer = ECDSA.recover(hash, signature);
        require(_identityIsDelegate(namespace, list, signer), "Signer is not a delegate");
        nonces[signer]++;
        _changeStatusesInList(revoked, namespace, list, revocationKeys);
    }

    function _hashChangeStatusesInListDelegate(bool[] memory revoked, address namespace, bytes32 list, bytes32[] memory revocationKeys) view public returns(bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
                keccak256("ChangeStatusesInListDelegate(bool[] revoked,address namespace,bytes32 list,bytes32[] revocationKeys)"),
                revoked,
                namespace,
                list,
                revocationKeys
            )));
    }

    // OWNER

    function _changeListOwner(address namespace, address newOwner, bytes32 list) internal {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        newOwners[listLocationHash] = newOwner;
    }

    function changeListOwner(address namespace, address newOwner, bytes32 list) isOwner(namespace, list) public {
        _changeListOwner(namespace, newOwner, list);
    }

    function changeListOwnerSigned(address namespace, address newOwner, bytes32 list, bytes calldata signature) public {
        bytes32 hash = _hashChangeListOwner(namespace, newOwner, list);
        address signer = ECDSA.recover(hash, signature);
        require(_identityIsOwner(namespace, list, signer), "Signer is not an owner");
        nonces[signer]++;
        _changeListOwner(namespace, newOwner, list);
    }

    function _hashChangeListOwner(address namespace, address newOwner, bytes32 list) view public returns(bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
                keccak256("ChangeListOwner(address namespace,address newOwner,bytes32 list)"),
                namespace,
                newOwner,
                list
            )));
    }

    // DELEGATES
    //    ADD

    function _addListDelegate(address namespace, address delegate, bytes32 list, uint validity) internal {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        delegates[listLocationHash][delegate] = validity;
    }

    function addListDelegate(address namespace, address delegate, bytes32 list, uint validity) isOwner(namespace, list) public {
        _addListDelegate(namespace, delegate, list, validity);
    }

    function addListDelegateSigned(address namespace, address delegate, bytes32 list, uint validity, bytes calldata signature) public {
        bytes32 hash = _hashAddListDelegate(namespace, delegate, list, validity);
        address signer = ECDSA.recover(hash, signature);
        require(_identityIsOwner(namespace, list, signer), "Signer is not an owner");
        nonces[signer]++;
        _addListDelegate(namespace, delegate, list, validity);
    }

    function _hashAddListDelegate(address namespace, address delegate, bytes32 list, uint validity) view public returns(bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
                keccak256("AddListDelegate(address namespace,address delegate,bytes32 list,uint validity)"),
                namespace,
                delegate,
                list,
                validity
            )));
    }

    //    REMOVE
    function _removeListDelegate(address namespace, address delegate, bytes32 list) internal {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        delegates[listLocationHash][delegate] = 0;
    }

    function removeListDelegate(address namespace, address delegate, bytes32 list) isOwner(namespace, list) public {
        _removeListDelegate(namespace, delegate, list);
    }

    function removeListDelegateSigned(address namespace, address delegate, bytes32 list, bytes calldata signature) public {
        bytes32 hash = _hashRemoveListDelegate(namespace, delegate, list);
        address signer = ECDSA.recover(hash, signature);
        require(_identityIsOwner(namespace, list, signer), "Signer is not an owner");
        nonces[signer]++;
        _removeListDelegate(namespace, delegate, list);
    }
    // TODO: should this be public?
    function _hashRemoveListDelegate(address namespace, address delegate, bytes32 list) view public returns(bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
                keccak256("RemoveListDelegate(address namespace,address delegate,bytes32 list)"),
                namespace,
                delegate,
                list
            )));
    }

    // MISC

    function generateListLocationHash(address namespace, bytes32 list) pure internal returns(bytes32) {
        return keccak256(abi.encodePacked(namespace, list));
    }

    modifier isOwner(address namespace, bytes32 list) {
        require(_identityIsOwner(namespace, list, msg.sender), "Caller is not an owner");
        _;
    }

    // Check if:
    // - identity that is supplied is acting in its namespace
    // - or they got owner rights in a foreign namespace
    function _identityIsOwner(address namespace, bytes32 list, address identity) view internal returns(bool) {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        if (newOwners[listLocationHash] == address(0) && identity == namespace) {
            return true;
        } else if (newOwners[listLocationHash] == identity) {
            return true;
        }
        return false;
    }

    modifier isDelegate(address namespace, bytes32 list) {
        require(_identityIsDelegate(namespace, list, msg.sender), "Caller is not a delegate");
        _;
    }

    // Check if caller got delegate rights in a foreign namespace before expiry
    function _identityIsDelegate(address namespace, bytes32 list, address identity) view internal returns(bool) {
        bytes32 listLocationHash = generateListLocationHash(namespace, list);
        if(delegates[listLocationHash][identity] > block.timestamp) {
            return true;
        }
        return false;
    }
}