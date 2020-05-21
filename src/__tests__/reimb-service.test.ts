import { ReimbService } from '../services/reimb-service';
import { ReimbRepository } from '../repos/reimb-repo';
import { Reimb } from '../models/reimb';
import Validator from '../util/validator';
import { ResourceNotFoundError, BadRequestError , ResourcePersistenceError, AuthenticationError} from '../errors/errors';

jest.mock('../repos/reimb-repo', () => {
    
    return new class ReimbRepository {
        getAllReimbes = jest.fn();
        getAllByUserID = jest.fn();
        addNewReimb = jest.fn();
        updateReimb = jest.fn();
        deleteByID = jest.fn();
    }

});
describe('reimbService', () => {

    let sut: ReimbService;
    let mockRepo;

    let mockReimbes = [
        new Reimb(1, 152.25, '2020-04-15 18:50:10', '2020-05-12 20:00:55', 'A reimbursement for lodging', 'RandomURLLink', 'Alice', 'Anderson', 'Bill', 'Bob', 'Denied', 'Lodging'),
        new Reimb(2, 152.25, '2020-04-15 18:50:10', '2020-05-12 20:00:55', 'Other Reimbursement', 'S3Link', 'Alice', 'Anderson', 'Bill', 'Bob', 'Approved', 'Other')
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


    test('should resolve to Reimb[] when getAllReimbes() successfully retrieves reimbes from the data source', async () => {

        // Arrange
        expect.hasAssertions();
        mockRepo.getAll = jest.fn().mockReturnValue(mockReimbes);

        // Act
        let result = await sut.getAllReimbes();

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
            await sut.getAllReimbes();
        } catch (e) {

            // Assert
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

    test('should resolve to a reimb when save() successfully persists a reimb', async () => {
        expect.assertions(2);
        let mockReimb = new Reimb(2, 152.25, '2020-04-15 18:50:10', '2020-05-12 20:00:55', 'A reimbursement for lodging', 'RandomURLLink', 'Alice', 'Anderson', 'Bill', 'Bob', 'Denied', 'Lodging');

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.save = jest.fn().mockImplementation((newUser: Reimb) => {
            return new Promise<Reimb>((resolve) => {
                mockReimbes.push(newUser);
                resolve(newUser);
            });
        });

        let result = await sut.addNewReimb(mockReimb);

        expect(result).toBeTruthy();
        expect(result.reimb_id).toBe(2);
    });

    test('should reject with BadRequestError() when save() when reimb has invalid field', async () => {
        expect.assertions(1);

        let mockReimb = new Reimb(1, 152.25, '2020-04-15 18:50:10', '2020-05-12 20:00:55', 'A reimbursement for lodging', 'RandomURLLink', '', 'Anderson', 'Bill', 'Bob', 'Denied', 'Lodging');

        Validator.isValidStrings = jest.fn().mockReturnValue(false);
        Validator.isValidObject = jest.fn().mockReturnValue(false);
        mockRepo.save = jest.fn().mockImplementation((newReimb: Reimb) => {
            return new Promise<Reimb>((resolve) => {
                mockReimbes.push(newReimb);
                resolve(newReimb);
            });
        });

        try {

            await sut.addNewReimb(mockReimb);
        } catch (e) {

            expect(e instanceof BadRequestError).toBe(true);
        }
    });


    test('should resolve to a Reimb when updating a reimb successfully', async () => {
        expect.assertions(1);

        let mockReimb = new Reimb(1, 152.25, '2020-04-15 18:50:10', '2020-05-12 20:00:55', 'A reimbursement for lodging', 'RandomURLLink', 'Alice', 'Anderson', 'Bill', 'Bob', 'Denied', 'Lodging');

        Validator.isValidObject = jest.fn().mockReturnValue(true);
        mockRepo.update = jest.fn().mockImplementation((reimb : Reimb) => {
            return new Promise<Reimb>((resolve) => {
            mockReimbes.push(reimb)
            resolve(reimb)
            });
        });

        let result = await sut.updateReimb(mockReimb);

        expect(result).toBeTruthy();
    });

    test('should reject with BadRequestError when updating an invalid id', async () => {
        expect.hasAssertions();

        let mockReimb = new Reimb(1, 152.25, '2020-04-15 18:50:10', '2020-05-12 20:00:55', 'A reimbursement for lodging', 'RandomURLLink', '', 'Anderson', 'Bill', 'Bob', 'Denied', 'Lodging');

        Validator.isValidId = jest.fn().mockReturnValue(false);
        Validator.isValidObject = jest.fn().mockReturnValue(false);
        mockRepo.update = jest.fn().mockImplementation((reimb : Reimb) => {
            return new Promise<Reimb>((resolve) => {
            mockReimbes.push(reimb)
            resolve(reimb)
            });
        });

        try {

            await sut.updateReimb(mockReimb);
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

    test('should reject BadRequestError when given reimb is invalid', async () => {
        expect.hasAssertions();

        Validator.isValidId = jest.fn().mockReturnValue(false);
        mockRepo.deleteById = jest.fn().mockReturnValue(true);

        try {
            await sut.deleteByID(-1);
        } catch (e) {
            expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should resolve to Reimb[] when getAllByUserID() successfully retrieves reimbes from the data source', async () => {
        expect.hasAssertions();

        mockRepo.getAllByUserID = jest.fn().mockReturnValue(mockReimbes);

        let result = await sut.getAllByUserID(1);

        expect(result).toBeTruthy();
        expect(result.length).toBe(5);

    });

    test('should reject with ResourceNotFoundError when getAllByUserID fails to get any Reimbes from the data source', async () => {
        expect.assertions(1);

        mockRepo.getAllByUserID = jest.fn().mockReturnValue([]);

        try {
            await sut.getAllByUserID(2);
        } catch (e) {
            expect(e instanceof ResourceNotFoundError).toBe(true);
        }

    });

});

