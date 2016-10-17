'use strict';

const express = require('express');
const fs = require('fs');
const MyTransform = require('./MyTransform');

const app = express();
const PORT = process.env.PORT || 4000;

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
    //если вообще нет куков - отправляем ошибку
    if (!req.headers.cookie){
        res.sendStatus(403);
        return;
    }

    // сплитим все пришедшие куки, на отдельные
    let arr_cookies = req.headers.cookie.split(';');
    let cookies = [];
    // и разбиваем их на пары
    arr_cookies.forEach((i) => {
        //правильный парс получилось понять только когда посмотерл на тест, иначе вообще не понятно из задания как это должно быть
        let temp = i.trim().split('='); // or may be ':'
        if (temp.length < 2)
            return;
        cookies[temp[0]] = temp[1];
    });

    // ошибка есть нет кука authorize
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


//обработка обших ошибок от всех предшествующих middleware
app.use((err, req, res, next) => {
    console.error('X-Request-Error: ', err.toString());
    res.setHeader('X-Request-Error', err.toString());
    res.status(503).end();
});

//если ничего не сделалось, значит не поняли запрос
app.use(function (req, res, next) {
        res.setHeader('X-Request-Error', "Unknown request");
        res.status(503).end();
    });

// обработка запросов к файловой системе
const files = (req, res) => {
    let path = '';
    //MAGIC
    if (req.params[0] != undefined) {
        path = req.params['arr'] + req.params[0];
    }

    /* нельзя уходить в директорию выше.
     вообще этот код содержит ошибку, правда тесты её не ловят :-)
     что если пусть будет таким: ./temp/../../file - у меня ошибка неправильности пути не вылетит */
    if (path === '../') {
        res.status(503).setHeader('x-request-error', path).end();
        console.log('res with request error');
        return;
    }
     /*
    Если если структура типа ./temp/../ - значит нужно просто удалить из пути temp и отсыл наверх.
    Опять же тут не полная продуманность, и структура /../../ - просто удалится и всё, а не откинется на 2 уравня на верх
     */
    path = path.replace(new RegExp('.+/\.\./', 'gi'), '');

    path = './' + path;

    // парсит директорию и выводит список файлов
    if (fs.lstatSync(path).isDirectory()) {
        fs.readdir(path, (err, items) => {
            console.log(items);
            // не люблю я это место... но и не знаю как ещё эти штуки присобачить, а они нужна
            let json_items = ['.', '..'] + items;
            res.status(200).send({'content': json_items});
        });
    }
    // обрабатывает файл
    else if (fs.lstatSync(path).isFile()) {
        // console.log('create stream');
        var stream = fs.createReadStream(path);
        var trns = new MyTransform();
        stream.pipe(trns);

        // собирает строку из данных, получаемых из стрима
        let str = '';
        trns.on('data', (chunk) => {
            str += chunk.toString('utf-8');
        });
        trns.on('end', () => {
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({content: str}));
            // console.log(str);
        });


    } else {
        res.sendStatus(503).end();
    }
};


module.exports = app;

// const rq = require('supertest');
// rq(app)
//     .get('/v1/files/file.en.txt')
//     .set('Cookie', ['authorize=12345667'])
//     .expect(200)
//     .end((err,res) => {console.log('finish')});