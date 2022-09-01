import {addListDelegate, revokeKeyDelegated, unrevokeKeyDelegated} from "./utils";
import {RevocationRegistryInstance} from "../types/truffle-contracts";

const RevocationRegistry = artifacts.require("RevocationRegistry");

contract("Delegate", async (accounts) => {
  let registry: RevocationRegistryInstance;
  const bobsAcc = accounts[0]
  const aliceAcc = accounts[1]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"

  before(async () => {
    registry = await RevocationRegistry.deployed()
    const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
    await addListDelegate(registry, bobsAcc, aliceAcc, list, validity, bobsAcc)
  })

  it("should be able to revoke a key", async () => {
    await revokeKeyDelegated(registry, bobsAcc, list, revocationKey, aliceAcc)
  })

  it("should be able to unrevoke a key", async () => {
    await unrevokeKeyDelegated(registry, bobsAcc, list, revocationKey, aliceAcc)
  })
})