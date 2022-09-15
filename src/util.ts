import {TypedDataField} from "ethers";

export const EIP712ChangeStatusType = {
    ChangeStatus: [
        {name: 'revoked', type: 'bool'} as TypedDataField,
        {name: 'namespace', type: 'address'} as TypedDataField,
        {name: 'revocationList', type: 'bytes32'} as TypedDataField,
        {name: 'revocationKey', type: 'bytes32'} as TypedDataField,
        {name: 'signer', type: 'address'} as TypedDataField,
        {name: 'nonce', type: 'uint'} as TypedDataField,
    ]
}

export const EIP712ChangeStatusDelegatedType = {
    ChangeStatusDelegated: [
        {name: 'revoked', type: 'bool'} as TypedDataField,
        {name: 'namespace', type: 'address'} as TypedDataField,
        {name: 'revocationList', type: 'bytes32'} as TypedDataField,
        {name: 'revocationKey', type: 'bytes32'} as TypedDataField,
        {name: 'signer', type: 'address'} as TypedDataField,
        {name: 'nonce', type: 'uint'} as TypedDataField,
    ]
}