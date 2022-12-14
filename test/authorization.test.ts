import {RevocationRegistryInstance} from "../types-ts/truffle-v5";
import {
  addListDelegate,
  changeListOwner,
  removeListDelegate,
  revokeKey,
  revokeKeyDelegated, unrevokeKey
} from "./utils";
import {deployProxy} from "@openzeppelin/truffle-upgrades";

const RevocationRegistry: any = artifacts.require('RevocationRegistry')

contract("Authorization", async (accounts) => {
  let registry: RevocationRegistryInstance;
  const bobsAcc = accounts[0]
  const aliceAcc = accounts[1]
  const klausAcc = accounts[2]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"

  beforeEach(async () => {
    const deployedProxy: any = await deployProxy(RevocationRegistry, []);
    registry = deployedProxy;
  });

  contract("should fail revocation", async () => {
    it("if unauthorized account trys to change a foreign list", async () => {
      try {
        await revokeKey(registry, bobsAcc, list, revocationKey, aliceAcc)
        assert.isFalse(true)
      } catch (error: any) {
        assert.include(error.message, "Caller is not an owner")
      }
    })

    it("if unauthorized account trys to bulk (un-)revoke keys", async function () {
      const revocations = {
        [web3.utils.keccak256("revocationKey1")]: true,
        [web3.utils.keccak256("revocationKey2")]: false,
        [web3.utils.keccak256("revocationKey3")]: false,
        [web3.utils.keccak256("revocationKey4")]: true,
      }

      try {
        for (const [revocationKey, revoke] of Object.entries(revocations)) {
          if (revoke) {
            await revokeKey(registry, bobsAcc, list, revocationKey, aliceAcc);
          } else {
            await unrevokeKey(registry, bobsAcc, list, revocationKey, aliceAcc);
          }
        }
        assert.isFalse(true)
      } catch (error: any) {
        assert.include(error.message, "Caller is not an owner")
      }
    });
  })

  contract("should fail revocation (owner change)", async () => {
    it("if original owner try to revoke a key after an owner change", async () => {
      await changeListOwner(registry, bobsAcc, aliceAcc, list, bobsAcc)
      try {
        await revokeKey(registry, bobsAcc, list, revocationKey, bobsAcc)
        assert.isFalse(true)
      } catch (error: any) {
        assert.include(error.message, "Caller is not an owner")
      }
    })
  })

  contract("should respect missing delegate status", async () => {
    it("if some arbitrary account trys to revoke a key", async () => {
      try {
        await revokeKeyDelegated(registry, bobsAcc, list, revocationKey, klausAcc)
        assert.isFalse(true)
      } catch (error: any) {
        assert.include(error.message, "Caller is not a delegate")
      }
    });

    it("if an expired delegate trys to revoke a key", async () => {
      const validity = Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24) / 1000)
      await addListDelegate(registry, bobsAcc, aliceAcc, list, validity, bobsAcc)
      try {
        await revokeKeyDelegated(registry, bobsAcc, list, revocationKey, aliceAcc)
        assert.isFalse(true)
      } catch (error: any) {
        assert.include(error.message, "Caller is not a delegate")
      }
    })

    it("if a removed delegate trys to revoke a key", async () => {
      await removeListDelegate(registry, bobsAcc, aliceAcc, list, bobsAcc)
      try {
        await revokeKeyDelegated(registry, bobsAcc, list, revocationKey, aliceAcc)
        assert.isFalse(true)
      } catch (error: any) {
        assert.include(error.message, "Caller is not a delegate")
      }
    })
  })
})