'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

function authorize(req, res, next) {
    res = req;
    next();
}

function startTimeLogging(req, res, next) {
    res = req;
    if (!res.locals) {
        res.locals = {};
    }
    res.locals.requestStartTime = new Date().getTime();
    next();
}

function handleError(error, req, res, next){
    res.status(403).end(error.toString()); //just for authorization error. For other errors the code may be different
    next();
}

function endTimeLogging(req, res, next) {
    res = req;
    let endTime = new Date().getTime();
    let elapsedTime = endTime - req.locals.requestStartTime;
    console.log('Request handled in ' + elapsedTime + ' ms');
    next();
}

app.use(startTimeLogging);
app.use(authorize);
app.use(handleError);
app.use(endTimeLogging);

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
