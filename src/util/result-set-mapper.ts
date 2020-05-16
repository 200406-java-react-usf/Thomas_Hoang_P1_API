import { UserSchema, ReimbSchema} from "./schemas";
import { User } from "../models/user";
import { Reimb } from "../models/reimb";

export function mapUserResultSet(resultSet: UserSchema): User {
    
    if (!resultSet) {
        return {} as User;
    }

    return new User(
        resultSet.ers_user_id,
        resultSet.username,
        resultSet.password,
        resultSet.first_name,
        resultSet.last_name,
        resultSet.email,
        resultSet.role_name
    );
}

export function mapReimbResultSet(resultSet: ReimbSchema): Reimb {
    
    if (!resultSet) {
        return {} as Reimb;
    }

    return new Reimb(
        resultSet.reimb_id,
        resultSet.amount,
        resultSet.submitted,
        resultSet.resolved,
        resultSet.description,
        resultSet.receipt,
        resultSet.author_first,
        resultSet.author_last,
        resultSet.resolver_first,
        resultSet.resolver_last,
        resultSet.reimb_status,
        resultSet.reimb_type
    );
}