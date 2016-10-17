'use strict';

const middlewares = require('./lib/middlewares.js');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

// some constants

// middlewares
app.use(middlewares.createTimeLoggerBegin());
app.use(middlewares.createCookieChecker());
app.use(middlewares.createHeaderLogger());
app.use(middlewares.createTimeLoggerEnd());

app.use('/v1', middlewares.createFileSeekerMiddleware());
app.use('/', middlewares.createNotFoundMiddleware());

app.use(middlewares.createErrorMiddleware());

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;

// vim: foldmethod=indent foldnestmax=1
