import { ReimbService } from '../services/reimb-service';
import { ReimbRepository } from '../repos/reimb-repo';
import { Reimb } from '../models/reimb';
import Validator from '../util/validator';
import { ResourceNotFoundError, BadRequestError , ResourcePersistenceError, AuthenticationError} from '../errors/errors';

jest.mock('../repos/reimb-repo', () => {
    
    return new class ReimbRepository {
            getAllReimbes = jest.fn();
            getReimbById = jest.fn();
            getWaxByUniqueKey = jest.fn();
            save = jest.fn();
            update = jest.fn();
            deleteById = jest.fn();
    }

});
describe('reimbService', () => {

    let sut: ReimbService;
    let mockRepo;

    let mockReimbes = [
        //Tried each possible comibination of reimbes with nullable props
        new Reimb(1, 1, 'productName1', 'brand', 'category', 0.50, false, 5, 5, 1, "description"),
        new Reimb(2, 2, 'productName2', 'brand', 'category', 0.50, false, 5, undefined)
    ];

    beforeEach(() => {

        mockRepo = jest.fn(() => {
            return {
                getAllWaxes: jest.fn(),
                getById: jest.fn(),
                getWaxByUniqueKey: jest.fn(),
                getWaxByCredentials: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                deleteById: jest.fn()
            }
        });

        // @ts-ignore
        sut = new ReimbService(mockRepo);
    
    });


    test('should resolve to Reimb[] when getAllWaxes() successfully retrieves reimbes from the data source', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getAll = jest.fn().mockReturnValue(mockReimbes);

        // Act
        let result = await sut.getAllWaxes();

        // Assert
        expect(result).toBeTruthy();
        expect(result.length).toBe(2);

    });

    test('should reject with ResourceNotFoundError when getAllReimbes fails to get any Reimbes from the data source', async () => {

        // Arrange
        expect.assertions(1);
        mockRepo.getAll = jest.fn().mockReturnValue([]);

        // Act
        try {
            await sut.getAllWaxes();
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should resolve to Reimb when getReimbById is given a valid known id', async () => {

        // Arrange
        expect.assertions(2);
        
        Validator.isValidId = jest.fn().mockReturnValue(true);

        mockRepo.getById = jest.fn().mockImplementation((id: number) => {
            return new Promise<Reimb>((resolve) => resolve(mockReimbes[id - 1]));
        });


        // Act
        let result = await sut.getWaxByID(1);

        // Assert
        expect(result).toBeTruthy();
        expect(result.wax_id).toBe(1);

    });

    test('should reject with BadRequestError when getReimbById is given a invalid value as an id (decimal)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getWaxByID(3.14);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getReimbById is given a invalid value as an id (zero)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getWaxByID(0);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getReimbById is given a invalid value as an id (NaN)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getWaxByID(NaN);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with BadRequestError when getReimbById is given a invalid value as an id (negative)', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(false);

        // Act
        try {
            await sut.getWaxByID(-2);
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with ResourceNotFoundError if getReimbByid is given an unknown id', async () => {
        expect.hasAssertions();
        mockRepo.getById = jest.fn().mockReturnValue(true);

        try {
            await sut.getWaxByID(9999);
        } catch (e) {

            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });

    test('should reject with ResourceNotFoundError if getByid is given an unknown product', async () => {
        expect.hasAssertions();

        let mockReimb1 = new Reimb(1, 1, 'productName', 'brand', 'category', 0.50, false, 5, 5, 1, "description");
        let productName = 'notARealReimb'
        mockRepo.getWaxByUniqueKey = jest.fn().mockReturnValue(true);

        try {
            await sut.getWaxByUniqueKey({'product_name': productName});
        } catch (e) {

            expect(e instanceof ResourceNotFoundError).toBe(true);
        }
    });

    test('should reject with BadRequestError if getByid is given an unknown field', async () => {

        expect.hasAssertions();
        let mockReimb = new Reimb(1, 1, 'productName', 'brand', 'category', 0.50, false, 5, 5, 1, "description");
        mockRepo.getReimbByUniqueKey = jest.fn().mockReturnValue(true);

        // Act
        try {
            await sut.getWaxByUniqueKey({'notACorrectField': 'productName'});
        } catch (e) {

            // Assert
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to a reimb when save() successfully persists a reimb', async () => {
        expect.assertions(2);
        let mockReimb = new Reimb(2, 7, 'productName', 'brand', 'category', 0.50, true, 5, 5, 1, "description");

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        sut.isWaxAddedYet = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockImplementation((newUser: Reimb) => {
            return new Promise<Reimb>((resolve) => {
                mockReimbes.push(newUser);
                resolve(newUser);
            });
        });

        let result = await sut.addNewWax(mockReimb);

        expect(result).toBeTruthy();
        expect(result.user_id).toBe(2);
    });

    test('should reject with BadRequestError() when save() when user has invalid field', async () => {
        expect.assertions(1);

        let mockReimb = new Reimb(1, 1, 'productName', 'brand', 'category', 0.50, false, 5, 5, 1, "description");

        Validator.isValidStrings = jest.fn().mockReturnValue(false);
        sut.isWaxAddedYet = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockImplementation((newReimb: Reimb) => {
            return new Promise<Reimb>((resolve) => {
                mockReimbes.push(newReimb);
                resolve(newReimb);
            });
        });


        try {

            await sut.addNewWax(mockReimb);
        } catch (e) {

            expect(e instanceof BadRequestError).toBe(true);
        }
    });


    test('should resolve to a Reimb when updating a wax successfully', async () => {
        expect.assertions(1);

        let mockReimb = new Reimb(1, 1, 'productName1', 'brand', 'category', 0.50, true, 5, 5, 1, "description");

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockImplementation((reimb : Reimb) => {
            return new Promise<Reimb>((resolve) => {
            mockReimbes.push(reimb)
            resolve(reimb)
            });
        });

        let result = await sut.updateWax(mockReimb);

        expect(result).toBeTruthy();
    });


    test('should reject with BadRequestError when updating an invalid id', async () => {
        expect.hasAssertions();

        let mockReimb = new Reimb(1, 1, 'productName', 'brand', 'category', 0.50, false, 5, 5, 1, "description");

        Validator.isValidObject = jest.fn().mockReturnValue(false);
        mockRepo.update = jest.fn().mockImplementation((reimb : Reimb) => {
            return new Promise<Reimb>((resolve) => {
            mockReimbes.push(reimb)
            resolve(reimb)
            });
        });

        try {

            await sut.updateWax(mockReimb);
        } catch (e) {

            expect(e instanceof BadRequestError).toBe(true);
        }
    });


    test('should reject with BadRequestError when updating an invalid id', async () => {
        expect.hasAssertions();

        let mockReimb = new Reimb(1, 1, 'productName', 'brand', 'category', 0.50, false, 5, 5, 1, "description");

        Validator.isValidObject = jest.fn().mockReturnValue(false);
        mockRepo.update = jest.fn().mockImplementation((reimb : Reimb) => {
            return new Promise<Reimb>((resolve) => {
            mockReimbes.push(reimb)
            resolve(reimb)
            });
        });

        try {

            await sut.updateWax(mockReimb);
        } catch (e) {

            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to true when given reimb id is deleted', async () => {
        expect.assertions(1);

        Validator.isValidId = jest.fn().mockReturnValue(true);
        mockRepo.deleteById = jest.fn().mockImplementation((reimb : Reimb) => {
            return new Promise<Reimb>((resolve) => {
            mockReimbes.push(reimb)
            resolve(reimb)
            });
        });

        let result = await sut.deleteByID(1);

        expect(result).toBeTruthy();
    });

    test('should reject BadRequestError when given user is invalid', async () => {
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(false);
        mockRepo.deleteById = jest.fn().mockReturnValue(true);

        try {
            await sut.deleteByID(-1);
        } catch (e) {
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to a true when reimb is not added yet', async () => {
        expect.assertions(1);

        let mockReimb = new Reimb(1, 1, 'productName', 'brand', 'category', 0.50, false, 5, 5, 1, "description");

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.isReimbAddedYet = jest.fn().mockImplementation((reimb : Reimb) => {
            return new Promise<Reimb>((resolve) => {
            mockReimbes.push(reimb)
            resolve(reimb)
            });
        });

        let result = await sut.isWaxAddedYet(mockReimb.user_id, mockReimb.wax_id);

        expect(result).toBeTruthy();
    });

});

