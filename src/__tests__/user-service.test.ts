import { UserService } from '../services/user-service';
import { UserRepository } from '../repos/user-repo';
import { User } from '../models/user';
import Validator from '../util/validator';
import {     
    BadRequestError, 
    ResourceNotFoundError,  
    ResourcePersistenceError, 
    AuthenticationError 
} from '../errors/errors';

jest.mock('../repos/user-repo', () => {
    
    return new class UserRepository {
            getAll = jest.fn();
            getById = jest.fn();
            getUserByUniqueKey = jest.fn();
            getUserByCredentials = jest.fn();
            save = jest.fn();
            update = jest.fn();
            deleteById = jest.fn();
    }

});
describe('userService', () => {

    let sut: UserService;
    let mockRepo;

    let mockUsers = [
        new User(1, 'aanderson', 'password', 'Alice', 'Anderson', 'aanderson@revature.com', 'Admin'),
        new User(2, 'bbailey', 'password', 'Bob', 'Bailey', 'bbailey@revature.com', 'User'),
        new User(3, 'ccountryman', 'password', 'Charlie', 'Countryman', 'ccountryman@revature.com', 'User'),
        new User(4, 'ddavis', 'password', 'Daniel', 'Davis', 'ddavis@revature.com', 'User'),
        new User(5, 'eeinstein', 'password', 'Emily', 'Einstein', 'eeinstein@revature.com', 'User')
    ];

    beforeEach(() => {

        mockRepo = jest.fn(() => {
            return {
                getAll: jest.fn(),
                getById: jest.fn(),
                getUserByUniqueKey: jest.fn(),
                getUserByCredentials: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                deleteById: jest.fn()
            }
        });

        // @ts-ignore
        sut = new UserService(mockRepo);
    
    });

    test('should resolve to User[] (without passwords) when getAllUsers() successfully retrieves users from the data source', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getAll = jest.fn().mockReturnValue(mockUsers);

        // Act
        let result = await sut.getAllUsers();

        // Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(5);
        result.forEach(val => expect(val.password).toBeUndefined());

    });

    test('should reject with ResourceNotFoundError when getAllUsers fails to get any users from the data source', async () => {

        // Arrange
        expect.assertions(1);
        mockRepo.getAll = jest.fn().mockReturnValue([]);

        // Act
        try {
            await sut.getAllUsers();
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should resolve to User when getUserById is given a valid known id', async () => {

        // Arrange
        expect.assertions(3);
        
        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getById = jest.fn().mockImplementation((id: number) => {
            return new Promise<User>((resolve) => resolve(mockUsers[id - 1]));
        });


        // Act
        let result = await sut.getUserById(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
        expect(result.password).toBeUndefined();

    });

    test('should reject with BadRequestError when getUserById is given a invalid value as an id (decimal)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getUserById(3.14);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getUserById is given a invalid value as an id (zero)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getUserById(0);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getUserById is given a invalid value as an id (NaN)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getUserById(NaN);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getUserById is given a invalid value as an id (negative)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getUserById(-2);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with ResourceNotFoundError if getByid is given an unknown id', async () => {
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(true);

        try {
            await sut.getUserById(9999);
        } catch (e) {

            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });

    test('should resolve to a User (without passwords) when getUserByUniqueKey() successfully retrieves a user with username', async () => {
        expect.assertions(3);
        
        Validator.isValidId = jest.fn().mockReturnValue(true);

        let mockUser = new User(1, 'user', 'password', 'first', 'last', 'test@test.com', 'locked');
        let username = mockUser.username;

        mockRepo.getUserByUniqueKey = jest.fn().mockReturnValue(mockUser);

        // Act
        let result = await sut.getUserByUniqueKey({'username': username});

        // Assert
        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
        expect(result.password).toBeUndefined();
    });

    test('should reject with ResourceNotFoundError if getByid is given an unknown username', async () => {
        expect.hasAssertions();

        let mockUser = new User(1, 'user', 'password', 'first', 'last', 'test@test.com', 'locked');
        let username = 'notARealUser'
        mockRepo.getUserByUniqueKey = jest.fn().mockReturnValue(true);

        try {
            await sut.getUserByUniqueKey({'username': username});
        } catch (e) {

            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });

    test('should reject with BadRequestError if getByid is given an unknown field', async () => {

        // Arrange
        expect.hasAssertions();
        let mockUser = new User(1, 'user', 'password', 'first', 'last', 'test@test.com', 'locked');
        let username = 'notARealUser'
        mockRepo.getUserByUniqueKey = jest.fn().mockReturnValue(true);

        // Act
        try {
            await sut.getUserByUniqueKey({'notACorrectField': username});
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to a User (without passwords) when save() successfully persists a user', async () => {
        expect.assertions(3);

        let mockUser = new User(1, 'user', 'password', 'first', 'last', 'test@test.com', 'locked');

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User>((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        let result = await sut.addNewUser(mockUser);

        expect(result).toBeTruthy();
        expect(result.id).toBe(1);
        expect(result.password).toBeUndefined();
    });

    test('should reject with ResourcePersistenceError if save is given an invalid username', async () => {
        expect.hasAssertions();

        let mockUser = new User(1, 'aanderson', 'password', 'first', 'last', 'test@test.com','locked');
        mockRepo.getUserByUniqueKey = jest.fn().mockReturnValue(true);
        Validator.isValidObject = jest.fn().mockReturnValue(true);
        sut.isUsernameAvailable = jest.fn().mockReturnValue(false);
        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User>((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try {

            await sut.addNewUser(mockUser);
        } catch (e) {

            expect(e instanceof ResourcePersistenceError).toBe(true);
        }
    });

    test('should reject with BadRequestError() when save() when user has invalid password', async () => {
        expect.assertions(1);

        let mockUser = new User(1, 'user', '', 'first', 'last', 'test@test.com','locked');

        Validator.isValidStrings = jest.fn().mockReturnValue(false);
        sut.isUsernameAvailable = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User>((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });


        try {

            await sut.addNewUser(mockUser);
        } catch (e) {

            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to a User (without passwords) when authenticateUser() successfully authenticates a user', async () => {
        expect.assertions(2);

        let mockUser = new User(1, 'aanderson', 'password', 'Alice', 'Anderson', 'test@test.com','Admin');

        Validator.isValidStrings = jest.fn().mockReturnValue(true);
        mockRepo.getUserByCredentials = jest.fn().mockImplementation((user : User) => {
            return new Promise<User>((resolve) => {
            mockUsers.push(user)
            resolve(user)
            });
        });

        let result = await sut.authenticateUser(mockUser.username, mockUser.password);

        expect(result).toBeTruthy();
        expect(result.password).toBeUndefined();
    });

    test('should reject with BadRequestError when authenticateUser() is passed invalid strings', async () => {
        expect.hasAssertions();

        let mockUser = new User(1, 'aanderson', 'password', 'Alice', 'Anderson', 'test@test.com', 'Admin');

        Validator.isValidStrings = jest.fn().mockReturnValue(false);
        mockRepo.getUserByCredentials = jest.fn().mockImplementation((user : User) => {
            return new Promise<User>((resolve) => {
            mockUsers.push(user)
            resolve(user)
            });
        });

        try {

            await sut.authenticateUser(mockUser.username, '');
        } catch (e) {

            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to a User when updating a user successfully', async () => {
        expect.assertions(1);

        let mockUser = new User(1, 'newAanderson', 'password', 'Alice', 'Anderson', 'test@test.com', 'Admin');

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockImplementation((user : User) => {
            return new Promise<User>((resolve) => {
            mockUsers.push(user)
            resolve(user)
            });
        });

        let result = await sut.updateUser(mockUser);

        expect(result).toBeTruthy();
    });

    test('should reject with BadRequestError when updating an invalid id', async () => {
        expect.hasAssertions();

        let mockUser = new User(0, 'newAanderson', 'password', 'Alice', 'Anderson', 'test@test.com', 'Admin');

        Validator.isValidObject = jest.fn().mockReturnValue(false);
        mockRepo.update = jest.fn().mockImplementation((user : User) => {
            return new Promise<User>((resolve) => {
            mockUsers.push(user)
            resolve(user)
            });
        });

        try {

            await sut.updateUser(mockUser);
        } catch (e) {

            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to a User when updating a user successfully', async () => {
        expect.assertions(1);

        let mockUser = new User(1, 'newAanderson', 'password', 'Alice', 'Anderson', 'test@test.com','Admin');

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockImplementation((user : User) => {
            return new Promise<User>((resolve) => {
            mockUsers.push(user)
            resolve(user)
            });
        });

        let result = await sut.updateUser(mockUser);

        expect(result).toBeTruthy();
    });

    test('should reject with BadRequestError when updating an invalid id', async () => {
        expect.hasAssertions();

        let mockUser = new User(0, 'newAanderson', 'password', 'Alice', 'Anderson', 'test@test.com', 'Admin');

        Validator.isValidObject = jest.fn().mockReturnValue(false);
        mockRepo.update = jest.fn().mockImplementation((user : User) => {
            return new Promise<User>((resolve) => {
            mockUsers.push(user)
            resolve(user)
            });
        });

        try {

            await sut.updateUser(mockUser);
        } catch (e) {

            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to true when given user is deleted', async () => {
        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        mockRepo.deleteById = jest.fn().mockImplementation((user : User) => {
            return new Promise<User>((resolve) => {
            mockUsers.push(user)
            resolve(user)
            });
        });

        let result = await sut.deleteById(1);

        expect(result).toBeTruthy();
    });

    test('should reject BadRequestError when given user is invalid', async () => {
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(false);
        mockRepo.deleteById = jest.fn().mockReturnValue(true);

        try {
            await sut.deleteById(-1);
        } catch (e) {
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

});