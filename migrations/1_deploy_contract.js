const RevocationRegistry = artifacts.require("RevocationRegistry");

module.exports = function(deployer) {
  deployer.deploy(RevocationRegistry);
};