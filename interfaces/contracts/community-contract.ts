export type ArweaveAddress = string;
export type ArweaveTransaction = string;
export type TokenTypes = "art" | "collection" | "community" | "custom";

export interface CommunityPeople {
    username: string;
    name: string;
    addresses: Array<ArweaveAddress>;
    image?: ArweaveTransaction;
    bio: string;
    links: "" | {
        [prop: string]: string;
    };
}

export interface CommunityToken {
    id: ArweaveTransaction;
    type: TokenTypes;
    lister: string;
}

export interface CommunityContract {
    people: Array<CommunityPeople>
    tokens: Array<CommunityToken>
}
