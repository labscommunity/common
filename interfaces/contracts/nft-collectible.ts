import {ForeignCallInterface} from "./clob";

export interface CollectibleState {
    name: string;
    ticker: string;
    title: string;
    description: string;
    owner: string;
    allowMinting: boolean;

    balances: { [address: string]: number };

    contentType: string;
    createdAt: string;

    // TODO: add foreign call protocol support for NFT contracts
    invocations: string[];
    foreignCalls: ForeignCallInterface[];
}
