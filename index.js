'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

var logged_time = 0;

function getCookie(req){
    if (req === null || req === undefined) return false;
    var pattern = RegExp('authorize' + "=.[^;]*");
    var matched = req.match(pattern);
    return matched;
}

function setTime(begin, res) {
    var end = new Date().getTime();
    logged_time += end - begin;
    console.log(logged_time);

    res.set('X-Time', logged_time);
}

function transform(text, engToRus) {
    var rus = "щ ш ч ц ю я ё ж ъ ы э а б в г д е з и й к л м н о п р с т у ф х ь".split(' '),
        eng = "shh sh ch cz yu ya yo zh `` y' e` a b v g d e z i j k l m n o p r s t u f x `".split(' ');
    for (var i = 0; i < rus.length; i++) {
        text = text.split(engToRus ? eng[i] : rus[i]).join(engToRus ? rus[i] : eng[i]);
        text = text.split(engToRus ? eng[i].toUpperCase() : rus[i].toUpperCase()).join(engToRus ?
            rus[i].toUpperCase() : eng[i].toUpperCase());
    }

    return text;
}

app.use('/', function(req, res, next) {
    var begin = new Date().getTime();

    if (getCookie(req.headers.cookie)) {
        res.status(200);
        setTime(begin, res);
    } else {
        res.status(403);
    }
    next();
}, function (req, res, next) {
    var begin = new Date().getTime();
    console.log(req.method + ", " + req.originalUrl);
    res.set('X-Request-Url', req.method + " " + req.originalUrl);

    setTime(begin, res);
    next();
});

/*app.use(function(err, req, res, next) {
    if (err.toString().replace('/','') === 'incorrect') {
        res.set('X-Request-Error', 'Unknown request').end();
    }
    res.end();
});*/

/*app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        console.log(error.toString());
    } else {
        next();
    }
});*/

app.use('/', function(req, res, next) {
    var isCyrillic = function (text) {
        return /[а-я]/i.test(text);
    };
    // which string to get from request ?
    transform("lalala", isCyrillic("lalala"));
    // console.log(req.toString());
    res.end();
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
