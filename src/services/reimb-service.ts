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

        let reimbes = await this.reimbRepo.getAllByUserID(id);
        if (reimbes.length == 0) {
            throw new ResourceNotFoundError();
        }
        return reimbes;
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
