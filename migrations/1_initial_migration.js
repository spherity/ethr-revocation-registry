"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migrations = artifacts.require('Migrations');
const migration = function (deployer) {
    deployer.deploy(Migrations);
};
module.exports = migration;
//# sourceMappingURL=1_initial_migration.js.map