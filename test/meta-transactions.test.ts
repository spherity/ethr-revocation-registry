import {RevocationRegistryInstance} from "../types-ts/truffle-v5";
import {
  addListDelegate,
  addListDelegateSigned,
  assertForNegativeRevocation,
  assertForPositiveRevocation,
  assertListDelegateAddedEvent,
  assertListDelegateRemovedEvent,
  assertListOwnerChangedEvent, assertListStatusChangedEvent,
  assertRevocationStatusChangedEvent,
  changeListOwnerSigned, changeListStatusSigned,
  changeStatusesInListDelegatedSigned,
  changeStatusesInListSigned,
  generateEIP712Params,
  getEIP721DomainObject,
  getNonce,
  removeListDelegateSigned,
  SignedFunction,
  signTypedData
} from "./utils";
import {deployProxy} from "@openzeppelin/truffle-upgrades";

const RevocationRegistry: any = artifacts.require("RevocationRegistry");

contract("Meta Transaction", function (accounts) {
  let registry: RevocationRegistryInstance
  let domainObject = {}
  const caller = accounts[0]
  const list = "0x3458b9bfc7963978b7d40ef225177c45193c2889902357db3b043a4e319a9628"
  const revocationKey = "0x89343794d2fb7dd5d0fba9593a4bb13beaff93a61577029176d0117b0c53b8e6"

  beforeEach(async () => {
    const deployedProxy: any = await deployProxy(RevocationRegistry, []);
    registry = deployedProxy;
    domainObject = await getEIP721DomainObject(registry)
  })


  contract("[scoped state]", async () =>{
    it("sets revocation via owner", async () => {
      const signer = accounts[1]
      const nonce = await getNonce(registry, signer)
      const message = {
        revoked: true,
        namespace: signer,
        revocationList: list,
        revocationKey: revocationKey,
        signer: signer,
        nonce: nonce
      }
      const params = generateEIP712Params(SignedFunction.CHANGE_STATUS, domainObject, message)
      const signature = await signTypedData(signer, params)

      const tx: any = await registry.changeStatusSigned(true, signer, list, revocationKey, signer, signature, {from: caller})

      assert.isTrue(await registry.isRevoked(signer, list, revocationKey))
      assert.isFalse(await registry.isRevoked(caller, list, revocationKey))
      assertRevocationStatusChangedEvent(tx.logs[0], signer, list, revocationKey, true)
    });
  });

  contract("[scoped state]", async () =>{
    it("sets revocation via a delegate", async () => {
      const owner = accounts[1]
      const delegate = accounts[2]
      const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
      await addListDelegate(registry, owner, delegate, list, validity, owner);

      const nonce = await getNonce(registry, delegate)
      const message = {
        revoked: true,
        namespace: owner,
        revocationList: list,
        revocationKey: revocationKey,
        signer: delegate,
        nonce: nonce
      }
      const params = generateEIP712Params(SignedFunction.CHANGE_STATUS_DELEGATED, domainObject, message)
      const signature = await signTypedData(delegate, params)

      const tx: any = await registry.changeStatusDelegatedSigned(true, owner, list, revocationKey, delegate, signature, {from: caller})

      assert.isTrue(await registry.isRevoked(owner, list, revocationKey))
      assertRevocationStatusChangedEvent(tx.logs[0], owner, list, revocationKey, true)
    })
  });

  contract("[scoped state]", async () =>{
    it("batch (un-)revoked keys via owner", async () => {
      const signer = accounts[1]
      const revocations = {
        [web3.utils.keccak256("revocationKey1")]: true,
        [web3.utils.keccak256("revocationKey2")]: false,
        [web3.utils.keccak256("revocationKey3")]: false,
        [web3.utils.keccak256("revocationKey4")]: true
      }

      const nonce = await getNonce(registry, signer)
      const message = {
        revoked: Object.values(revocations),
        namespace: signer,
        revocationList: list,
        revocationKeys: Object.keys(revocations),
        signer: signer,
        nonce: nonce
      }
      const params = generateEIP712Params(SignedFunction.CHANGE_STATUSES_IN_LIST, domainObject, message)
      const signature = await signTypedData(signer, params)
      const tx = await changeStatusesInListSigned(registry, Object.values(revocations), signer, list, Object.keys(revocations), signer, signature, caller)
      for (const event of tx.logs) {
        const eventArgs: any = event.args;
        const expectedRevocationStatus = revocations[eventArgs.revocationKey]
        assertRevocationStatusChangedEvent(event, signer, list, eventArgs.revocationKey, expectedRevocationStatus)
      }
      for (const [key, value] of Object.entries(revocations)) {
        if (value) {
          await assertForPositiveRevocation(registry, signer, list, key);
        } else {
          await assertForNegativeRevocation(registry, signer, list, key);
        }
      }
    })
  });

  contract("[scoped state]", async () =>{
    it("batch (un-)revoked keys via delegate", async () => {
      const owner = accounts[1]
      const delegate = accounts[2]
      const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
      await addListDelegate(registry, owner, delegate, list, validity, owner);

      const revocations = {
        [web3.utils.keccak256("revocationKey1")]: true,
        [web3.utils.keccak256("revocationKey2")]: false,
        [web3.utils.keccak256("revocationKey3")]: false,
        [web3.utils.keccak256("revocationKey4")]: true
      }

      const nonce = await getNonce(registry, delegate)
      const message = {
        revoked: Object.values(revocations),
        namespace: owner,
        revocationList: list,
        revocationKeys: Object.keys(revocations),
        signer: delegate,
        nonce: nonce
      }

      const params = generateEIP712Params(SignedFunction.CHANGE_STATUSES_IN_LIST_DELEGATED, domainObject, message)
      const signature = await signTypedData(delegate, params)
      const tx: any = await changeStatusesInListDelegatedSigned(registry, Object.values(revocations), owner, list, Object.keys(revocations), delegate, signature, caller)
      for (const event of tx.logs) {
        const eventArgs: any = event.args;
        const expectedRevocationStatus = revocations[eventArgs.revocationKey]
        assertRevocationStatusChangedEvent(event, owner, list, eventArgs.revocationKey, expectedRevocationStatus)
      }

      for (const [key, value] of Object.entries(revocations)) {
        if (value) {
          await assertForPositiveRevocation(registry, owner, list, key);
        } else {
          await assertForNegativeRevocation(registry, owner, list, key);
        }
      }
    })
  });

  contract("[scoped state]", async () =>{
    it("changes list owner via owner", async () => {
      const signer = accounts[0]
      const newOwner = accounts[1]

      const nonce = await getNonce(registry, signer)
      const message = {
        namespace: signer,
        newOwner: newOwner,
        revocationList: list,
        signer: signer,
        nonce: nonce
      }

      const params = generateEIP712Params(SignedFunction.CHANGE_LIST_OWNER, domainObject, message)
      const signature = await signTypedData(signer, params)
      const tx: any = await changeListOwnerSigned(registry, signer, newOwner, list, signer, signature, caller)

      assertListOwnerChangedEvent(tx.logs[0], signer, list, newOwner)
      assert.isTrue(await registry.identityIsOwner(signer, list, newOwner))
      assert.isFalse(await registry.identityIsOwner(signer, list, signer))
    })
  });

  contract("[scoped state]", async () =>{
    it("add list delegate owner via owner", async () => {
      const signer = accounts[4]
      const delegate = accounts[2]
      const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)

      const nonce = await getNonce(registry, signer)
      const message = {
        namespace: signer,
        delegate: delegate,
        revocationList: list,
        validity: validity,
        signer: signer,
        nonce: nonce
      }

      const params = generateEIP712Params(SignedFunction.ADD_LIST_DELEGATE, domainObject, message)
      const signature = await signTypedData(signer, params)
      const tx0 = await addListDelegateSigned(registry, signer, delegate, list, validity, signer, signature, caller);

      assertListDelegateAddedEvent(tx0.logs[0], signer, delegate, list)
      assert.isTrue(await registry.identityIsDelegate(signer, list, delegate))
    })
  });

  contract("[scoped state]", async () =>{
    it("remove list delegate owner via owner", async () => {
      const signer = accounts[5]
      const delegate = accounts[2]
      const validity = Math.floor((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)
      await addListDelegate(registry, signer, delegate, list, validity, signer);
      assert.isTrue(await registry.identityIsDelegate(signer, list, delegate))

      const nonce = await getNonce(registry, signer)
      const message = {
        namespace: signer,
        delegate: delegate,
        revocationList: list,
        signer: signer,
        nonce: nonce
      }

      const params = generateEIP712Params(SignedFunction.REMOVE_LIST_DELEGATE, domainObject, message)
      const signature = await signTypedData(signer, params)
      const tx: any = await removeListDelegateSigned(registry, signer, delegate, list, signer, signature, caller);

      assertListDelegateRemovedEvent(tx.logs[0], signer, delegate, list)
      assert.isFalse(await registry.identityIsDelegate(signer, list, delegate))
    })
  });

  contract("[scoped state]", async function () {
    it("change list status to revoked", async function () {
      const signer = accounts[0]

      const nonce = await getNonce(registry, signer)
      const message = {
        revoked: true,
        namespace: signer,
        revocationList: list,
        signer: signer,
        nonce: nonce
      }

      const params = generateEIP712Params(SignedFunction.CHANGE_LIST_STATUS, domainObject, message)
      const signature = await signTypedData(signer, params)

      await assertForNegativeRevocation(registry, signer, list, revocationKey);
      const tx: any = await changeListStatusSigned(registry, signer, list, true, signer, signature, caller);
      assertListStatusChangedEvent(tx.logs[0], signer, list, true);
      assert.isTrue(await registry.listIsRevoked(signer, list));
      await assertForPositiveRevocation(registry, signer, list, revocationKey);
    })
  })
})
