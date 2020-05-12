import express from 'express';

const app = express()

app.use('/', express.json);
app.get('/hello', (req, resp) => {
    resp.send('Hello World');
})

app.listen(8080, () => {
    console.log(`Application running on port 8080.`)
})