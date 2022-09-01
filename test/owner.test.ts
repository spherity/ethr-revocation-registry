import {RevocationRegistryInstance} from "../types/truffle-contracts";
import {
  addListDelegate,
  assertListDelegateAdded,
  assertListDelegateRemoved, assertListOwnerChanged,
  changeListOwner,
  removeListDelegate
} from "./utils";

const RevocationRegistry = artifacts.require("RevocationRegistry");

contract("Owner", async (accounts) => {
  let registry: RevocationRegistryInstance;
  const bobsAcc = accounts[0]
  const aliceAcc = accounts[1]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"

  before(async () => {
    registry = await RevocationRegistry.deployed()
  })

  it("should be able to add a delegate to a list in its namespace", async () => {
    const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
    await addListDelegate(registry, bobsAcc, aliceAcc, list, validity, bobsAcc)
    assert.isTrue(await registry.identityIsDelegate(bobsAcc, list, aliceAcc))
  })

  it("should be able to remove a delegate to a list in its namespace", async () => {
    await removeListDelegate(registry, bobsAcc, aliceAcc, list, bobsAcc)
    assert.isFalse(await registry.identityIsDelegate(bobsAcc, list, aliceAcc))
  })

  it("should emit an event when adding/ removing a delegate", async () => {
    const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
    const tx1: any = await addListDelegate(registry, bobsAcc, aliceAcc, list, validity, bobsAcc)
    const tx2: any = await removeListDelegate(registry, bobsAcc, aliceAcc, list, bobsAcc)
    assertListDelegateAdded(tx1.logs[0], bobsAcc, aliceAcc, list)
    assertListDelegateRemoved(tx2.logs[0], bobsAcc, aliceAcc, list)
  })

  it("should emit an event when changing the owner of a list", async () => {
    const tx: any = await changeListOwner(registry, bobsAcc, aliceAcc, list, bobsAcc)
    assertListOwnerChanged(tx.logs[0], bobsAcc, list, aliceAcc)
  })

  it("should be able to change the owner of a list in its namespace", async () => {
    await changeListOwner(registry, bobsAcc, bobsAcc, list, aliceAcc)
    assert.isTrue(await registry.identityIsOwner(bobsAcc, list, bobsAcc))
    assert.isFalse(await registry.identityIsOwner(bobsAcc, list, aliceAcc))
  })
})