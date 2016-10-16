'use strict';

const express = require('express');
// const request = require('supertest');
// const cookieParser = require('cookie-parser');
const app = express();

const PORT = 4000 || process.env.PORT;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// log start time of middlewares
app.use(function (req, res, next) {
    req.startAt = process.hrtime();
    next();
});


// cookies process
app.use(function (req, res, next) {
    let arr_cookies = req.headers.cookie.split(';');
    let cookies = [];
    arr_cookies.forEach((i) => {
        // console.log(i);
        let temp = i.split(':'); // or may be '='
        if (temp.length < 2)
            return;
        temp[0] = temp[0].trim().replace('"', '');
        temp[1] = temp[1].trim().replace('"', '');
        cookies[temp[0]] = temp[1];
    });
    if (cookies && cookies['authorize']) {
        next();
    } else {
        // res.sendStatus(403);
        next();
    }

});

app.use(function (req, res, next) {
    let time = process.hrtime(req.startAt);
    res.setHeader('X-Time', time);
    console.log((time[1] / 1000).toFixed(3));
    next();
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
