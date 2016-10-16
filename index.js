'use strict';

const express = require('express');
// const request = require('supertest');
// const cookieParser = require('cookie-parser');
const app = express();

const PORT = 4000 || process.env.PORT;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

app.use(function (req, res, next) {
    // console.log(req.cookies);
    // res.send('Some long long long string');
    next();
});


// cookies process
app.use(function (req, res, next) {
    let arr_cookies = req.headers.cookie.split(';');
    let cookies = [];
    arr_cookies.forEach((i) => {
        let temp = i.split(':');
        temp[0] = temp[0].trim.replace('"', '');
        temp[1] = temp[1].trim.replace('"', '');
        cookies[temp[0]] = temp[1];
    });
    if (cookies && cookies['authorize']) {
        next();
    } else {
        res.sendStatus(403);
    }

});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
