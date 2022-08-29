const RevocationRegistry = artifacts.require("RevocationRegistry");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("RevocationRegistry", function (/* accounts */) {
  it("should assert true", async function () {
    await RevocationRegistry.deployed();
    return assert.isTrue(true);
  });
});
