'use strict';
var fs = require('fs');
var path = require('path');
const Transformattor = require('./Transformatos');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log('App is listen on ${PORT}');
});

//измеряем время
app.use(function (req, res, next) {
    req.startAt = process.hrtime();
    next();
});


app.use(function (req, res, next) {
    var method = req.method; //'GET'
    var url = req.url; // /v(number)/..
    res.setHeader('X-Request-Url', method + ' ' + url);
    next();
});

app.use(function (req, res, next) {

    var current_cookie = req.headers.cookie;

    if (!current_cookie){
        res.sendStatus(403);
        return;
    }
    if (prepare_cookies(current_cookie)) {
        next();
    }
    else
        res.sendStatus(403);



});

function prepare_cookies(cookie) {

    var result = [];

    cookie = cookie.split('\n');
    for (var i = 0; i < cookie.length; ++i) {
        var temp = cookie[i].split('=');
        result[temp[0]] = temp;
    }
    if (result && result['authorize'])
        return true;
    else return false;
}

app.use(function (req, res, next) {

    var x_time = process.hrtime(req.startAt);
    x_time = (x_time[1] / 1000).toFixed(3);
    res.setHeader('X-Time', x_time);
    next();
});



app.use((err, req, res, next) => {
    res.writeHead(503, {'X-Request-Error': err.toString()});
    res.end();
});

//если ничего не сделалось, значит не поняли запрос
app.use(function (req, res, next) {
    res.writeHead(503,{'X-Request-Error': "Unknown request"});
    res.end();
});



// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
