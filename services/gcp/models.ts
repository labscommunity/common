import {entity} from "@google-cloud/datastore/build/src/entity";
import {Operator, OrderOptions} from "@google-cloud/datastore/build/src/query";
import {FileOptions} from "@google-cloud/storage";

export interface GcpCredentialsProvider {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}

export type DatastoreEntities = entity.Key | Array<entity.Key>;

export interface DatastoreEntity<T = any> {
    key: entity.Key;
    data: T;
    excludeFromIndexes?: Array<string>
}

export interface EntityBuilder<T = any, Kind = string> {
    kind: Kind | string,
    id: string,
    data: T;
    excludeFromIndexes?: Array<string>
}

export interface QueryableFilter {
    property: string;
    operator: Operator;
    value: any;
}

export interface QueryableBase {
    limit?: number;
    offset?: number;
    filters?: Array<QueryableFilter>;
    order?: [string, OrderOptions];
    cursor?: string;
    groupBy?: string | string[];
}

export interface Queryable<Kind = string> extends QueryableBase {
    kind: Kind | string;
}

export interface QueryResultBase<T = any> {
    entities: Array<T>;
    resultsStatus: string;
    cursor: string | undefined;
}

export interface QueryResult<T = any> extends QueryResultBase<T> {
    isEmpty: () => boolean
}

export interface PaginatedQueryResult<T = any> {
    entities: Array<T>,
    nextPage: () => Promise<PaginatedQueryResult<T>> | undefined;
    cursor: string | undefined;
}

export interface FileSaveInfo {
    fileName: string;
    fileContent: string | Buffer;
    options?: FileOptions;
}
