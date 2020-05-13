import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';

import { Pool } from 'pg';
import { sessionMiddleware } from '../src/middleware/session-middleware';
import { corsFilter } from '../src/middleware/cors-filter';
import { UserRouter } from '../src/routers/user-router';
import { AuthRouter } from '../src/routers/auth-router';

/*Environment Configuration*/
dotenv.config();

/*Database Configuration*/
export const connectionPool: Pool = new Pool({
    host: process.env['DB_HOST'],
    port: +process.env['DB_PORT'],
    database: process.env['DB_NAME'],
    user: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    max: 5
});

/*Logging Configuration*/
fs.mkdir(`${__dirname}/logs`, () => {});
const logStream = fs.createWriteStream(path.join(__dirname, 'logs/access.log'), { flags: 'a' });

/*Web Server Configuration*/
const app = express();
app.use(morgan('combined', { stream: logStream}));
app.use(sessionMiddleware);
app.use(corsFilter);
app.use('/', express.json());
app.use('/users', UserRouter);
app.use('/auth', AuthRouter);

app.listen(8080, () => {
    console.log(`Application up and running on port 8080.`)
});