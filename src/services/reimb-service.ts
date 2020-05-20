import { Reimb } from "../models/reimb";
import { ReimbRepository } from "../repos/reimb-repo";
import { isValidId, isValidStrings, isValidObject, isPropertyOf, isEmptyObject } from "../util/validator";
import { 
    BadRequestError,
    ResourceNotFoundError,
    ResourcePersistenceError
} from "../errors/errors";

export class ReimbService {
    constructor(private reimbRepo: ReimbRepository) {
        this.reimbRepo = reimbRepo;
    }
    async getAllReimbes(): Promise<Reimb[]> {
        let reimbes = await this.reimbRepo.getAll();
        if (reimbes.length == 0) {
            throw new ResourceNotFoundError();
        }
        return reimbes;
    }

    async getAllByUserID(id: number): Promise<Reimb[]> {
        if (!isValidId(id)) {
            throw new BadRequestError();
        }

        let reimbes = await this.reimbRepo.getAll();
        if (reimbes.length == 0) {
            throw new ResourceNotFoundError();
        }
        return reimbes;
    }

    async getReimbByID(id: number): Promise<Reimb> {
        if (!isValidId(id)) {
            throw new BadRequestError();
        }
        let reimb = await this.reimbRepo.getById(id);
        if (isEmptyObject(reimb)) {
            throw new ResourceNotFoundError();
        }
        return reimb;
    }
    async getReimbByUniqueKey(queryObj: any): Promise<Reimb> {
        try {
            let queryKeys = Object.keys(queryObj);
            if (!queryKeys.every(key => isPropertyOf(key, Reimb))) {
                throw new BadRequestError();
            }
            let key = queryKeys[0];
            let val = queryObj[key];
            if (key === 'id') {
                return await this.getReimbByID(+val);
            }
            if (!isValidStrings(val)) {
                throw new BadRequestError();
            }
            let reimbs = await this.reimbRepo.getReimbByUniqueKey(key, val);
            if (isEmptyObject(reimbs)) {
                throw new ResourceNotFoundError();
            }
            return reimbs;
        }
        catch (e) {
            throw e;
        }
    }
    async addNewReimb(newReimb: Reimb): Promise<Reimb> {
        try {
            if (!isValidObject(newReimb, 'id')) {
                throw new BadRequestError('Invalid property values found in provided reimb.');
            }
            const persistedReimb = await this.reimbRepo.save(newReimb);
            return persistedReimb;
        }
        catch (e) {
            throw e;
        }
    }
    async updateReimb(updatedReimb: Reimb): Promise<boolean> {
        try {
            if (!isValidObject(updatedReimb)) {
                throw new BadRequestError('Invalid reimbursement provided (invalid values found).');
            }
            return await this.reimbRepo.update(updatedReimb);
        }
        catch (e) {
            throw e;
        }
    }
    async deleteByID(id: number): Promise<boolean> {
        try {
            if (!isValidId(id))
                throw new BadRequestError();
            return await this.reimbRepo.deleteById(id);
        }
        catch (e) {
            throw e;
        }
    }
}
