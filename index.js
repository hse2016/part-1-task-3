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
    path = './' + path;

    if (fs.lstatSync(path).isDirectory()) {
        fs.readdir(path, (err, items) => {
            console.log(items);
            let json_items = ['.', '..'] + items; // не люблю я это место... но и не знаю как ещё эти штуки присобачить
            res.status(200).send({'content': json_items});
        });
    } else if (fs.lstatSync(path).isFile()) {
        console.log('create stream');
        var stream = fs.createReadStream(path);
        var trns  = new MyTransform();
        stream.pipe(trns).pipe(process.stdout);

    } else {
        res.sendStatus(503).end();
    }
};


module.exports = app;

const rusToEng_upper = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
    'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja'
};

const rusToEng_lower = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'jo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh',
    'ъ': '#', 'ы': 'y', 'ь': '\'', 'э': 'je', 'ю': 'ju', 'я': 'ja'
};

const engToRus_upper = {
    'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'И',
    'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Я', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'Щ', 'X': 'Х', 'Y': 'Ы', 'Z': 'З', '\'': 'Ь',
    'JO': 'Ё', 'JU': 'Ю', 'YO': 'Ё', 'CH': 'Ч',
    'YA': 'Я', 'JE': 'Э', 'SHH': 'Щ', 'SH': 'Ш', 'ZH': 'Ж'
};

const engToRus_lower = {
    'a': 'a', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и',
    'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'я', 'r': 'р',
    's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'щ', 'x': 'х', 'y': 'ы', 'z': 'з', '\'': 'ь',
    'jo': 'ё', 'ju': 'ю', 'yo': 'ё', 'ch': 'ч',
    'ya': 'я', 'je': 'э', 'shh': 'щ', 'sh': 'ш', 'zh': 'ж',
    'Jo': 'Ё', 'Ju': 'Ю', 'Yo': 'Ё', 'Ch': 'Ч',
    'Ya': 'Я', 'Je': 'Э', 'Shh': 'Щ', 'Sh': 'Ш', 'Zh': 'Ж'
};

class MyTransform extends Transform {

    constructor(opt){
        super(opt);
        this.isToRus = false;
        this.detected = false;
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8');
        if (this.detected === false){
            this.detectLanguage(str);
        }
        console.log(str);
        if (this.detected === true){
            if (this.isToRus) {
                str = this.translate(str, engToRus_lower, engToRus_upper);
            }
            else {
                str = this.translate(str, rusToEng_lower, rusToEng_upper);
            }
        }
        this.push(str);
        callback();
    }

    translate(str, lower_map, upper_map){
        for (let val in lower_map) {
            str = str.replace(new RegExp(val,'g'), lower_map[val]);
        }
        for (let val in upper_map) {
            str = str.replace(new RegExp(val,'g'), upper_map[val]);
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



// const rq = require('supertest');
// rq(app)
//     .get('/v1/files/file.multi.txt')
//     .set('Cookie', ['authorize=12345667'])
//     .expect(200)
//     .end((err,res) => {});