import { ReimbRepository } from '../repos/reimb-repo';
import * as mockIndex from '..';
import * as mockMapper from '../util/result-set-mapper';
import { Reimb } from '../models/reimb';

jest.mock('..', () => {
    return {
        connectionPool: {
            connect: jest.fn()
        }
    }
});

jest.mock('../util/result-set-mapper', () => {
    return {
        mapReimbResultSet: jest.fn()
    }
});

describe('reimbRepo', () => {

    let sut = new ReimbRepository();
    let mockConnect = mockIndex.connectionPool.connect;

    beforeEach(() => {

        (mockConnect as jest.Mock).mockClear().mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return {
                        rows: [
                            {
                                reimb_id: 1,
                                amount: 152.25,
                                submitted: '2020-04-15 18:50:10',
                                resolved: '2020-05-12 20:00:55',
                                description: 'A reimbursement for lodging',
                                receipt: '',
                                author_first: 'Alice',
                                author_last: 'Anderson',
                                resolver_first: 'Bill',
                                resolver_last: 'Bob',
                                status: 'Pending',
                                type: 'Lodging'
                            }
                        ]
                    }
                }), 
                release: jest.fn()
            }
        });
        (mockMapper.mapReimbResultSet as jest.Mock).mockClear();
    });

    let mockReimb = new Reimb(1, 152.25, '2020-04-15 18:50:10', '2020-05-12 20:00:55', 'A reimbursement for lodging', 'RandomURLLink', 'Alice', 'Anderson', 'Bill', 'Bob', 'Denied', 'Lodging');
    
    test('should resolve to an array of reimbursements when getAll retrieves records from data source', async () => {
        
        expect.hasAssertions();

        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

        let result = await sut.getAll();

        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should resolve to an empty array when getAll retrieves no records from data source', async () => {
        
        expect.hasAssertions();
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return { rows: [] } }), 
                release: jest.fn()
            }
        });

        let result = await sut.getAll();

        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should resolve to an array of reimbursements when getAllByUserID retrieves records from data source', async () => {
        
        expect.hasAssertions();

        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

        let result = await sut.getAllByUserID(1);

        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should resolve to a reimb object if save returns a valid reimb', async () => {
        expect.hasAssertions();

        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

        let result = await sut.save(mockReimb);

        expect(result).toBeTruthy();
        expect(result instanceof Reimb).toBe(true);
    });

    test('should resolve to true if updates a valid id', async () => {
        expect.hasAssertions();

        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);


        let result = await sut.update(mockReimb);

        expect(result).toBeTruthy();
    });

    test('Should resolve to true when deleteById deletes a valid reimb object', async () => {
        expect.hasAssertions();
        
        (mockMapper.mapReimbResultSet as jest.Mock).mockReturnValue(mockReimb);

        let result = await sut.deleteById(1);

        expect(result).toBeTruthy();
    });
});

