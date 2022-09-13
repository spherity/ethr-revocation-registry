import {RevocationRegistryInstance} from "../types-ts/truffle-v5";
import {HttpProvider} from "web3-core";

// TODO: Let's discuss if we really want to have separate cases / fncts for revoke/ unrevoke

export async function assertForNegativeRevocation(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string) {
  assert.isFalse(await registry.isRevoked(namespace, list, revocationKey));
}

export async function assertForPositiveRevocation(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string) {
  assert.isTrue(await registry.isRevoked(namespace, list, revocationKey));
}

export function assertRevocationStatusChangedEvent(log: any, namespace: string, list: string, revocationKey: string, revoked: boolean) {
  assert.equal(log.event, "RevocationStatusChanged");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.list, list);
  assert.equal(log.args.revocationKey, revocationKey);
  assert.equal(log.args.revoked, revoked);
}

export function assertListDelegateAddedEvent(log: any, namespace: string, delegate: string, list: string) {
  assert.equal(log.event, "ListDelegateAdded");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.list, list);
  assert.equal(log.args.delegate, delegate);
}

export function assertListDelegateRemovedEvent(log: any, namespace: string, delegate: string, list: string) {
  assert.equal(log.event, "ListDelegateRemoved");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.list, list);
  assert.equal(log.args.delegate, delegate);
}

export function assertListOwnerChangedEvent(log: any, namespace: string, list: string, newOwner: string) {
  assert.equal(log.event, "ListOwnerChanged");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.list, list);
  assert.equal(log.args.newOwner, newOwner);
}

export function assertListStatusChangedEvent(log: any, namespace: string, list: string, revoked: boolean) {
  assert.equal(log.event, "ListStatusChanged");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.list, list);
  assert.equal(log.args.revoked, revoked);
}

export async function revokeKey(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string, account: string) {
  return registry.changeStatus.sendTransaction(true, namespace, list, revocationKey, {from: account});
}

export async function unrevokeKey(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string, account: string) {
  return registry.changeStatus.sendTransaction(false, namespace, list, revocationKey, {from: account});
}

export async function changeStatusesInList(registry: RevocationRegistryInstance, revoked: boolean[], namespace: string, list: string, revocationKeys: string[], account: string) {
  return registry.changeStatusesInList.sendTransaction(revoked, namespace, list, revocationKeys, {from: account});
}

export async function changeStatusesInListSigned(registry: RevocationRegistryInstance, revoked: boolean[], namespace: string, list: string, revocationKeys: string[], signer: string, signature: string, account: string) {
  return registry.changeStatusesInListSigned(revoked, namespace, list, revocationKeys, signer, signature, {from: account})
}

export async function changeStatusesInListDelegatedSigned(registry: RevocationRegistryInstance, revoked: boolean[], namespace: string, list: string, revocationKeys: string[], signer: string, signature: string, account: string) {
  return registry.changeStatusesInListDelegatedSigned(revoked, namespace, list, revocationKeys, signer, signature, {from: account})
}

export async function changeListOwner(registry: RevocationRegistryInstance, namespace: string, newOwner: string, list: string, account: string) {
  return registry.changeListOwner.sendTransaction(namespace, newOwner, list, {from: account});
}

export async function changeListOwnerSigned(registry: RevocationRegistryInstance, namespace: string, newOwner: string, list: string, signer: string, signature: string, account: string) {
  return registry.changeListOwnerSigned(namespace, newOwner, list, signer, signature, {from: account});
}

export async function addListDelegate(registry: RevocationRegistryInstance, namespace: string, delegate: string, list: string, validity: number, account: string) {
  return registry.addListDelegate.sendTransaction(namespace, delegate, list, validity, {from: account});
}

export async function addListDelegateSigned(registry: RevocationRegistryInstance, namespace: string, delegate: string, list: string, validity: number, signer: string, signature: string, account: string) {
  return registry.addListDelegateSigned(namespace, delegate, list, validity, signer, signature, {from: account});
}

export async function removeListDelegate(registry: RevocationRegistryInstance, namespace: string, delegate: string, list: string, account: string) {
  return registry.removeListDelegate.sendTransaction(namespace, delegate, list, {from: account});
}

export async function removeListDelegateSigned(registry: RevocationRegistryInstance, namespace: string, delegate: string, list: string, signer: string, signature: string, account: string) {
  return registry.removeListDelegateSigned(namespace, delegate, list, signer, signature, {from: account});
}

export async function revokeKeyDelegated(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string, account: string) {
  return registry.changeStatusDelegated.sendTransaction(true, namespace, list, revocationKey, {from: account});
}

export async function unrevokeKeyDelegated(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string, account: string) {
  return registry.changeStatusDelegated.sendTransaction(false, namespace, list, revocationKey, {from: account});
}

