import { UserRepository } from "../repos/user-repo";
import { UserService } from "../services/user-service";
import { ReimbRepository } from "../repos/reimb-repo";
import { ReimbService } from "../services/reimb-service";

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

const reimbRepo = new ReimbRepository();
const reimbService = new ReimbService(reimbRepo);

export default {
    userService,
    reimbService
}