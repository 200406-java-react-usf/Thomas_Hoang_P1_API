import { User } from "../models/user";
import { UserRepository } from "../repos/user-repo";
import { isValidId, isValidStrings, isValidObject, isPropertyOf, isEmptyObject } from "../util/validator";
import { 
    BadRequestError, 
    ResourceNotFoundError,  
    ResourcePersistenceError, 
    AuthenticationError 
} from "../errors/errors";


export class UserService {

    constructor(private userRepo: UserRepository) {
        this.userRepo = userRepo;
    }

    /*Grabs all users or returns an error if no users are found*/
    async getAllUsers(): Promise<User[]> {

        let users = await this.userRepo.getAll();

        if (users.length == 0) {
            throw new ResourceNotFoundError();
        }

        return users.map(this.removePassword);

    }

    /*Checks if the provided id is a valid id and if the id exists*/
    async getUserById(id: number): Promise<User> {

        if (!isValidId(id)) {
            throw new BadRequestError();
        }

        let user = await this.userRepo.getById(id);

        if (isEmptyObject(user)) {
            throw new ResourceNotFoundError();
        }

        return this.removePassword(user);

    }

    /*Checks if the input is valid and if the input is an actual property of users*/
    async getUserByUniqueKey(queryObj: any): Promise<User> {

        // we need to wrap this up in a try/catch in case errors are thrown for our awaits
        try {

            let queryKeys = Object.keys(queryObj);

            if(!queryKeys.every(key => isPropertyOf(key, User))) {
                throw new BadRequestError();
            }

            // we will only support single param searches (for now)
            let key = queryKeys[0];
            let val = queryObj[key];

            // if they are searching for a user by id, reuse the logic we already have
            if (key === 'id') {
                return await this.getUserById(+val);
            }

            // ensure that the provided key value is valid
            if(!isValidStrings(val)) {
                throw new BadRequestError();
            }

            let user = await this.userRepo.getUserByUniqueKey(key, val);

            if (isEmptyObject(user)) {
                throw new ResourceNotFoundError();
            }

            return this.removePassword(user);

        } catch (e) {
            throw e;
        }
    }

    /*Validates that the credentials provided are correct*/
    async authenticateUser(un: string, pw: string): Promise<User> {

        try {

            if (!isValidStrings(un, pw)) {
                throw new BadRequestError();
            }

            let authUser: User;
            
            authUser = await this.userRepo.getUserByCredentials(un, pw);
           

            if (isEmptyObject(authUser)) {
                throw new AuthenticationError('Bad credentials provided.');
            }

            return this.removePassword(authUser);

        } catch (e) {
            throw e;
        }

    }

    /*Verifies if the new user is provided valid objects or if the username or email is already taken*/
    async addNewUser(newUser: User): Promise<User> {
        
        try {

            if (!isValidObject(newUser, 'id')) {
                throw new BadRequestError('Invalid property values found in provided user.');
            }

            //Checks if the updated username is already used
            let usernameAvailable = await this.isUsernameAvailable(newUser.username);

            if (!usernameAvailable) {
                throw new ResourcePersistenceError('The provided username is already taken.');
            }
        
            //Checks if the updated email is already used
            let emailAvailable = await this.isEmailAvailable(newUser.email);
    
            if (!emailAvailable) {
                throw new  ResourcePersistenceError('The provided email is already taken.');
            }

            newUser.role_name = 'User'; // all new registers have 'User' role by default
            const persistedUser = await this.userRepo.save(newUser);

            return this.removePassword(persistedUser);

        } catch (e) {
            throw e
        }
    }

    /*Checks if the updated user is providing valid information and if the username and email are already taken.*/
    async updateUser(updatedUser: User): Promise<boolean> {
        
        try {

            if (!isValidObject(updatedUser)) {
                throw new BadRequestError('Invalid user provided (invalid values found).');
            }

            let usernameAvailable = await this.isUsernameAvailable(updatedUser.username);

            if (!usernameAvailable) {
                throw new ResourcePersistenceError('The provided username is already taken.');
            }

            let emailAvailable = await this.isEmailAvailable(updatedUser.email);
    
            if (!emailAvailable) {
                throw new  ResourcePersistenceError('The provided email is already taken.');
            }

            return await this.userRepo.update(updatedUser);
        } catch (e) {
            throw e;
        }

    }

    /*Checks if the provided id is a valid id number*/
    async deleteById(id: number): Promise<boolean> {
        
        try {
            if (!isValidId(id)){
                throw new BadRequestError();
            }

        return await this.userRepo.deleteById(id);
        }
        catch (e) {
            throw e;
        }
    }

    /*Checks if the provided username is already taken*/
    async isUsernameAvailable(username: string): Promise<boolean> {

        try {
            await this.getUserByUniqueKey({'username': username});
        } catch (e) {
            console.log('username is available')
            return true;
        }

        console.log('username is unavailable')
        return false;

    }

    /*Checks if the provided email is already taken*/
    async isEmailAvailable(email: string): Promise<boolean> {
        
        try {
            await this.getUserByUniqueKey({'email': email});
        } catch (e) {
            console.log('email is available')
            return true;
        }

        console.log('email is unavailable')
        return false;
    }

    /*Checks if the object is a valid user and if so returns a user object without the password*/
    removePassword(user: User): User {
        if(!user || !user.password) return user;
        let usr = {...user};
        delete usr.password;
        return usr;   
    }

}