'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

function authorize(req, res, next)) {

}

function startTimeLogging(req, res, next) {
    //use res.locals for storing data
}

function endTimeLogging(req, res, next) {

}

function handleError(error, req, res, next){
    res.status(403).end(error.toString()); //just for authorization error. For other errors the code may be different
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
