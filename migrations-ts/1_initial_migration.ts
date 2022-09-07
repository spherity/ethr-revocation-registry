const tdr = require('truffle-deploy-registry')
const Migrations = artifacts.require('Migrations')

module.exports = async (deployer: any) => {
  await deployer.deploy(Migrations).then((migrationsInstance: any) => {
    return tdr.appendInstance(migrationsInstance)
  })
}

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}