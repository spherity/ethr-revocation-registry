const RevocationRegistry = artifacts.require('RevocationRegistry')

const migration: Truffle.Migration = function (deployer) {
  deployer.deploy(RevocationRegistry)
}

module.exports = migration

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}