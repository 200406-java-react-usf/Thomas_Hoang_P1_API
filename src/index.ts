import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';

const app = express();

app.use('/', express.json());

app.listen(8080, () => {
    console.log(`Application up and running on port 8080.`)
});