export interface UserSchema {
    ers_user_id: number,
    username: string,
    password: string,
    first_name: string,
    last_name: string,
    email: string,
    role_name: string
}

export interface ReimbSchema{
    reimb_id: number,
    amount: number,
    submitted: string,
    resolved: string,
    description: string,
    receipt: string,
    author_first: string,
    author_last: string,
    resolver_first: string,
    resolver_last: string,
    reimb_status: string,
    reimb_type: string
}