'use strict';

const express = require('express');
const app = express();
const Transform = require('stream').Transform;

const rus = {'А' : 'A', 'Б' : 'B', 'В' : 'V', 'Г' : 'G', 'Д' : 'D', 'Е' : 'E', 'Ё' : 'Jo',
             'Ж' : 'Zh', 'З' : 'Z', 'И' : 'I', 'Й' : 'J', 'К' : 'K', 'Л' : 'L', 'М' : 'M',
             'Н' : 'N', 'О' : 'O', 'П' : 'P', 'Р' : 'R', 'С' : 'S', 'Т' : 'T', 'У' : 'U',
             'Ф' : 'F', 'Х' : 'H', 'Ц' : 'C', 'Ч' : 'Ch', 'Ш' : 'Sh', 'Щ' : 'Ssh',
             'Ъ' : '#', 'Ы' : 'Y', 'Ь' : '\'', 'Э' : 'Je', 'Ю' : 'Ju', 'Я' : 'Ja'};

(function () {
    for(let key in rus) {
        rus[key.toLowerCase()] = rus[key].toLowerCase();
    }
})();

const en = {'A' : 'А', 'B' : 'Б', 'C' : 'Ц', 'D' : 'Д', 'E' : 'Е', 'F' : 'Ф',
            'G' : 'Г', 'H' : 'Х', 'I' : 'И', 'J' : 'Й', 'K' : 'К', 'L' : 'Л',
            'M' : 'М', 'N' : 'Н', 'O' : 'О', 'P' : 'П', 'Q' : 'Я', 'R' : 'Р',
            'S' : 'С', 'T' : 'Т', 'U' : 'У', 'V' : 'В', 'W' : 'Щ', 'X' : 'Х',
            'Y' : 'Ы', 'Z' : 'З'};

(function () {
    for(let key in en) {
        en[key.toLowerCase()] = en[key].toLowerCase();
    }

})();

class Translitartor extends Transform {
    constructor(options, lang) {
        super(options);
        if (lang === 'en') {
            this.dictionary = en;
        } else {
            this.dictionary = rus;
        }
    }

    _transform(chunk, encoding, callback) {
        let str = chunk.toString('utf-8');
        let formatted = '';
        for(let i = 0; i < str.length; i ++) {
            if (str[i] in this.dictionary) {
                formatted += this.dictionary[str[i]];
            } else {
                formatted += str[i];
            }
        }
        this.push(formatted);
        callback();
    }
}


var t = new Translitartor(null, 'en');

process.stdin.pipe(t).pipe(process.stdout);

/*
const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

//Set timer middleware
app.use(function (req, res, next) {
    req.timer = process.hrtime();
    next();
});

//---------Middle-wares----------------

//Request url middle-ware
app.use(function (req, res, next) {
    let reqUrl = req.method + ' ' + req.url;
    res.set('X-Request-Url', reqUrl);
    console.log(reqUrl);
    next();
});

//Cookie parser middleware
app.use(function (req, res, next) {
    req.cookies = {};
    let array = [];
    if (req.headers.cookie) {
        array = req.headers.cookie.replace('; ', ';').split(';');
    }
    for (let i = 0; i < array.length; i ++) {
        let cookie = array[i].split('=');
        req.cookies[cookie[0]] = cookie[1];
    }
    next();
});

//Check auth middleware
app.use(function (req, res, next) {
    if (!req.cookies.authorize) {
        throw {
            status : 403,
            message : 'User unauthorized'
        };
    }
    next();
});

app.get('/', function (req, res, next) {
    throw {
        status : 503,
        message : 'Unknown request'
    }
});

//------------Log Timer-------------

//Set timer middleware
app.use(function (req, res, next) {
    let time = process.hrtime(req.timer);
    let formatTime = Number(time[0] + '.' + time[1]).toFixed(3);
    res.set('X-Time', formatTime);
    console.log(formatTime);
    next();
});

//-----------Routes-----------------

app.get('/v1/', function (req, res) {
    res.sendStatus(200);
});

//-----------Error Handler----------

app.use(function(err, req, res, next) {
    if (err) {
        console.error(err);
        res.set('X-Request-Error', err.message);
        res.status(err.status).send(err.message);
    }
});

app.use(function(req, res, next) {
    let err = {
        status : 404,
        message : 'Unknown request'
    };
    console.error(err);
    res.set('X-Request-Error', err.message);
    res.status(err.status).send(err.message);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app; */