'use strict';

const express = require('express');
var fs = require('fs');
var Transform = require('stream').Transform;
let T = require('./T');

const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

function transformStream(streamIn, streamOut) {
    var t = new T();
    streamIn.pipe(t).pipe(streamOut);
}

function catchRequestURL(res, req) {
    let req_url = req.method + " " + req.originalUrl;
    res.setHeader('X-Request-Url', req_url);
    console.log('X-Request-Url: ' + req_url);
}

function setRequestStartTime(req) {
    let time = new Date;
    req.startTime = time.getTime();
}
function setRequestEndTime(res, req) {
    var duration = (new Date).getTime() - req.startTime;
    res.setHeader('X-Time', duration);
    console.log('X-time: ' + duration);
}

function getRequestParamsArray(req) {
    var params = req.params[0].split('/');
    params[0] = req.params.arr + params[0];
    return params;
}

app.use(function (req, res, next) {

    setRequestStartTime(req);
    catchRequestURL(res, req);

    setTimeout(() => next(), 2);
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
    fs.readdir('./', function (err, items) {
        let json_items = ['.', '..'] + items;
        let content = {'content': json_items};
        res.status(200).send(content);
    });


});

app.get('/v1/(:arr)*', function (req, res, next) {
    var params = getRequestParamsArray(req);

    if (params.indexOf("..") > -1) {
        next(new Error('Access to upper dir'));
    }

    let path = getPath(params);

    if (fs.lstatSync(path).isDirectory()) {

        fs.readdir(path, function (err, items) {

            console.log(items);

            let json_items = ['.', '..'] + items;
            res.status(200).send({'content': json_items});
        });
    } else {

        var stream = fs.createReadStream(path);
        transformStream(stream, res);
        transformStream(stream, process.stdout);

    }

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
    var path = ''
    route.forEach(function (i) {
        path += '/' + i;
    });
    return '.' + path;
}

function getCookies(cookies) {

    if (!cookies)
        return;

    cookies = cookies.split(';');
    var js_cookies = []
    cookies.forEach(function (i) {
        i = i.trim();

        var splited = i.split('=');
        js_cookies[splited[0]] = splited[1];
    });

    return js_cookies;
}
