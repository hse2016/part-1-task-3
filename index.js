'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

var logged_time = 0;

function getCookie(req){
    if (req === null || req === undefined) return false;
    var pattern = RegExp('authorize' + "=.[^;]*");
    var matched = req.match(pattern);
    return matched;
}

app.use('/', function (req, res, next) {
    var begin = new Date().getTime();
    if (getCookie(req.headers.cookie)) {
        res.status(200);
        next();
    } else {
        res.status(403);
    }
    var end = new Date().getTime();
    logged_time += end - begin;
    console.log(logged_time);

    res.set('X-Time', logged_time).end();
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
