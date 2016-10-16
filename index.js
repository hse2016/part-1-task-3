'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

function getCookie(req) {
    let list = {};
    let cookies = req.headers.cookie;

    cookies && cookies.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

function setRequestTime(req) {
    req.startTime = new Date().getTime();
}

function setRequestEndTime(req, res) {
    let time = new Date().getTime() - req.startTime + 1;

    console.log('X-Time', time);
    res.header('X-Time', time);
}

function logRequest(req, res) {
    let request_url = req.method + " " + req.url;
    console.log('X-Request-Url:', request_url);
    res.header('X-Request-Url', request_url);
}


app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

app.use(function (req, res, next) {
    setRequestTime(req);
    logRequest(req, res);
    next();
});

app.use(function (req, res, next) {
    var cookies = getCookie(req);

    if (cookies['authorize']) {
        next();
    } else {
        res.sendStatus(403).end();
    }

});

app.use(function (req, res, next) {
    setRequestEndTime(req, res);
    next();
});

app.use(function (err, req, res, next) {
    console.error(err.toString());
    res.header('X-Request-Error', err.toString());
    res.sendStatus(503).end();
});

app.use(function (req, res, next) {
    console.error('Unknown request')
    res.setHeader('X-Request-Error', 'Unknown request');
    res.sendStatus(503).end();
});



// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;