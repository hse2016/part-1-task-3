'use strict';

const middlewares = require('./lib/middlewares.js');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;
let useBase64 = false;

process.argv.forEach(
  (val, index, array) => {
    if (val === '--base-64') {
      useBase64 = true;
    }
  }
);

if (useBase64) {
  console.log('Using base64 encoding');
} else {
  console.log('Using transliteration');
}

// middlewares
app.use(middlewares.createTimeLoggerBegin());
app.use(middlewares.createCookieChecker());
app.use(middlewares.createHeaderLogger());
app.use(middlewares.createTimeLoggerEnd());

app.use('/v1', middlewares.createFileSeekerMiddleware(useBase64));
app.use('/', middlewares.createNotFoundMiddleware());

app.use(middlewares.createErrorMiddleware());

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;

// vim: foldmethod=indent foldnestmax=1
