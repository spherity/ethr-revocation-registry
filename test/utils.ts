import {RevocationRegistryInstance} from "../types/truffle-contracts";

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

export async function changeListOwner(registry: RevocationRegistryInstance, namespace: string, newOwner: string, list: string, account: string) {
  return registry.changeListOwner.sendTransaction(namespace, newOwner, list, {from: account});
}

export async function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}