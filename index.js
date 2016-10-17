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

    if (path === '../') {
        res.status(503).setHeader('x-request-error', path).end();
        console.log('res with request error');
        return;
    }
    path = path.replace(new RegExp('.+/\.\./', 'gi'), '');

    path = './' + path;

    console.log(path);
    if (fs.lstatSync(path).isDirectory()) {
        fs.readdir(path, (err, items) => {
            console.log(items);
            let json_items = ['.', '..'] + items; // не люблю я это место... но и не знаю как ещё эти штуки присобачить
            res.status(200).send({'content': json_items});
        });
    } else if (fs.lstatSync(path).isFile()) {
        // console.log('create stream');
        var stream = fs.createReadStream(path);
        var trns = new MyTransform();
        stream.pipe(trns);

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

const rusToEng = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
    'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'jo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh',
    'ъ': '#', 'ы': 'y', 'ь': '\'', 'э': 'je', 'ю': 'ju', 'я': 'ja'
};

const engToRus_additional = {
    'JO': 'Ё', 'JU': 'Ю', 'YO': 'Ё', 'CH': 'Ч',
    'YA': 'Я', 'JE': 'Э', 'SHH': 'Щ', 'SH': 'Ш', 'ZH': 'Ж',
    '#': 'ъ',
    'jo': 'ё', 'ju': 'ю', 'yo': 'ё', 'ch': 'ч',
    'ya': 'я', 'je': 'э', 'shh': 'щ', 'sh': 'ш', 'zh': 'ж', 'ja': 'я',
    'Jo': 'Ё', 'Ju': 'Ю', 'Yo': 'Ё', 'Ch': 'Ч',
    'Ya': 'Я', 'Je': 'Э', 'Shh': 'Щ', 'Sh': 'Ш', 'Zh': 'Ж'
};

const engToRus = {
    'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'И',
    'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Я', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'Щ', 'X': 'Х', 'Y': 'Ы', 'Z': 'З',

    'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и',
    'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'я', 'r': 'р',
    's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'щ', 'x': 'х', 'y': 'ы', 'z': 'з', '\'': 'ь'

};

class MyTransform extends Transform {

    constructor(opt){
        super(opt);
        this.isToRus = false;
        this.detected = false;
        this.toNextChunk = '';
        this.isFlushing = false;
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8');
        if (this.detected === false){
            this.detectLanguage(str);
        }
        // console.log(str);
        if (this.detected === true){
            if (this.isToRus) {
                str = this.translate(str, engToRus, engToRus_additional);
            }
            else {
                str = this.translate(str, rusToEng);
            }
        }
        this.push(str);
        callback();
    }

    _flush(callback) {
        this.isFlushing = true;
        let str = this.toNextChunk;
        // console.log(str);
        if (this.detected === true){
            if (this.isToRus) {
                str = this.translate(str, engToRus, engToRus_additional);
            }
            else {
                str = this.translate(str, rusToEng);
            }
        }
        // console.log(str);
        this.push(str);
        callback();
    }
    
    moveLasts(str, map_additional) {
        let last_ind = -1;
        let value = '';
        for (let val in map_additional) {
            let ind = str.lastIndexOf(val);
            if (ind > last_ind) {
                last_ind = ind;
                value = val;
            }
        }
        if (last_ind > -1){
            // console.log('befire slice', str, last_ind, str.length);
            this.toNextChunk = str.slice(last_ind + value.length);
            str = str.slice(0, last_ind + value.length);
            // console.log('after slice ', str, this.toNextChunk);
        }
        return str;
    }

    translate(str, map, map_additional){
        if (!this.isFlushing) {
            str = this.toNextChunk + str;
        }
        this.toNextChunk = '';
        if (map_additional && !this.isFlushing) {
            // console.log('moveNext');
            str = this.moveLasts(str, map_additional);
            for (let val in map_additional) {
                str = str.replace(new RegExp(val, 'g'), map_additional[val]);
            }
        }

        for (let val in map) {
            // console.log('normal saerch', str);
            str = str.replace(new RegExp(val,'g'), map[val]);
        }
        return str;
    }


    detectLanguage(str){
        let eng = str.search(new RegExp('[a-z]', 'i'));
        let rus = str.search(new RegExp('[а-я]', 'i'));
        if (eng > -1 && (eng < rus || rus < 0)){
            this.detected = true;
            this.isToRus = true;
        }
        else if (rus > -1 && (rus < eng || eng < 0)){
            this.detected = true;
            this.isToRus = false;
        }
    }
}



const rq = require('supertest');
rq(app)
    .get('/v1/files/file.en.txt')
    .set('Cookie', ['authorize=12345667'])
    .expect(200)
    .end((err,res) => {console.log('finish')});