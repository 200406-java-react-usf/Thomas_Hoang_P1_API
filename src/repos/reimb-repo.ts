import { Reimb } from '../models/reimb';
import { CrudRepository } from './crud-repo';
import { 
    BadRequestError, 
    ResourceNotFoundError,
    ResourcePersistenceError,
    InternalServerError
} from '../errors/errors';
import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapReimbResultSet } from '../util/result-set-mapper';

export class ReimbRepository implements CrudRepository<Reimb> {
    
    baseQuery = `
        select
            er.reimb_id,
            er.amount,
            er.submitted,
            er.resolved,
            er.description,
            er.receipt,
            u.first_name as author_first,
            u.last_name as author_last,
            u2.first_name as resolver_first,
            u2.last_name as resolver_last,
            s.reimb_status as reimb_status,
            t.reimb_type as reimb_type
        from ers_reimbursements er 
        inner join ers_users u
        on er.author_id = u.ers_user_id 
        inner join ers_users u2
        on er.resolver_id = u2.ers_user_id 
        inner join ers_reimbursement_statuses s
        on er.reimb_status_id = s.reimb_status_id 
        inner join ers_reimbursement_types t
        on er.reimb_type_id = t.reimb_type_id
    `;

    /*Gets all reimbursements using the base query*/
    async getAll(): Promise<Reimb[]> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = `${this.baseQuery}`;
            let rs = await client.query(sql);
            return rs.rows.map(mapReimbResultSet);
        }catch (e) {
            throw new InternalServerError();
        }finally {
            client && client.release();
        }
    }

        /*Gets all reimbursements of a specific user id using the base query and the specified user ID.*/
        async getAllByUserID(reimb: Reimb): Promise<Reimb[]> {
           
            let client: PoolClient;
     
            let authorID = (await client.query('select ers_user_id from ers_users where (first_name, last_name) = ($1,$2)', [reimb.author_first, reimb.author_last])).rows[0].ers_user_id;

            try{
                client = await connectionPool.connect();
                let sql = `${this.baseQuery} where author_id = $1`;
                let rs = await client.query(sql, [authorID]);
                return rs.rows.map(mapReimbResultSet);
            }catch (e) {
                throw new InternalServerError();
            }finally {
                client && client.release();
            }
        }

    /*Gets a reimbursement by the reimbursement's id*/
    async getById(id: number): Promise<Reimb> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where reimb_id = $1`;
            let rs = await client.query(sql, [id]);
            return mapReimbResultSet(rs.rows[0])
        }catch (e) {
            throw new InternalServerError();
        }finally {
            client && client.release();
        }
    }

    /*Searches for reimbursements by a given key and value for the key*/
    async getReimbByUniqueKey(key: string, val: string): Promise<Reimb> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where ${key} = $1`;
            let rs = await client.query(sql, [val]);
            return mapReimbResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /*Function takes in information for a new reimbursement to add a new pending reimbursement*/
    async save(newReimb: Reimb): Promise<Reimb> {
            
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            /*Defaulting the status to 1(pending) because each new reimbursement should not be resolved yet.*/
            let statusID = 1;
            /*SQL Query to change data to proper data field*/
            let authorID = (await client.query('select ers_user_id from ers_users where (first_name, last_name) = ($1,$2)', [newReimb.author_first, newReimb.author_last])).rows[0].ers_user_id;
            let typeID = (await client.query('select reimb_type_id from ers_reimbursement_types where reimb_type = $1', [newReimb.reimb_type])).rows[0].reimb_type_id;

            let sql = `
                insert into ers_reimbursements (amount, submitted, description, receipt, author_id, reimb_status_id, reimb_type_id) 
                values ($1, now(), $2, $3, $4, $5, $6) returning reimb_id
            `;

            let rs = await client.query(sql, [newReimb.amount, newReimb.description, newReimb.receipt, authorID, statusID, typeID]);
            newReimb.reimb_id = rs.rows[0].reimb_id;
            return newReimb;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /*Updates the status of a reimbursment and sets the resolved time to the current time if status is approved or denied
    otherwise updates the amount, description, receipt, and type if the status is pending.*/
    async update(updatedReimb: Reimb): Promise<boolean> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            /*SQL Query to change data to proper data field*/
            let statusID = (await client.query('select reimb_status_id from ers_reimbursement_statuses where reimb_status = $1', [updatedReimb.reimb_status])).rows[0].reimb_status_id;
            let typeID = (await client.query('select reimb_type_id from ers_reimbursement_types where reimb_type = $1', [updatedReimb.reimb_type])).rows[0].reimb_type_id;
            let resolverID = (await client.query('select ers_user_id from ers_users where (first_name, last_name) = ($1,$2)', [updatedReimb.resolver_first, updatedReimb.resolver_last])).rows[0].ers_user_id;

            if (statusID == 2 || statusID == 3){
                let sql = `
                    update ers_reimbursements set (reimb_status_id, resolved, resolver_id) = ($2, now(), $3) where reimb_id = $1
                `;

                await client.query(sql, [updatedReimb.reimb_id, statusID, resolverID]);
                return true;
            }else if (statusID == 1){
                let sql = `
                    update ers_reimbursements set (amount, description, receipt, reimb_type_id, resolver_id) = ($2, $3, $4, $5, $6) where reimb_id = $1
                `
                
                await client.query(sql, [updatedReimb.reimb_id, updatedReimb.amount, updatedReimb.description, updatedReimb.receipt, typeID, resolverID]);
                return true;
            }
        }catch (e) {
            throw new InternalServerError();
        }finally {
            client && client.release();
        }
    }

    /*Deletes a reimbursement by a given id*/
    async deleteById(id: number): Promise<boolean> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `delete from ers_reimbursements where reimb_id = $1;`;
            await client.query(sql, [id]);  
            return true;
        }catch (e) {
            throw new InternalServerError();
        }finally {
            client && client.release();
        }
    }
}