'use strict';

const express = require('express');
const fs = require('fs');
const Transform = require('stream').Transform;


const app = express();
const PORT = 4000 || process.env.PORT;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// log start time of middlewares
app.use((req, res, next) => {
    req.startAt = process.hrtime();
    next();
});

//logging the requested methods and URLs
app.use((req, res, next) => {
    let method_url = req.method + ' ' + req.originalUrl;
    res.setHeader('X-Request-Url', method_url);
    console.log('X-Request-Url: ', method_url);
    next();
});


// cookies process
app.use((req, res, next) => {
    // console.log(req.headers.cookie);
    if (!req.headers.cookie){
        res.sendStatus(403);
        return;
    }
    let arr_cookies = req.headers.cookie.split(';');
    let cookies = [];
    arr_cookies.forEach((i) => {
        //правильный парс получилось понять только когда посмотерл на тест, иначе вообще не понятно из задания как это должно быть
        let temp = i.trim().split('='); // or may be ':'
        if (temp.length < 2)
            return;
        cookies[temp[0]] = temp[1];
    });
    if (cookies && cookies['authorize']) {
        next();
    } else {
        res.sendStatus(403);
    }

});


//set duration of execution
app.use((req, res, next) => {
    let time = process.hrtime(req.startAt);
    time = (time[1] / 1000).toFixed(3);
    res.setHeader('X-Time', time);
    console.log('X-Time: ', time);
    res.status(200);
    next();
});


// логически бы эти два метода поставить перед установкой времени. Но переставляя понял что если поставить почле, то уходит часть ошибок.
app.get('/v1/', (req,res,next) => {
    files(req, res);
});

app.get('/v1/(:arr)*', function (req, res, next) {
    files(req, res);
});

app.use((err, req, res, next) => {
    console.error('X-Request-Error: ', err.toString());
    res.setHeader('X-Request-Error', err.toString());
    res.status(503).end();
});

+app.use(function (req, res, next) {
        res.setHeader('X-Request-Error', "Unknown request");
        res.status(503).end();
    });

// IMPORTANT. Это строка должна возвращать инстанс сервера

const files = (req, res) => {
    // console.log(req.params);
    let path = '';
    //MAGIC
    if (req.params[0] != undefined) {
        // console.log('pam');
        path = req.params['arr'] + req.params[0];
    }
    path = '.' + path;

    if (fs.lstatSync(path).isDirectory()) {
        fs.readdir(path, (err, items) => {
            console.log(items);
            let json_items = ['.', '..'] + items; // не люблю я это место... но и не знаю как ещё эти штуки присобачить
            res.status(200).send({'content': json_items});
        });
    } else if (fs.lstatSync(path).isFile()) {
        console.log('create stream');
        var stream = fs.createReadStream(path);
        MyTransform(stream, res);
        MyTransform(stream, process.stdout);

    } else {
        res.sendStatus(503).end();
    }
};


module.exports = app;


class MyTransform extends Transform {

    constructor(opt){
        super(opt);
        console.log('constructor');
    }

    _transform(chunk, encoding, callback) {
        console.log(chunk);
        var str = chunk.toString('utf8').toUpperCase();
        let new_str = this.translit(str);
        console.log(new_str);
        this.push(new_str);
        callback();
    }
}



const rq = require('supertest');
rq(app)
    .get('/v1/files')
    .set('Cookie', ['authorize=12345667'])
    .expect(200)
    .end((err,res) => {});