import url from 'url';
import express from 'express';
import AppConfig from '../config/app';
import { isEmptyObject } from '../util/validator';
import { ParsedUrlQuery } from 'querystring';
import { adminGuard,  managerGuard, empGuard } from '../middleware/auth-middleware';

export const ReimbRouter = express.Router();

const reimbService = AppConfig.reimbService;

ReimbRouter.get('', async (req, resp) => {

    try {

        let reqURL = url.parse(req.url, true);

        if(!isEmptyObject<ParsedUrlQuery>(reqURL.query)) {
            let payload = await reimbService.getReimbByUniqueKey({...reqURL.query});
            resp.status(200).json(payload);
        } else {
            let payload = await reimbService.getAllReimbes();
            resp.status(200).json(payload);
        }

    } catch (e) {
        resp.status(e.statusCode).json(e);
    }

});

ReimbRouter.get('/:author_id', async (req, resp) => {
    const id = +req.params.author_id;
    try {
        let payload = await reimbService.getAllByUserID(id);
        return resp.status(200).json(payload);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

ReimbRouter.post('', async (req, resp) => {

    console.log('POST REQUEST RECEIVED AT /reimbs');
    console.log(req.body);
    try {
        let newUser = await reimbService.addNewReimb(req.body);
        return resp.status(201).json(newUser);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }

});

ReimbRouter.put('', async (req, resp) => {

    console.log('PUT REQUEST RECEIVED AT /reimbs');
    console.log(req.body);
    try {
        let updatedUser = await reimbService.updateReimb(req.body);
        return resp.status(201).json(updatedUser);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }

});


ReimbRouter.delete('/reimb_id', async (req, resp) => {
    const id = +req.params.reimb_id;
    console.log('DELETE REQUEST RECEIVED AT /reimbs');
    try {
        let payload = await reimbService.deleteByID(id);
        return resp.status(201).json(payload);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

