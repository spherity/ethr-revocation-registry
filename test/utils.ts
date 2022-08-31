import {RevocationRegistryInstance} from "../types/truffle-contracts";

// TODO: Let's discuss if we really want to have separate cases / fncts for revoke/ unrevoke

export async function assertForNegativeRevocation(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string) {
  assert.isFalse(await registry.isRevoked(namespace, list, revocationKey));
}

export async function assertForPositiveRevocation(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string) {
  assert.isTrue(await registry.isRevoked(namespace, list, revocationKey));
}

export async function revokeKey(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string, account: string) {
  return registry.changeStatus.sendTransaction(true,  namespace, list, revocationKey, {from: account});
}

export async function unrevokeKey(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string, account: string) {
  return registry.changeStatus.sendTransaction(false, namespace, list, revocationKey, {from: account});
}

export async function changeStatusesInList(registry: RevocationRegistryInstance, revoked: boolean[], namespace: string, list: string, revocationKeys: string[], account: string) {
  return registry.changeStatusesInList.sendTransaction(revoked, namespace, list, revocationKeys, {from: account});
}

export async function changeListOwner(registry: RevocationRegistryInstance, namespace: string, newOwner: string, list: string, account: string) {
  return registry.changeListOwner.sendTransaction(namespace, newOwner, list, {from: account});
}

export async function addListDelegate(registry: RevocationRegistryInstance, namespace: string, delegate: string, list: string, validity: number, account: string) {
  return registry.addListDelegate.sendTransaction(namespace, delegate, list, validity, {from: account});
}

export async function removeListDelegate(registry: RevocationRegistryInstance, namespace: string, delegate: string, list: string, account: string) {
  return registry.removeListDelegate.sendTransaction(namespace, delegate, list, {from: account});
}

export async function revokeKeyDelegated(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string, account: string) {
  return registry.changeStatusDelegated.sendTransaction(true, namespace, list, revocationKey, {from: account});
}

export async function unrevokeKeyDelegated(registry: RevocationRegistryInstance, namespace: string, list: string, revocationKey: string, account: string) {
  return registry.changeStatusDelegated.sendTransaction(false, namespace, list, revocationKey, {from: account});
}