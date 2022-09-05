import {upgradeProxy} from "@openzeppelin/truffle-upgrades";
import {assertForPositiveRevocation, revokeKey} from "./utils";
import {RevocationRegistry} from "../types/ethers-contracts";
import {RevocationRegistryInstance, RevocationRegistryV2TestInstance} from "../types/truffle-contracts";

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const RevocationRegistry = artifacts.require('RevocationRegistry')
const RevocationRegistryV2Test: any = artifacts.require("RevocationRegistryV2Test");

contract("RevocationRegistry", (accounts) => {
  const bobsAcc = accounts[0]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"
  let proxyContract: RevocationRegistryInstance;
  let newProxyContract: RevocationRegistryV2TestInstance;

  it ("deploys a proxy and its logic contract", async () => {
    const registry = await deployProxy(RevocationRegistry, []);
    proxyContract = registry;
  });

  it("should be able to revoke a key", async () => {
    await revokeKey(proxyContract, bobsAcc, list, revocationKey, bobsAcc);
    await assertForPositiveRevocation(proxyContract, bobsAcc, list, revocationKey);
  });

  it("upgrade works and address does not change", async function () {
    const registry2: any = await upgradeProxy(proxyContract.address, RevocationRegistryV2Test);
    assert.equal(proxyContract.address, registry2.address);
    newProxyContract = registry2;
  });

  it("previous revocation is still revoked", async function () {
    await assertForPositiveRevocation(newProxyContract, bobsAcc, list, revocationKey);
  });

  it("new test() function from v2 should be callable", async function () {
    const result: any = await newProxyContract.test();
    assert.equal(result.words[0], 777);
  });
});