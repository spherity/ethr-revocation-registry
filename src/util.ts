import {TypedDataField} from "ethers";

export const EIP712DomainName = "Revocation Registry"

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

export const EIP712ChangeStatusInListType = {
    ChangeStatusesInList: [
        {name: 'revoked', type: 'bool[]'},
        {name: 'namespace', type: 'address'},
        {name: 'revocationList', type: 'bytes32'},
        {name: 'revocationKeys', type: 'bytes32[]'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
    ]
}

export const EIP712ChangeStatusesInListDelegatedType = {
    ChangeStatusesInListDelegated: [
        {name: 'revoked', type: 'bool[]'},
        {name: 'namespace', type: 'address'},
        {name: 'revocationList', type: 'bytes32'},
        {name: 'revocationKeys', type: 'bytes32[]'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
    ]
}

export const EIP712ChangeListOwnerType = {
    ChangeListOwner: [
        {name: 'namespace', type: 'address'},
        {name: 'newOwner', type: 'address'},
        {name: 'revocationList', type: 'bytes32'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
    ]
}

export const EIP712AddListDelegateType = {
    AddListDelegate: [
        {name: 'namespace', type: 'address'},
        {name: 'delegate', type: 'address'},
        {name: 'revocationList', type: 'bytes32'},
        {name: 'validity', type: 'uint'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
    ]
}

export const EIP712RemoveListDelegateType = {
    RemoveListDelegate: [
        {name: 'namespace', type: 'address'},
        {name: 'delegate', type: 'address'},
        {name: 'revocationList', type: 'bytes32'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
    ]
}

export const EIP712ChangeListStatusType = {
    ChangeListStatus: [
        {name: 'revoked', type: 'bool'},
        {name: 'namespace', type: 'address'},
        {name: 'revocationList', type: 'bytes32'},
        {name: 'signer', type: 'address'},
        {name: 'nonce', type: 'uint'},
    ]
}