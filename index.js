'use strict';

const express = require('express');
var fs = require('fs');
var Transform = require('stream').Transform;
let T = require('./T');

const app = express();

const PORT = process.env.PORT || 4000;

// Чтобы заменить транслитерационный поток, на трансформирующий в Base64
// Необходимо к экземпляру класса T применить метод setType с параметром 'base64'
// t.setType('base64')
//
// Трансформирующий base64 поток можно применить к файловой системе,
// Для этого ноеобходимо заменить в URL '/v1/' на '/base64/'

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

function transformStream(streamIn, streamOut, type = 'utf8') {
    var t = new T();
    t.setType(type);
    streamIn.pipe(t).pipe(streamOut);
}

function catchRequestURL(res, req) {
    let req_url = req.method + " " + req.originalUrl;
    res.setHeader('X-Request-Url', req_url);
    console.log('X-Request-Url: ' + req_url);
}

function setRequestStartTime(req) {
    let time = new Date;
    req.startTime = process.hrtime();
}
function setRequestEndTime(res, req) {
    var duration = process.hrtime(req.startTime);
    var calc_duration = (duration[1] / 1000000).toFixed(3);
    res.setHeader('X-Time', calc_duration);
    console.log('X-time: ' + calc_duration);
}

function getRequestParamsArray(req) {
    var params = req.params[0].split('/');
    params[0] = req.params.arr + params[0];
    return params;
}

function readFileOrDir(params, res, type = 'utf8') {
    let path = getPath(params);

    if (fs.lstatSync(path).isDirectory()) {

        fs.readdir(path, function (err, items) {

            console.log(items);

            let json_items = ['.', '..'] + items;
            res.status(200).send({'content': json_items});
        });

    } else if (fs.lstatSync(path).isFile()) {
        res.setHeader('Content-Type', "application/json");
        res.setHeader('transfer-encoding', "chunked");
        var stream = fs.createReadStream(path);
        transformStream(stream, res, type);
        // transformStream(stream, process.stdout, type);

    } else {
        res.sendStatus(503).end();
    }
}

app.use(function (req, res, next) {

    setRequestStartTime(req);
    catchRequestURL(res, req);
    next();

    // setTimeout(() => next(), 2);
});

app.use(function (req, res, next) {

    var cookies = getCookies(req.headers.cookie);

    if (cookies && cookies['authorize']) {
        next();
    } else {
        res.sendStatus(403).end();
    }

});

app.use(function (req, res, next) {
    setRequestEndTime(res, req);
    next();
});


app.get('/v1/', function (req, res) {
    readFileOrDir([], res);
});

app.get('/base64/', function (req, res) {
    readFileOrDir([], res, 'base64');
});

app.get('/base64/(:arr)*', function (req, res, next) {
    var params = getRequestParamsArray(req);

    if (params.indexOf("..") > -1) {
        next(new Error('Access to upper dir'));
    }

    readFileOrDir(params, res, 'base64');

});

app.get('/v1/(:arr)*', function (req, res, next) {
    var params = getRequestParamsArray(req);

    if (params.indexOf("..") > -1) {
        next(new Error('Access to upper dir'));
    }

    readFileOrDir(params, res);

});

app.use(function (error, req, res, next) {
    res.setHeader('X-Request-Error', error.toString());
    res.status(503).end();
});

app.use(function (req, res, next) {
    res.setHeader('X-Request-Error', "Unknown request");
    res.status(503).end();
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;


function getPath(route) {
    var path = '';
    route.forEach(function (i) {
        path += '/' + i;
    });
    return '.' + path;
}


function getCookies(cookies) {

    if (!cookies)
        return;

    var js_cookies = [];

    cookies.split(';').forEach(function (i) {
        var splited = i.trim().split('=');
        js_cookies[splited[0]] = splited[1];
    });

    return js_cookies;
}
