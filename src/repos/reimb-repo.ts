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
            s.reimb_status as status,
            t.reimb_type as type
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

    async getReimbByUniqueKey(key: string, val: string): Promise<Reimb[]> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where ${key} = $1`;
            let rs = await client.query(sql, [val]);
            return rs.rows.map(mapReimbResultSet);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    async save(newReimb: Reimb): Promise<Reimb> {
            
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
                let sql = `
                `;

                let rs = await client.query(sql, []);
                newReimb = rs.rows[0].id;
                return newReimb;
        } catch (e) {
            console.log(e);
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    async update(updatedReimb: Reimb): Promise<boolean> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
                let sql = `
                `;

                let rs = await client.query(sql, []);
                updatedReimb = rs.rows[0].id;
                return true;
        }catch (e) {
            throw new InternalServerError();
        }finally {
            client && client.release();
        }
    }

    async deleteById(id: number): Promise<boolean> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = ``;
            let rs = await client.query(sql, [id]);  
            return true;
        }catch (e) {
            throw new InternalServerError();
        }finally {
            client && client.release();
        }
    }
}