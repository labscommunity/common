export interface ActionInterface {
    input: any;
    caller: string;
}

export type InvocationInterface = {
    [key in string | number]: any;
} & {
    function: string;
};

export interface OrderInterface {
    id: string;
    transfer: string;
    creator: string;
    token: string;
    price: number;
    quantity: number;
    originalQuantity: number;
}

export interface ForeignCallInterface {
    txID: string;
    contract: string;
    input: InvocationInterface;
}

export interface ClobState {
    emergencyHaltWallet: string;
    halted: boolean;
    protocolFeePercent: number;
    pairGatekeeper: boolean;
    communityContract: string;
    pairs: {
        pair: [string, string];
        orders: OrderInterface[];
    }[];
    invocations: string[];
    foreignCalls: ForeignCallInterface[];
}
