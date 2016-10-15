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

    console.log("X-Time", time);
    res.header('X-Time', time);
}


app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

app.use(function (req, res, next) {
    setRequestTime(req);
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
    res.end();
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
