import {ForeignCallInterface} from "./clob";

export interface CollectionState {
    name: string;
    description: string;
    owner: string;
    collaborators: string[];
    items: string[];
    // TODO: add foreign call protocol support for collection contracts
    invocations: string[];
    foreignCalls: ForeignCallInterface[];
}
