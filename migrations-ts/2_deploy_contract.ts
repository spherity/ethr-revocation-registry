const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const tdr = require('truffle-deploy-registry')

const RevocationRegistry = artifacts.require('RevocationRegistry')

module.exports = async function (deployer: any) {
  const registry = await deployProxy(RevocationRegistry, [], { deployer });
  tdr.appendInstance(registry)
}

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}