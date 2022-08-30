import {RevocationRegistryInstance} from "../types/truffle-contracts";

const RevocationRegistry = artifacts.require("RevocationRegistry");

contract("RevocationRegistry", function (accounts) {
  let registry: RevocationRegistryInstance;
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628";
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6";

  async function checkForNegativeRevocation(namespace: string, list: string, revocationKey: string) {
    assert.isFalse(await registry.isRevoked(namespace, list, revocationKey));
  }
  async function checkForPositiveRevocation(namespace: string, list: string, revocationKey: string) {
    assert.isTrue(await registry.isRevoked(namespace, list, revocationKey));
  }
  async function revokeKey(namespace: string, list: string, revocationKey: string, account: string) {
    await registry.changeStatus.sendTransaction(true,  namespace, list, revocationKey, {from: account});
  }
  async function unrevokeKey(namespace: string, list: string, revocationKey: string, account: string) {
    await registry.changeStatus.sendTransaction(false, namespace, list, revocationKey, {from: account});
  }

  beforeEach(async () => {
    registry = await RevocationRegistry.deployed();
  })

  contract("should handle revocation", async function () {
    it("setting positive revocation", async function () {
      await checkForNegativeRevocation(accounts[0], list, revocationKey)
      await revokeKey(accounts[0], list, revocationKey, accounts[0]);
      await checkForPositiveRevocation(accounts[0], list, revocationKey)
    });

    it("setting positive & negative revocation", async function () {
      await checkForNegativeRevocation(accounts[1], list, revocationKey)
      await revokeKey(accounts[1], list, revocationKey, accounts[1]);
      await checkForPositiveRevocation(accounts[1], list, revocationKey)
      await unrevokeKey(accounts[1], list, revocationKey, accounts[1]);
      await checkForNegativeRevocation(accounts[1], list, revocationKey)
    });

    it("setting negative revocation without change", async function () {
      await checkForNegativeRevocation(accounts[2], list, revocationKey)
      await unrevokeKey(accounts[2], list, revocationKey, accounts[2]);
      await checkForNegativeRevocation(accounts[2], list, revocationKey)
    });
  });
});