export async function changeListStatus(registry: RevocationRegistryInstance, namespace: string, list: string, revoked: boolean, account: string) {
  return registry.changeListStatus.sendTransaction(revoked, namespace, list, {from: account});
}

export async function changeListStatusSigned(registry: RevocationRegistryInstance, namespace: string, list: string, revoked: boolean, signer: string, signature: string, account: string) {
  return registry.changeListStatusSigned(revoked, namespace, list, signer, signature, {from: account});
}

export async function getNonce(registry: RevocationRegistryInstance, account: string) {
  const nonceObject: any = await registry.nonces(account);
  return nonceObject.words[0];
}

export async function signTypedData(signer: string, params: EIP712Params): Promise<string> {
  return new Promise((resolve, reject) => {
    (web3.eth.currentProvider as HttpProvider).send({
      jsonrpc: "2.0",
      method: 'eth_signTypedData',
      params: [signer, params],
    }, function (err: any, result: any) {
      if (err) {
        reject(err);
      }
      resolve(result.result);
    })
  });
}

interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export async function getEIP721DomainObject(registry: RevocationRegistryInstance): Promise<EIP712Domain> {
  return {
    name: 'Revocation Registry',
    version: await registry.version(),
    chainId: await web3.eth.getChainId(),
    verifyingContract: registry.address,
  };
}

export enum SignedFunction {
  CHANGE_STATUS = "ChangeStatus",
  CHANGE_STATUS_DELEGATED = "ChangeStatusDelegated",
  CHANGE_STATUSES_IN_LIST = "ChangeStatusesInList",
  CHANGE_STATUSES_IN_LIST_DELEGATED = "ChangeStatusesInListDelegated",
  CHANGE_LIST_OWNER = "ChangeListOwner",
  CHANGE_LIST_STATUS = "ChangeListStatus",
  ADD_LIST_DELEGATE = "AddListDelegate",
  REMOVE_LIST_DELEGATE = "RemoveListDelegate",
}

// TODO: replace any with correct type and maybe throw it into the types-ts folder?
interface EIP712Params {
  domain: any;
  message: any;
  primaryType: string;
  types: any;
}

export function generateEIP712Params(signedFunction: SignedFunction, domainObject: any, message: any) {
  const params: EIP712Params = {
    domain: domainObject,
    message: message,
    primaryType: "",
    types: {
      // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ]
    },
  }

  switch (signedFunction) {
    case SignedFunction.CHANGE_STATUS:
      params.primaryType = "ChangeStatus";
      params.types.ChangeStatus = [
        {name: 'revoked', type: 'bool'},
        {name: 'namespace', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'revocationKey', type: 'bytes32'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
      ]
      break;
    case SignedFunction.CHANGE_STATUS_DELEGATED:
      params.primaryType = "ChangeStatusDelegated";
      params.types.ChangeStatusDelegated = [
        {name: 'revoked', type: 'bool'},
        {name: 'namespace', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'revocationKey', type: 'bytes32'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
      ]
      break;
    case SignedFunction.CHANGE_STATUSES_IN_LIST:
      params.primaryType = "ChangeStatusesInList";
      params.types.ChangeStatusesInList = [
        {name: 'revoked', type: 'bool[]'},
        {name: 'namespace', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'revocationKeys', type: 'bytes32[]'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
      ]
      break;
    case SignedFunction.CHANGE_STATUSES_IN_LIST_DELEGATED:
      params.primaryType = "ChangeStatusesInListDelegated";
      params.types.ChangeStatusesInListDelegated = [
        {name: 'revoked', type: 'bool[]'},
        {name: 'namespace', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'revocationKeys', type: 'bytes32[]'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
      ]
      break;
    case SignedFunction.CHANGE_LIST_OWNER:
      params.primaryType = "ChangeListOwner";
      params.types.ChangeListOwner = [
        {name: 'namespace', type: 'address'},
        {name: 'newOwner', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
      ]
      break;
    case SignedFunction.ADD_LIST_DELEGATE:
      params.primaryType = "AddListDelegate";
      params.types.AddListDelegate = [
        {name: 'namespace', type: 'address'},
        {name: 'delegate', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'validity', type: 'uint'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
      ]
      break;
    case SignedFunction.REMOVE_LIST_DELEGATE:
      params.primaryType = "RemoveListDelegate";
      params.types.RemoveListDelegate = [
        {name: 'namespace', type: 'address'},
        {name: 'delegate', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
      ]
      break;
    case SignedFunction.CHANGE_LIST_STATUS:
      params.primaryType = "ChangeListStatus";
      params.types.ChangeListStatus = [
        {name: 'revoked', type: 'bool'},
        {name: 'namespace', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
      ]
  }
  return params;
}