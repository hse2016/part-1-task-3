'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});


app.use(function (req, res, next) {

    let time = new Date;
    req.startTime = time.getTime();

    let req_url = req.method + " " + req.originalUrl
    res.setHeader('X-Request-Url', req_url);
    console.log('X-Request-Url: ' + req_url);


    setTimeout( () => next() , 1);
});

app.use(function (req, res, next) {

    var cookies = getCookies(req.headers.cookie);

    if (cookies && cookies['authorize']) {
        // console.log(cookies);
        next();
    } else {
        res.sendStatus(403);
    }

});

app.use(function (req, res, next) {
    var duration =  (new Date).getTime() - req.startTime;
    res.setHeader('X-Time', duration);
    console.log('X-time: ' + duration);
    next();
});

app.get('/v1', function (req, res) {
    res.send('Hello World!');
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;


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
