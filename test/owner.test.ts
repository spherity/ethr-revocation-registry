import {RevocationRegistryInstance} from "../types-ts/truffle-contracts";
import {
  addListDelegate,
  assertListDelegateAddedEvent,
  assertListDelegateRemovedEvent, assertListOwnerChangedEvent,
  changeListOwner,
  removeListDelegate
} from "./utils";
import {deployProxy} from "@openzeppelin/truffle-upgrades";

const RevocationRegistry: any = artifacts.require("RevocationRegistry");

contract("Owner", async (accounts) => {
  let registry: RevocationRegistryInstance;
  const bobsAcc = accounts[0]
  const aliceAcc = accounts[1]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"

  beforeEach(async () => {
    const deployedProxy: any = await deployProxy(RevocationRegistry, []);
    registry = deployedProxy;
  });

  contract("[scoped state]", async () => {
    it("should be able to add a delegate to a list in its namespace", async () => {
      const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
      await addListDelegate(registry, bobsAcc, aliceAcc, list, validity, bobsAcc)
      assert.isTrue(await registry.identityIsDelegate(bobsAcc, list, aliceAcc))
    })
  })

  contract("[scoped state]", async () => {
    it("should be able to remove a delegate to a list in its namespace", async () => {
      await removeListDelegate(registry, bobsAcc, aliceAcc, list, bobsAcc)
      assert.isFalse(await registry.identityIsDelegate(bobsAcc, list, aliceAcc))
    })
  })

  contract("[scoped state]", async () => {
    it("should emit an event when adding/ removing a delegate", async () => {
      const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
      const tx1: any = await addListDelegate(registry, bobsAcc, aliceAcc, list, validity, bobsAcc)
      const tx2: any = await removeListDelegate(registry, bobsAcc, aliceAcc, list, bobsAcc)
      assertListDelegateAddedEvent(tx1.logs[0], bobsAcc, aliceAcc, list)
      assertListDelegateRemovedEvent(tx2.logs[0], bobsAcc, aliceAcc, list)
    })
  })

  contract("[scoped state]", async () => {
    it("should emit an event when changing the owner of a list", async () => {
      const tx: any = await changeListOwner(registry, bobsAcc, aliceAcc, list, bobsAcc)
      assertListOwnerChangedEvent(tx.logs[0], bobsAcc, list, aliceAcc)
    })
  })

  contract("[scoped state]", async () => {
    it("should be able to change the owner of a list in its namespace", async () => {
      await changeListOwner(registry, bobsAcc, aliceAcc, list, bobsAcc)
      assert.isTrue(await registry.identityIsOwner(bobsAcc, list, aliceAcc))
      assert.isFalse(await registry.identityIsOwner(bobsAcc, list, bobsAcc))
    })
  })
})