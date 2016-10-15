'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

function startTimeLogging(req, res, next) {
    if (!res.locals) {
        res.locals = {};
    }
    res.locals.requestStartTime = process.hrtime();
    next();
}

function authorize(req, res, next) {
    next();
}

function handleError(error, req, res, next){
    res.status(403).end(error.toString()); //just for authorization error. For other errors the code may be different
    next();
}

function endTimeLogging(req, res, next) {
    let elapsedTime = process.hrtime(res.locals.requestStartTime);
    elapsedTime = elapsedTime[0]*1000 + (elapsedTime[1]  - elapsedTime[1] % 1000) / 1e6;
    console.log('Request handled in ' + elapsedTime + ' ms');
    res.append('X-Time', elapsedTime.toString());
    res.status(200).end(); //TODO: to think if it should be here
    next();
}

app.use(startTimeLogging);
app.use(authorize);
app.use(handleError);
app.use(endTimeLogging);

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
