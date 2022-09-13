import {
  addListDelegate, assertForNegativeRevocation,
  assertForPositiveRevocation,
  assertRevocationStatusChangedEvent,
  revokeKeyDelegated,
  unrevokeKeyDelegated
} from "./utils";
import {RevocationRegistryInstance} from "../types-ts/truffle-contracts";
import {deployProxy} from "@openzeppelin/truffle-upgrades";

const RevocationRegistry: any = artifacts.require("RevocationRegistry");

contract("Delegate", async (accounts) => {
  let registry: RevocationRegistryInstance;
  const bobsAcc = accounts[0]
  const aliceAcc = accounts[1]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"

  beforeEach(async () => {
    const deployedProxy: any = await deployProxy(RevocationRegistry, []);
    registry = deployedProxy;
    const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
    await addListDelegate(registry, bobsAcc, aliceAcc, list, validity, bobsAcc)
  })

  contract("[scoped state]", async () => {
    it("should be able to revoke a key", async () => {
      await revokeKeyDelegated(registry, bobsAcc, list, revocationKey, aliceAcc)
      await assertForPositiveRevocation(registry, bobsAcc, list, revocationKey)
    })
  })

  contract("[scoped state]", async () => {
    it("should be able to unrevoke a key", async () => {
      await unrevokeKeyDelegated(registry, bobsAcc, list, revocationKey, aliceAcc)
      await assertForNegativeRevocation(registry, bobsAcc, list, revocationKey)
    })
  })

  contract("[scoped state]", async () => {
    it("should emit event when changing status", async () => {
      const tx: any = await revokeKeyDelegated(registry, bobsAcc, list, revocationKey, aliceAcc)
      assertRevocationStatusChangedEvent(tx.logs[0], bobsAcc, list, revocationKey, true)
    })
  })
})