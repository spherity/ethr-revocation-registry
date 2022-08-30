import {RevocationRegistryInstance} from "../types/truffle-contracts";
import {changeListOwner, revokeKey} from "./utils";

const RevocationRegistry = artifacts.require("RevocationRegistry");

contract("RevocationRegistry", async (accounts) => {
  let registry: RevocationRegistryInstance;
  const bobsAcc = accounts[0];
  const aliceAcc = accounts[1];
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628";
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"

  beforeEach(async () => {
    registry = await RevocationRegistry.deployed();
  })

  // TODO: extract into different contract() to reset env
  contract("should fail revocation", async function () {
    const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628";
    const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"

    it("if unauthorized account trys to change a foreign list", async () => {
      revokeKey(registry, bobsAcc, list, revocationKey, aliceAcc)
        .then(() => {
          // this should never be reached as the above function should throw an error
          assert.isFalse(true)
        })
        .catch(error => {
          assert.equal(error.reason, "Caller is not an owner");
        })
    })

    it("if original owner try to revoke a key after an owner change", async () => {
      await changeListOwner(registry, bobsAcc, aliceAcc, list, bobsAcc);
      revokeKey(registry, bobsAcc, list, revocationKey, aliceAcc)
        .then(() => {
          // this should never be reached as the above function should throw an error
          assert.isFalse(true)
        })
        .catch(error => {
          assert.equal(error.reason, "Caller is not an owner");
        })
    })
  })
})