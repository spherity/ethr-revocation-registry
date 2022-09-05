import {upgradeProxy} from "@openzeppelin/truffle-upgrades";

const RevocationRegistry = artifacts.require('RevocationRegistry')
const RevocationRegistryV2: any = artifacts.require('RevocationRegistryV2')

module.exports = async function (deployer: any) {
  const existing = await RevocationRegistry.deployed();
  const instance = await upgradeProxy(existing.address, RevocationRegistryV2, { deployer });
};
// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}