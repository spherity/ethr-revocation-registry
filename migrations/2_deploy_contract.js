"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RevocationRegistry = artifacts.require('RevocationRegistry');
const migration = function (deployer) {
    deployer.deploy(RevocationRegistry);
};
module.exports = migration;
//# sourceMappingURL=2_deploy_contract.js.map