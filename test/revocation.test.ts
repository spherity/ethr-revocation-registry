import {RevocationRegistryInstance} from "../types/truffle-contracts";
import {
  assertForNegativeRevocation,
  assertForPositiveRevocation,
  changeStatusesInList,
  revokeKey,
  unrevokeKey
} from "./utils";

const RevocationRegistry = artifacts.require("RevocationRegistry");

contract("Revocation", function (accounts) {
  let registry: RevocationRegistryInstance;
  const bobsAcc = accounts[0]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628";
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6";
  beforeEach(async () => {
    registry = await RevocationRegistry.deployed();
  })

  contract("[scoped state]", async function () {
    it("should be negative for every account", async function () {
      await assertForNegativeRevocation(registry, accounts[0], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[1], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[2], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[3], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[4], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[5], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[6], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[7], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[8], list, revocationKey);
      await assertForNegativeRevocation(registry, accounts[9], list, revocationKey);
    });
  });

  contract("[scoped state]", async function () {
    it("sets positive revocation state", async function () {
      await revokeKey(registry, bobsAcc, list, revocationKey, bobsAcc);
      await assertForPositiveRevocation(registry, bobsAcc, list, revocationKey);
    });
  });

  contract("[scoped state]", async function () {
    it("sets positive & negative revocation state", async function () {
      await revokeKey(registry, bobsAcc, list, revocationKey, bobsAcc);
      await assertForPositiveRevocation(registry, bobsAcc, list, revocationKey);
      await unrevokeKey(registry, bobsAcc, list, revocationKey, bobsAcc);
      await assertForNegativeRevocation(registry, bobsAcc, list, revocationKey);
    });
  });

  contract("[scoped state]", async function () {
    it("sets negative revocation without change", async function () {
      await unrevokeKey(registry, bobsAcc, list, revocationKey, bobsAcc);
      await assertForNegativeRevocation(registry, bobsAcc, list, revocationKey);
    });
  });

  contract("[scoped state]", async function () {
    it("bulk (un-)revokes keys in a namespace's list", async function () {
      const revocations = {
        [web3.utils.keccak256("revocationKey1")]: true,
        [web3.utils.keccak256("revocationKey2")]: false,
        [web3.utils.keccak256("revocationKey3")]: false,
        [web3.utils.keccak256("revocationKey4")]: true,
      }
      await changeStatusesInList(registry, Object.values(revocations), bobsAcc, list, Object.keys(revocations), bobsAcc);

      for (const [key, value] of Object.entries(revocations)) {
        if (value) {
          await assertForPositiveRevocation(registry, bobsAcc, list, key);
        } else {
          await assertForNegativeRevocation(registry, bobsAcc, list, key);
        }
      }
    });
  });
});
