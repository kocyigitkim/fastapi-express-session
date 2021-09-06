const express_session = require('./index');
const express = require('express');
const RedisSessionStore = require('./src/RedisSessionStore');


const app = express();

app.use(new express_session.SessionManager().use);

app.get("/", (req, res, next) => {
    res.json(req.session);
    if (req.sessionId === "81371c4d-2b57-4797-aab7-6636890e7991") {
        req.session.test = new Date();
    }
});

app.listen(5000, () => {
    console.log('Listening at 5000');
});