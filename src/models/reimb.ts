export class Reimb{

    reimb_id: number;
    amount: number;
    submitted: string;
    resolved: string;
    description: string;
    receipt: string;
    author_first: string;
    author_last: string;
    resolver_first: string;
    resolver_last: string;
    reimb_status: string;
    reimb_type: string;

    constructor(reimb_id: number, amount: number, submitted: string, resolved: string, description: string, receipt: string, author_first: string, author_last: string,  resolver_first: string, resolver_last: string, reimb_status: string, reimb_type: string){
        this.reimb_id = reimb_id;
        this.amount = amount;
        this.submitted = submitted;
        this.resolved = resolved;
        this.description = description;
        this.receipt = receipt;
        this.author_first = author_first;
        this.author_last = author_last;
        this.resolver_first = resolver_first;
        this.resolver_last = resolver_last;
        this.reimb_status = reimb_status;
        this.reimb_type = reimb_type;
    }

}