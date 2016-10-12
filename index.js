'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.use(function (req, res, next) {
    console.log('Time: %d', Date.now());
    next();
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
