import {Datastore, Query} from "@google-cloud/datastore";
import {GcpCredentials} from "./gcp-credentials";
import {
    DatastoreEntities,
    DatastoreEntity,
    EntityBuilder,
    PaginatedQueryResult,
    Queryable,
    QueryResult
} from "./models";
import {Entities, entity} from "@google-cloud/datastore/build/src/entity";
import {RunQueryOptions, RunQueryResponse} from "@google-cloud/datastore/build/src/query";
import {GetResponse, SaveResponse} from "@google-cloud/datastore/build/src/request";
import {sleep} from "../../utils";

/**
 * This service is responsible for interacting with Datastore on a common basis.
 */
export class GcpDatastoreService<Kind = string> {

    private datastoreInstance: Datastore;

    constructor() {
        this.renewConnection();
    }

    /**
     * Creates a {@link entity.key} to be used by google datastore.
     * @param kind Kind of the datastore information
     * @param id to be contained by the datastore row
     */
    createKey(kind: Kind | string, id: any): entity.Key {
        return this.datastoreInstance.key([kind, id]);
    }

    /**
     * Builds an entity based on a key and a data.
     * @param key
     * @param data
     * @param excludeFromIndexes
     */
    buildEntity<T = any>(key: entity.Key, data: T, excludeFromIndexes?: Array<string>): DatastoreEntity<T> {
        return {
            key,
            data,
            excludeFromIndexes
        }
    }

    /**
     * Saves ane entity based on {@link EntityBuilder}
     * @param entity
     */
    saveFull<T = any>(entity: EntityBuilder<Partial<T>, Kind>): Promise<SaveResponse> {
        const key = this.createKey(entity.kind, entity.id);
        const savedEntity = this.buildEntity(key, entity.data, entity.excludeFromIndexes);
        return this.save(savedEntity);
    }

    /**
     * Saves one or multiple entities based on {@link DatastoreEntity}
     * @param entity
     */
    async save<T = any>(entity: Array<DatastoreEntity<T>> | DatastoreEntity<T>): Promise<SaveResponse> {
        const save = () => this.datastoreInstance.save(entity);
        try {
            return save();
        } catch (e) {
            await sleep(5000);
            this.renewConnection();
            return save();
        }
    }

    /**
     * Tries to get an entity or multiple entities from google datastore
     * @param key
     */
    async get(key: DatastoreEntities): Promise<GetResponse> {
        const getItem = () => this.datastoreInstance.get(key);
        try {
            return getItem();
        } catch (e) {
            await sleep(5000);
            this.renewConnection();
            return getItem();
        }
    }

    /**
     * Get all the rows in a table
     * @param kind
     */
    getAll(kind: Kind) {
        return this.query(kind, (q) => q);
    }

    /**
     * Delete all in a table
     */
    delete(entities: Entities) {
        return this.datastoreInstance.delete(entities);
    }

    /**
     * Gets a single entity from datastore.
     * @param key
     */
    async getSingle<T = any>(key: entity.Key): Promise<T | undefined> {
        const data = await this.get(key);
        return data?.length > 0 ? data[0] : undefined;
    }

    /**
     * Query datastore based on a kind, a processor and options. Returns {@link RunQueryResponse} from datastore.
     * @param kind Kind of datastore to be queried
     * @param processor a query builder that modifies the main query. Useful to add filters, orders, etc.
     * @param options Options to be held by the query at execution
     */
    async query(kind: Kind, processor: (query: Query) => Query, options?: RunQueryOptions): Promise<RunQueryResponse> {
        // @ts-ignore
        let query = this.datastoreInstance.createQuery(kind);
        if(processor) {
            query = processor(query);
        }

        const runQuery = () => this.datastoreInstance.runQuery(query, options);

        try {
            return runQuery();
        } catch {
            await sleep(5000);
            this.renewConnection();
            return runQuery();
        }
    }

    /**
     * Creates a query based on {@link Queryable} which works as a helper for filters, limit, offset.
     * @param query Structure of query
     */
    async invokeQuery<T = any>(query: Queryable<Kind>): Promise<QueryResult<T>> {
        // @ts-ignore
        let gdQuery = this.datastoreInstance.createQuery(query.kind);
        const { limit, offset, filters, order, cursor, groupBy, projection } = query;

        if(limit) {
            gdQuery = gdQuery.limit(limit);
        }

        if(offset) {
            gdQuery = gdQuery.offset(offset);
        }

        if(filters && filters.length > 0) {
            filters.forEach((filter) => {
                gdQuery = gdQuery.filter(filter.property, filter.operator, filter.value);
            });
        }

        if(order) {
            gdQuery = gdQuery.order(order[0], order[1]);
        }

        if(cursor) {
            gdQuery = gdQuery.start(cursor);
        }

        if(groupBy) {
            gdQuery = gdQuery.groupBy(groupBy)
        }

        if(projection) {
            gdQuery = gdQuery.select(projection);
        }

        // @ts-ignore
        const data = await this.query(query.kind, (query) => gdQuery) || [];
        const queryInfo = data[1] || {};
        return {
            entities: data[0] || [],
            resultsStatus: queryInfo.moreResults || 'NO_RESULTS',
            cursor: queryInfo.endCursor,
            isEmpty: function() {
                return this.resultsStatus === 'NO_RESULTS'
            }
        }
    }

    async invokePaginatedQuery<T = any>(query: Queryable<Kind>): Promise<PaginatedQueryResult<T>> {
        const runQuery = await this.invokeQuery<T>(query);
        return {
            entities: runQuery.entities,
            nextPage: async () => {
                if(runQuery.cursor && !runQuery.isEmpty()) {
                    return await this.invokePaginatedQuery<T>({
                        ...query,
                        cursor: runQuery.cursor
                    });
                } else {
                    return {
                        entities: [],
                        nextPage: () => undefined,
                        cursor: undefined
                    };
                }
            },
            cursor: runQuery.cursor
        }
    }

    getDatastoreInstance() {
        return this.datastoreInstance;
    }

    private renewConnection(): void {
        const credentials = GcpCredentials.getCredentials();
        this.datastoreInstance = new Datastore({
            projectId: credentials.project_id,
            credentials
        });
    }

}
