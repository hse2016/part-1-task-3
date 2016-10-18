'use strict';

const express = require('express');
const app = express();
const Transform = require('stream').Transform;
const fs = require('fs');
const path = require('path');


//-------------Transformed Stream-------

const rus = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Ssh',
    'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja'
};

(function () {
    for (let key in rus) {
        rus[key.toLowerCase()] = rus[key].toLowerCase();
    }
})();

const en = {
    'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф',
    'G': 'Г', 'H': 'Х', 'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л',
    'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Я', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'Щ', 'X': 'Х',
    'Y': 'Ы', 'Z': 'З', '\'': 'ь', '#': 'ъ'
};

const enSpecial = {
    'Jo': 'Ё', 'Yo': 'Ё', 'Ju': 'Ю', 'Yu': 'Ю', 'Ja': 'Я', 'Ya': 'Я',
    'Je': 'Э', 'Sh': 'Ш', 'Zh': 'Ж', 'Ch': 'Ч'
};

const enShh = ['shh', 'Shh', 'SHh', 'SHH', 'ShH'];

(function () {
    for (let key in enSpecial) {
        enSpecial[key.toLowerCase()] = enSpecial[key].toLowerCase();
        enSpecial[key.toUpperCase()] = enSpecial[key].toUpperCase();
    }
})();

(function () {
    for (let key in en) {
        en[key.toLowerCase()] = en[key].toLowerCase();
    }
})();

class Translitartor extends Transform {
    constructor(options, lang) {
        super(options);
        if (lang === 'en') {
            this.dictionary = en;
            this.dictionaryName = 'en';
        } else if (lang === 'rus') {
            this.dictionary = rus;
            this.dictionaryName = 'rus';
        }
    }

    _transform(chunk, encoding, callback) {
        let str = chunk.toString('utf8');
        let formatted = '';
        for (let i = 0; i < str.length; i++) {
            if (!this.dictionary) {
                if (str[i] in rus) {
                    this.dictionary = rus;
                    this.dictionaryName = 'rus';
                } else if (str[i] in en) {
                    this.dictionary = en;
                    this.dictionaryName = 'en';
                }
            }
            if (this.dictionaryName === 'en') {
                if ((i < str.length - 2) && (enShh.indexOf(str[i] + str[i + 1] + str[i + 2]) !== -1)) {
                    formatted += (str[i] === 's') ? 'щ' : 'Щ';
                    i += 2;
                } else {
                    if ((i < str.length - 1) && ((str[i] + str[i + 1]) in enSpecial)) {
                        formatted += this.dictionary[str[i] + str[i + 1]];
                        i += 1;
                    } else {
                        if (str[i] in this.dictionary) {
                            formatted += this.dictionary[str[i]];
                        } else {
                            formatted += str[i];
                        }
                    }
                }
            } else if (this.dictionary && str[i] in this.dictionary) {
                formatted += this.dictionary[str[i]];
            } else {
                formatted += str[i];
            }
        }
        this.push(formatted);
        callback();
    }
}

//---------------Server Part-------------

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
    for (let i = 0; i < array.length; i++) {
        let cookie = array[i].split('=');
        req.cookies[cookie[0]] = cookie[1];
    }
    next();
});

//Check auth middleware
app.use(function (req, res, next) {
    if (!req.cookies.authorize) {
        throw {
            status: 403,
            message: 'User unauthorized'
        };
    }
    next();
});

app.get('/', function (req, res) {
    throw {
        status: 503,
        message: 'Unknown request'
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

app.get('/v1/*', function (req, res) {
    let rawurl = __dirname + req.url.replace('/v1', '');
    let url = path.normalize(rawurl);
    if (url.indexOf(__dirname) === -1) {
        throw {
            status: 400,
            message: 'Wrong path'
        }
    }
    if (fs.lstatSync(url).isDirectory()) {
        fs.readdir(url, function (err, files) {
            if (err) throw err;
            let result = ['.', '..'];
            res.status(200).send({content: result.concat(files)});
        });
    } else {
        let rstream = fs.createReadStream(url);
        let tstream = new Translitartor();
        tstream.setEncoding('utf8');
        rstream
            .pipe(tstream);
        tstream
            .pipe(res)
            .on('data', function(data) {
                res.set('Content-type', 'application/json');
                res.status(200).send({content : data});
            });
    }
});

//-----------Error Handler----------

app.use(function (err, req, res, next) {
    if (err) {
        res.set('X-Request-Error', err.message);
        res.status(err.status).send(err.message);
    }
});

app.use(function (req, res, next) {
    let err = {
        status: 404,
        message: 'Unknown request'
    };
    res.set('X-Request-Error', err.message);
    res.status(err.status).send(err.message);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
