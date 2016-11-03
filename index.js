'use strict';
var fs = require('fs');
var path = require('path');
const Transformator = require('./Transformator');
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
    if (prepare_cookies(current_cookie)) {
        next();
    }
    else
        res.sendStatus(403);



});


app.use(function (req, res, next) {

    var x_time = process.hrtime(req.startAt);
    x_time = (x_time[1] / 1000).toFixed(3);
    res.setHeader('X-Time', x_time);
    next();
});


app.get('/v1/', function (req, res) {

    work_with_files(req, res);
});

app.get('/v1/(:arr)*', function (req, res, next) {
    work_with_files(req, res);
});
app.use((error, req, res, next) => {
    res.writeHead(503, {'X-Request-Error': error.toString()});
    res.end();
});

app.use(function (req, res, next) {
    res.writeHead(503,{'X-Request-Error': "Unknown request"});
    res.end();
});

app.use(function (req, res, next) {
    res.end();
});

function work_with_files(req, res) {

    var path = '';
    if (req.params[0] != undefined) {
        path = req.params['arr'] + req.params[0];
    }

    if (path === '../') {
        res.status(503).setHeader('x-request-error', path).end();
        return;
    }

    path = path.replace(new RegExp('.+/\.\./', 'gi'), '');

    path = './' + path;

    if (fs.lstatSync(path).isDirectory()) {

        fs.readdir(path, function (error, items) {
            let items_list = ['.', '..'] + items;
            res.status(200).send({'content': items_list});
        });

    } else if (fs.lstatSync(path).isFile()) {

        var stream = fs.createReadStream(path);
        transformStream(stream, res);

    } else {
        res.sendStatus(503).end();
    }

}
function transformStream(streamIn, streamOut) {

    streamOut.setHeader('Transfer-Encoding', 'chunked');
    streamOut.setHeader('Content-Type', 'application/json');
    var t = new Transformator();
    streamIn.pipe(t).pipe(streamOut);
    streamOut.end(JSON.stringify(streamOut));

}

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
