// Sergey Volkov aka WERT7

'use strict';

const express = require('express');
const app = express();
const fs = require('fs');
const node_path = require('path'); // for resolving path
const PORT = process.env.PORT || 4000;
const TranslitTransform = require('./TranslitTransform');
var hrTimeStart;

var startLogger = (req, res, next) => {
    hrTimeStart = process.hrtime();
    next();
};
app.use(startLogger);

var requestsLogger = (req, res, next) => {
    let url = req.originalUrl;
    let output = req.method + ' ' + url;
    console.log(output);
    res.append('X-Request-Url', output);
    if (req.method !== 'GET')
        return next(new Error('Illegal request method (not GET)'));
    if (!url.startsWith('/v1') || url.startsWith('/v1/../'))
        return next(new Error('Unknown request'));
    next();
};
app.use(requestsLogger);

app.get(/./, (req, res, next) => {
    let raw_cookie = req.headers.cookie;
    let aut_cookie;
    if (raw_cookie && raw_cookie.startsWith('authorize=')) // TODO: извлечь куки нормально, их может быть несколько
        aut_cookie = raw_cookie.substr(10);

    if (aut_cookie) { // raw_cookie, чтобы потестить через браузер
        let path = '.' + req.originalUrl;
        path = path.replace('/v1','');
        path = node_path.resolve(path);
        fs.stat(path, (err, stats) => {
            if (err) {
                console.error(err);
                return next(new Error('Unknown request'));
            }
            res.append('Content-Type', 'application/json').status(200);
            if (stats.isFile()) {
                let stream = fs.createReadStream(path);
                let tt = new TranslitTransform();
                finishLogging(res);
                res.write('{"content":"');
                stream.pipe(tt).pipe(res); // stream.pipe(tt).pipe(process.stdout);
                stream.on('error', (err) => {
                    return next(err); 
                });
                stream.on('close', () => {
                    res.end();
                });
                res.on('close', () => { // закрыть файл, если соединение разорвано
                    stream.destroy();
                });
            }
            else if (stats.isDirectory()) {
                fs.readdir(path, (err, files) => {
                    if (err)
                        return next(err);
                    else {
                        files.unshift('.', '..');
                        finishLogging(res);
                        res.send({ content: files });
                    }
                });
            }
        });
    }
    else {
        finishLogging(res);
        res.sendStatus(403);
    }
});

function finishLogging(res) {
    let diff = process.hrtime(hrTimeStart);
    let diffMillis = ((diff[0] * 1000000000 + diff[1]) / 1000000).toFixed(3); // diff[0] в секундах, diff[1] в наносекундах
    res.append('X-Time', diffMillis);
    console.log('Logging ended, ms elapsed:', diffMillis);
}

var errorHandler = (err, req, res, next) => {
    let msg = err.message;
    console.error(msg);
    finishLogging(res);
    res.append('X-Request-Error', msg);
    res.status(503).end();
};
app.use(errorHandler);

app.listen(PORT, () => console.log(`App is listen on ${PORT}`));

// IMPORTANT
module.exports = app;