import {RevocationRegistryInstance} from "../types/truffle-contracts";
import {HttpProvider} from "web3-core";

const RevocationRegistry = artifacts.require("RevocationRegistry");

function generateParams(domainObject: any, primaryType: string, message: any) {
  return {
    domain: domainObject,
    message: message,
    primaryType: primaryType,
    types: {
      // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      ChangeStatus: [
        {name: 'revoked', type: 'bool'},
        {name: 'namespace', type: 'address'},
        {name: 'list', type: 'bytes32'},
        {name: 'revocationKey', type: 'bytes32'},
      ]
    },
  };
}

contract("Meta Transaction", function (accounts) {
  let registry: RevocationRegistryInstance;
  let domainObject = {};
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628";
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6";

  beforeEach(async () => {
    registry = await RevocationRegistry.deployed();
    domainObject = {
      name: 'Revocation Registry',
      version: await registry.version(),
      chainId: await web3.eth.getChainId(),
      verifyingContract: registry.address,
    }
  })

  it("sets positive revocation with meta transaction", async function () {
    const signer = accounts[0];
    const caller = accounts[1];
    const message = {
      revoked: true,
      namespace: signer,
      list: list,
      revocationKey: revocationKey,
    };

    const params = generateParams(domainObject, "ChangeStatus", message);
    const signature: string = await new Promise((resolve, reject) => {
      (web3.eth.currentProvider as HttpProvider).send({
        jsonrpc: "2.0",
        method: 'eth_signTypedData',
        params: [signer, params],
      }, function (err: any, result: any) {
        if (err) {
          reject(err);
        }
        resolve(result.result);
      })
    });
    await registry.changeStatusSigned(true, signer, list, revocationKey, signature, {from: caller});
    assert.isTrue(await registry.isRevoked(signer, list, revocationKey));
    assert.isFalse(await registry.isRevoked(caller, list, revocationKey));
  });
});
