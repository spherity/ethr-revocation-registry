export interface EIP712Domain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}

export async function getEIP721DomainObject(version: string, chainId: number, address: string): Promise<EIP712Domain> {
    return {
        name: 'Revocation Registry',
        version: version,
        chainId: chainId,
        verifyingContract: address,
    };
}

export enum SignedFunction {
    CHANGE_STATUS = "ChangeStatus",
    CHANGE_STATUS_DELEGATED = "ChangeStatusDelegated",
    CHANGE_STATUSES_IN_LIST = "ChangeStatusesInList",
    CHANGE_STATUSES_IN_LIST_DELEGATED = "ChangeStatusesInListDelegated",
    CHANGE_LIST_OWNER = "ChangeListOwner",
    CHANGE_LIST_STATUS = "ChangeListStatus",
    ADD_LIST_DELEGATE = "AddListDelegate",
    REMOVE_LIST_DELEGATE = "RemoveListDelegate",
}

// TODO: replace any with correct type and maybe throw it into the types-ts folder?
export interface EIP712Params {
    domain: any;
    message: any;
    primaryType: string;
    types: any;
}

export function generateEIP712Params(signedFunction: SignedFunction, domainObject: any, message: any) {
    const params: EIP712Params = {
        domain: domainObject,
        message: message,
        primaryType: "",
        types: {
            // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ]
        },
    }

    switch (signedFunction) {
        case SignedFunction.CHANGE_STATUS:
            params.primaryType = "ChangeStatus";
            params.types.ChangeStatus = [
                {name: 'revoked', type: 'bool'},
                {name: 'namespace', type: 'address'},
                {name: 'revocationList', type: 'bytes32'},
                {name: 'revocationKey', type: 'bytes32'},
                {name: 'signer', type: 'address'},
                {name: 'nonce', type: 'uint'},
            ]
            break;
        case SignedFunction.CHANGE_STATUS_DELEGATED:
            params.primaryType = "ChangeStatusDelegated";
            params.types.ChangeStatusDelegated = [
                {name: 'revoked', type: 'bool'},
                {name: 'namespace', type: 'address'},
                {name: 'revocationList', type: 'bytes32'},
                {name: 'revocationKey', type: 'bytes32'},
                {name: 'signer', type: 'address'},
                {name: 'nonce', type: 'uint'},
            ]
            break;
        case SignedFunction.CHANGE_STATUSES_IN_LIST:
            params.primaryType = "ChangeStatusesInList";
            params.types.ChangeStatusesInList = [
                {name: 'revoked', type: 'bool[]'},
                {name: 'namespace', type: 'address'},
                {name: 'revocationList', type: 'bytes32'},
                {name: 'revocationKeys', type: 'bytes32[]'},
                {name: 'signer', type: 'address'},
                {name: 'nonce', type: 'uint'},
            ]
            break;
        case SignedFunction.CHANGE_STATUSES_IN_LIST_DELEGATED:
            params.primaryType = "ChangeStatusesInListDelegated";
            params.types.ChangeStatusesInListDelegated = [
                {name: 'revoked', type: 'bool[]'},
                {name: 'namespace', type: 'address'},
                {name: 'revocationList', type: 'bytes32'},
                {name: 'revocationKeys', type: 'bytes32[]'},
                {name: 'signer', type: 'address'},
                {name: 'nonce', type: 'uint'},
            ]
            break;
        case SignedFunction.CHANGE_LIST_OWNER:
            params.primaryType = "ChangeListOwner";
            params.types.ChangeListOwner = [
                {name: 'namespace', type: 'address'},
                {name: 'newOwner', type: 'address'},
                {name: 'revocationList', type: 'bytes32'},
                {name: 'signer', type: 'address'},
                {name: 'nonce', type: 'uint'},
            ]
            break;
        case SignedFunction.ADD_LIST_DELEGATE:
            params.primaryType = "AddListDelegate";
            params.types.AddListDelegate = [
                {name: 'namespace', type: 'address'},
                {name: 'delegate', type: 'address'},
                {name: 'revocationList', type: 'bytes32'},
                {name: 'validity', type: 'uint'},
                {name: 'signer', type: 'address'},
                {name: 'nonce', type: 'uint'},
            ]
            break;
        case SignedFunction.REMOVE_LIST_DELEGATE:
            params.primaryType = "RemoveListDelegate";
            params.types.RemoveListDelegate = [
                {name: 'namespace', type: 'address'},
                {name: 'delegate', type: 'address'},
                {name: 'revocationList', type: 'bytes32'},
                {name: 'signer', type: 'address'},
                {name: 'nonce', type: 'uint'},
            ]
            break;
        case SignedFunction.CHANGE_LIST_STATUS:
            params.primaryType = "ChangeListStatus";
            params.types.ChangeListStatus = [
                {name: 'revoked', type: 'bool'},
                {name: 'namespace', type: 'address'},
                {name: 'revocationList', type: 'bytes32'},
                {name: 'signer', type: 'address'},
                {name: 'nonce', type: 'uint'},
            ]
    }
    return params;
}