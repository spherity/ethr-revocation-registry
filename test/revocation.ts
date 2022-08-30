import {RevocationRegistryInstance} from "../types/truffle-contracts";

const RevocationRegistry = artifacts.require("RevocationRegistry");

contract("RevocationRegistry", function (accounts) {
  let registry: RevocationRegistryInstance;
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628";
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6";

  async function assertForNegativeRevocation(namespace: string, list: string, revocationKey: string) {
    assert.isFalse(await registry.isRevoked(namespace, list, revocationKey));
  }

  async function assertForPositiveRevocation(namespace: string, list: string, revocationKey: string) {
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

  contract("[scoped state]", async function () {
    it("should be negative for every account", async function () {
      await assertForNegativeRevocation(accounts[0], list, revocationKey);
      await assertForNegativeRevocation(accounts[1], list, revocationKey);
      await assertForNegativeRevocation(accounts[2], list, revocationKey);
      await assertForNegativeRevocation(accounts[3], list, revocationKey);
      await assertForNegativeRevocation(accounts[4], list, revocationKey);
      await assertForNegativeRevocation(accounts[5], list, revocationKey);
      await assertForNegativeRevocation(accounts[6], list, revocationKey);
      await assertForNegativeRevocation(accounts[7], list, revocationKey);
      await assertForNegativeRevocation(accounts[8], list, revocationKey);
      await assertForNegativeRevocation(accounts[9], list, revocationKey);
    });
  });

  contract("[scoped state]", async function () {
    it("setting positive revocation state", async function () {
      await revokeKey(accounts[0], list, revocationKey, accounts[0]);
      await assertForPositiveRevocation(accounts[0], list, revocationKey);
    });
  });

  contract("[scoped state]", async function () {
    it("setting positive & negative revocation state", async function () {
      await revokeKey(accounts[0], list, revocationKey, accounts[0]);
      await assertForPositiveRevocation(accounts[0], list, revocationKey);
      await unrevokeKey(accounts[0], list, revocationKey, accounts[0]);
      await assertForNegativeRevocation(accounts[0], list, revocationKey);
    });
  });

  contract("[scoped state]", async function () {
    it("setting negative revocation without change", async function () {
      await unrevokeKey(accounts[0], list, revocationKey, accounts[0]);
      await assertForNegativeRevocation(accounts[0], list, revocationKey);
    });
  });
});
