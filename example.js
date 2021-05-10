const express_session = require('./index');
const express = require('express');

const app = express();

app.use(new express_session.SessionManager().use);

app.get("/", (req,res,next)=>{
    res.json(req.session);
});

app.listen(5000, ()=>{
    console.log('Listening at 5000');
});