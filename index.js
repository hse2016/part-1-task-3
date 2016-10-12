'use strict';

const express = require('express');
var fs = require('fs');
var Transform = require('stream').Transform;

const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});


var translitsRu = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
    'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja'
};

var translitsEN = {
    'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Jo': 'Ё', 'Zh': 'Ж', 'Z': 'З',
    'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф', 'H': 'Х', 'C': 'Ц', 'Ch': 'Ч', 'Sh': 'Ш', 'Shh': 'Щ',
    '#': 'Ъ', 'Y': 'Ы', '\'': 'Ь', 'Je': 'Э', 'Ju': 'Ю', 'Ja': 'Я'
};

class T extends Transform {
    constructor(options) {
        super(options);
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8').toUpperCase();

        let translits;
        if (isNoEnglish(str))
            translits = translitsRu;
        else if (isNoRussian(str))
            translits = translitsEN;


        if(translits) {

            var new_str = '';
            for (var i in str) {
                var char = translits[str[i]];
                if (char) {
                    new_str += char;
                } else {
                    new_str += str[i];
                }
            }
        } else {
            new_str = str;
            // TODO передать ошибку Multi Language
        }

        this.push(new_str);
        callback();
    }
}

function isNoRussian(str) {
    return (/[А-Я-Ё]/gi.test(str) ? false : true);
}
function isNoEnglish(str) {
    return (/[A-Z]/gi.test(str) ? false : true);
}

function transformStream(streamIn, streamOut) {
    var t = new T();
    streamIn.on('error', function(err) { throw new Error('AAAAaAAAAAAAA') });
    streamIn.pipe(t).pipe(streamOut);
}

app.use(function (req, res, next) {

    let time = new Date;
    req.startTime = time.getTime();

    let req_url = req.method + " " + req.originalUrl
    res.setHeader('X-Request-Url', req_url);
    console.log('X-Request-Url: ' + req_url);


    setTimeout(() => next(), 2);
});

app.use(function (req, res, next) {

    var cookies = getCookies(req.headers.cookie);

    if (cookies && cookies['authorize']) {
        next();
    } else {
        res.sendStatus(403);
    }

});

app.use(function (req, res, next) {
    var duration = (new Date).getTime() - req.startTime;
    res.setHeader('X-Time', duration);
    console.log('X-time: ' + duration);
    next();
});


app.get('/v1/', function (req, res) {
    fs.readdir('./', function (err, items) {
        let json_items = ['.', '..'] + items;
        let content = {'content': json_items};
        res.status(200).send(content);
    });


});

app.get('/v1/(:arr)*', function (req, res) {
    var params = req.params[0].split('/');
    params[0] = req.params.arr + params[0];

    if (params.indexOf("..") > -1) {
        next(new Error('Access to upper dir'));
    }

    let path = getPath(params);

    if (fs.lstatSync(path).isDirectory()) {

        fs.readdir(path, function (err, items) {

            console.log(items)

            let json_items = ['.', '..'] + items;
            let content = {'content': json_items};
            res.status(200).send(content);
        });
    } else {
        try {
            var stream = fs.createReadStream(path);
            transformStream(stream, res);
            transformStream(stream, process.stdout);
        } catch(error) {
            res.setHeader('X-Request-Error', error.toString());
            res.status(503).end();
        }
    }

});

app.get('/', function (req, res) {
    next(new Error('Error'));
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
