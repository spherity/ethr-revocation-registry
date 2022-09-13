import {RevocationRegistryInstance} from "../types-ts/truffle-v5";
import {HttpProvider} from "web3-core";
import {EIP712Params} from "../src/util";

// TODO: Let's discuss if we really want to have separate cases / fncts for revoke/ unrevoke

export async function assertForNegativeRevocation(registry: RevocationRegistryInstance, namespace: string, revocationList: string, revocationKey: string) {
  assert.isFalse(await registry.isRevoked(namespace, revocationList, revocationKey));
}

export async function assertForPositiveRevocation(registry: RevocationRegistryInstance, namespace: string, revocationList: string, revocationKey: string) {
  assert.isTrue(await registry.isRevoked(namespace, revocationList, revocationKey));
}

export function assertRevocationStatusChangedEvent(log: any, namespace: string, revocationList: string, revocationKey: string, revoked: boolean) {
  assert.equal(log.event, "RevocationStatusChanged");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.revocationList, revocationList);
  assert.equal(log.args.revocationKey, revocationKey);
  assert.equal(log.args.revoked, revoked);
}

export function assertListDelegateAddedEvent(log: any, namespace: string, delegate: string, revocationList: string) {
  assert.equal(log.event, "RevocationListDelegateAdded");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.revocationList, revocationList);
  assert.equal(log.args.delegate, delegate);
}

export function assertListDelegateRemovedEvent(log: any, namespace: string, delegate: string, revocationList: string) {
  assert.equal(log.event, "RevocationListDelegateRemoved");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.revocationList, revocationList);
  assert.equal(log.args.delegate, delegate);
}

export function assertListOwnerChangedEvent(log: any, namespace: string, revocationList: string, newOwner: string) {
  assert.equal(log.event, "RevocationListOwnerChanged");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.revocationList, revocationList);
  assert.equal(log.args.newOwner, newOwner);
}

export function assertListStatusChangedEvent(log: any, namespace: string, revocationList: string, revoked: boolean) {
  assert.equal(log.event, "RevocationListStatusChanged");
  assert.equal(log.args.namespace, namespace);
  assert.equal(log.args.revocationList, revocationList);
  assert.equal(log.args.revoked, revoked);
}

export async function revokeKey(registry: RevocationRegistryInstance, namespace: string, revocationList: string, revocationKey: string, account: string) {
  return registry.changeStatus.sendTransaction(true, namespace, revocationList, revocationKey, {from: account});
}

export async function unrevokeKey(registry: RevocationRegistryInstance, namespace: string, revocationList: string, revocationKey: string, account: string) {
  return registry.changeStatus.sendTransaction(false, namespace, revocationList, revocationKey, {from: account});
}

export async function changeStatusesInList(registry: RevocationRegistryInstance, revoked: boolean[], namespace: string, revocationList: string, revocationKeys: string[], account: string) {
  return registry.changeStatusesInList.sendTransaction(revoked, namespace, revocationList, revocationKeys, {from: account});
}

export async function changeStatusesInListSigned(registry: RevocationRegistryInstance, revoked: boolean[], namespace: string, revocationList: string, revocationKeys: string[], signer: string, signature: string, account: string) {
  return registry.changeStatusesInListSigned(revoked, namespace, revocationList, revocationKeys, signer, signature, {from: account})
}

export async function changeStatusesInListDelegatedSigned(registry: RevocationRegistryInstance, revoked: boolean[], namespace: string, revocationList: string, revocationKeys: string[], signer: string, signature: string, account: string) {
  return registry.changeStatusesInListDelegatedSigned(revoked, namespace, revocationList, revocationKeys, signer, signature, {from: account})
}

export async function changeListOwner(registry: RevocationRegistryInstance, namespace: string, newOwner: string, revocationList: string, account: string) {
  return registry.changeListOwner.sendTransaction(namespace, newOwner, revocationList, {from: account});
}

export async function changeListOwnerSigned(registry: RevocationRegistryInstance, namespace: string, newOwner: string, revocationList: string, signer: string, signature: string, account: string) {
  return registry.changeListOwnerSigned(namespace, newOwner, revocationList, signer, signature, {from: account});
}

export async function addListDelegate(registry: RevocationRegistryInstance, namespace: string, delegate: string, revocationList: string, validity: number, account: string) {
  return registry.addListDelegate.sendTransaction(namespace, delegate, revocationList, validity, {from: account});
}

export async function addListDelegateSigned(registry: RevocationRegistryInstance, namespace: string, delegate: string, revocationList: string, validity: number, signer: string, signature: string, account: string) {
  return registry.addListDelegateSigned(namespace, delegate, revocationList, validity, signer, signature, {from: account});
}

export async function removeListDelegate(registry: RevocationRegistryInstance, namespace: string, delegate: string, revocationList: string, account: string) {
  return registry.removeListDelegate.sendTransaction(namespace, delegate, revocationList, {from: account});
}

export async function removeListDelegateSigned(registry: RevocationRegistryInstance, namespace: string, delegate: string, revocationList: string, signer: string, signature: string, account: string) {
  return registry.removeListDelegateSigned(namespace, delegate, revocationList, signer, signature, {from: account});
}

export async function revokeKeyDelegated(registry: RevocationRegistryInstance, namespace: string, revocationList: string, revocationKey: string, account: string) {
  return registry.changeStatusDelegated.sendTransaction(true, namespace, revocationList, revocationKey, {from: account});
}

export async function unrevokeKeyDelegated(registry: RevocationRegistryInstance, namespace: string, revocationList: string, revocationKey: string, account: string) {
  return registry.changeStatusDelegated.sendTransaction(false, namespace, revocationList, revocationKey, {from: account});
}

export async function changeListStatus(registry: RevocationRegistryInstance, namespace: string, revocationList: string, revoked: boolean, account: string) {
  return registry.changeListStatus.sendTransaction(revoked, namespace, revocationList, {from: account});
}

export async function changeListStatusSigned(registry: RevocationRegistryInstance, namespace: string, revocationList: string, revoked: boolean, signer: string, signature: string, account: string) {
  return registry.changeListStatusSigned(revoked, namespace, revocationList, signer, signature, {from: account});
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