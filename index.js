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

function setTime(begin, res) {
    var end = new Date().getTime();
    logged_time += end - begin;
    console.log(logged_time);

    res.set('X-Time', logged_time);
}


app.use('/', function(req, res, next) {
    var begin = new Date().getTime();

    if (getCookie(req.headers.cookie)) {
        res.status(200);
        setTime(begin, res);
        next();
    } else {
        res.status(403).end();
    }
}, function (req, res, next) {
    var begin = new Date().getTime();
    console.log(req.method + ", " + req.originalUrl);
    res.set('X-Request-Url', req.method + " " + req.originalUrl);

    setTime(begin, res);
    res.end();
});

/*app.use(function(err, req, res, next) {
    if (err.toString().replace('/','') === 'incorrect') {
        res.set('X-Request-Error', 'Unknown request').end();
    }
    res.end();
});*/

app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        console.log(error.toString());
    } else {
        next();
    }
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
