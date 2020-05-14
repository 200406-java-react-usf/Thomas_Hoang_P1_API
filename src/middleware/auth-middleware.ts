import { Request, Response } from "express";
import { AuthenticationError, AuthorizationError } from "../errors/errors";

/*Checks if the logged in user is an admin*/
export const adminGuard = (req: Request, resp: Response, next) => {

    if (!req.session.principal) {
        resp.status(401).json(new AuthenticationError('No session found! Please login.'));
    } else if (req.session.principal.role === 'Admin') {
        next();
    } else {
        resp.status(403).json(new AuthorizationError());
    }

}
/*Checks if the logged in user is a finance manager*/
export const managerGuard = (req: Request, resp: Response, next) => {

    if (!req.session.principal) {
        resp.status(401).json(new AuthenticationError('No session found! Please login.'));
    } else if (req.session.principal.role === 'FManager') {
        next();
    } else {
        resp.status(403).json(new AuthorizationError());
    }

}