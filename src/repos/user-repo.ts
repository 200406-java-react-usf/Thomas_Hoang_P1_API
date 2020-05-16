import { User } from '../models/user';
import { CrudRepository } from './crud-repo';
import {
    ResourceNotFoundError, 
    ResourcePersistenceError,
    InternalServerError
} from '../errors/errors';
import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapUserResultSet } from '../util/result-set-mapper';

export class UserRepository implements CrudRepository<User> {
/*Quere to grab all of the users within the users table in RDS using the base query and displaying the rold id as the actual role name*/
    baseQuery = `
        select
            au.ers_user_id, 
            au.username, 
            au.password, 
            au.first_name,
            au.last_name,
            au.email,
            ur.role_name as role_name
        from ers_users au
        join ers_user_roles ur
        on au.user_role_id = ur.role_id
    `;

    /*Grabs all of the users from the RDS using the base query*/
    async getAll(): Promise<User[]> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery}`;
            let rs = await client.query(sql); 
            return rs.rows.map(mapUserResultSet);
        } catch (e) {
            console.log(e);
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }
    /*Grabs a user with a specific id #*/
    async getById(id: number): Promise<User> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where au.ers_user_id = $1`;
            let rs = await client.query(sql, [id]);
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    

    }

    /*Returns a user by defining what the user is being searched by and the actual value of that search */
    async getUserByUniqueKey(key: string, val: string): Promise<User> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where au.${key} = $1`;
            let rs = await client.query(sql, [val]);
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
        
    
    }

    /*Gets a user by search for a user with the same specified username and password*/
    async getUserByCredentials(un: string, pw: string) {
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where au.username = $1 and au.password = $2`;
            let rs = await client.query(sql, [un, pw]);
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    /*Persists a new user into the database by inserting into the function a new User object*/
    async save(newUser: User): Promise<User> {
            
        let client: PoolClient;

        try {
            client = await connectionPool.connect();

            //DB call to find the role id of the role the user has
            let roleId = (await client.query('select ers_user_id from user_roles where name = $1', [newUser.role_name])).rows[0].ers_user_id;
            
            let sql = `
                insert into ers_users (username, password, first_name, last_name, email, role_id) 
                values ($1, $2, $3, $4, $5, $6) returning ers_user_id
            `;

            let rs = await client.query(sql, [newUser.username, newUser.password, newUser.first_name, newUser.last_name, newUser.email, roleId]);
            
            newUser.ers_user_id = rs.rows[0].ers_user_id;
            
            return newUser;

        } catch (e) {
            console.log(e);
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    /*Updates a user based off of the user id and changing to the new values.*/
    async update(updatedUser: User): Promise<boolean> {
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `update ers_users set (username, password, email) = ($2, $3, $4) where ers_user_id = $1;`;
            await client.query(sql, [updatedUser.ers_user_id, updatedUser.username, updatedUser.password, updatedUser.email]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    /*Deletes a user with the provided ID.*/
    async deleteById(id: number): Promise<boolean> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql =  `delete from ers_users where ers_user_id = $1;`;
            await client.query(sql, [id]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }

}
