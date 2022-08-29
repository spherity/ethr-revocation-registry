import {RevocationRegistryInstance} from "../types/truffle-contracts";

const RevocationRegistry = artifacts.require("RevocationRegistry");

contract("RevocationRegistry", function (accounts) {
  let registry: RevocationRegistryInstance;
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628";
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6";

  beforeEach(async () => {
    registry = await RevocationRegistry.deployed();
  })

  contract("should handle revocation", async function () {
    it("setting positive revocation", async function () {
      await registry.changeStatus.sendTransaction(true, accounts[0], list, revocationKey, {from: accounts[0]});
      const revoked = await registry.isRevoked(accounts[0], list, revocationKey)
      assert.isTrue(revoked);
    });

    it("setting positive & negative revocation", async function () {
      let revoked = await registry.isRevoked(accounts[1], list, revocationKey)
      assert.isFalse(revoked);
      await registry.changeStatus.sendTransaction(true, accounts[1], list, revocationKey, {from: accounts[1]});
      revoked = await registry.isRevoked(accounts[1], list, revocationKey)
      assert.isTrue(revoked);
      await registry.changeStatus.sendTransaction(false, accounts[1], list, revocationKey, {from: accounts[1]});
      revoked = await registry.isRevoked(accounts[1], list, revocationKey)
      assert.isFalse(revoked);
      revoked = await registry.isRevoked(accounts[1], list, revocationKey)
      assert.isFalse(revoked);
    });

    it("setting negative revocation without change", async function () {
      let revoked = await registry.isRevoked(accounts[2], list, revocationKey)
      assert.isFalse(revoked);
      await registry.changeStatus.sendTransaction(false, accounts[2], list, revocationKey, {from: accounts[2]});
      revoked = await registry.isRevoked(accounts[2], list, revocationKey)
      assert.isFalse(revoked);
    });
  });
});
