import {upgradeProxy} from "@openzeppelin/truffle-upgrades";

const RevocationRegistry: any = artifacts.require('RevocationRegistry')

module.exports = async function (deployer: any) {
  const existing = await RevocationRegistry.deployed();
  await upgradeProxy(existing.address, RevocationRegistry, { deployer });
};
// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}