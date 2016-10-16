// Sergey Volkov aka WERT7

'use strict';

const express = require('express');
const app = express();
const fs = require('fs');

const PORT = process.env.PORT || 4000;

var Transform = require('stream').Transform;
var translitOutput = '';

class T extends Transform {
    constructor(options) {
        super(options);
        this.getLanguage = getLanguage;
        this.translitToRu = translitToRu;
        this.translitToEng = translitToEng;
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8');
        var newStr;
        if (getLanguage(str) === 'ru')
            newStr = translitToEng(str);
        else if (getLanguage(str) === 'en')
            newStr = translitToRu(str);
        this.push(newStr);
        translitOutput += newStr;
        callback();
    }
}

function getLanguage(str) {
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code >= 65 && code <= 90) // A..Z
            return 'en';
        else if (code >= 97 && code <= 122) // a..z
            return 'en';
        else if (code === 35 || code === 39) // # '
            return 'en';
        else if (code >= 1040 && code <= 1071) // А..Я
            return 'ru';
        else if (code >= 1072 && code <= 1103) // а..я
            return 'ru';
    }
}

function translitToEng(str) {
    let newStr = '';
    for (let i = 0; i < str.length; i++) {
        switch (str[i]) {
            case 'А':
                newStr += 'A';
                break;
            case 'Б':
                newStr += 'B';
                break;
            case 'В':
                newStr += 'V';
                break;
            case 'Г':
                newStr += 'G';
                break;
            case 'Д':
                newStr += 'D';
                break;
            case 'Е':
                newStr += 'E';
                break;
            case 'Ё':
                newStr += 'Jo';
                break;
            case 'Ж':
                newStr += 'Zh';
                break;
            case 'З':
                newStr += 'Z';
                break;
            case 'И':
                newStr += 'I';
                break;
            case 'Й':
                newStr += 'J';
                break;
            case 'К':
                newStr += 'K';
                break;
            case 'Л':
                newStr += 'L';
                break;
            case 'М':
                newStr += 'M';
                break;
            case 'Н':
                newStr += 'N';
                break;
            case 'О':
                newStr += 'O';
                break;
            case 'П':
                newStr += 'P';
                break;
            case 'Р':
                newStr += 'R';
                break;
            case 'С':
                newStr += 'S';
                break;
            case 'Т':
                newStr += 'T';
                break;
            case 'У':
                newStr += 'U';
                break;
            case 'Ф':
                newStr += 'F';
                break;
            case 'Х':
                newStr += 'H';
                break;
            case 'Ц':
                newStr += 'C';
                break;
            case 'Ч':
                newStr += 'Ch';
                break;
            case 'Ш':
                newStr += 'Sh';
                break;
            case 'Щ':
                newStr += 'Shh';
                break;
            case 'Ъ':
                newStr += '#';
                break;
            case 'Ы':
                newStr += 'Y';
                break;
            case 'Ь':
                newStr += '\'';
                break;
            case 'Э':
                newStr += 'Je';
                break;
            case 'Ю':
                newStr += 'Ju';
                break;
            case 'Я':
                newStr += 'Ja';
                break;


            case 'а':
                newStr += 'a';
                break;
            case 'б':
                newStr += 'b';
                break;
            case 'в':
                newStr += 'v';
                break;
            case 'г':
                newStr += 'g';
                break;
            case 'д':
                newStr += 'd';
                break;
            case 'е':
                newStr += 'e';
                break;
            case 'ё':
                newStr += 'jo';
                break;
            case 'ж':
                newStr += 'zh';
                break;
            case 'з':
                newStr += 'z';
                break;
            case 'и':
                newStr += 'i';
                break;
            case 'й':
                newStr += 'j';
                break;
            case 'к':
                newStr += 'k';
                break;
            case 'л':
                newStr += 'l';
                break;
            case 'м':
                newStr += 'm';
                break;
            case 'н':
                newStr += 'n';
                break;
            case 'о':
                newStr += 'o';
                break;
            case 'п':
                newStr += 'p';
                break;
            case 'р':
                newStr += 'r';
                break;
            case 'с':
                newStr += 's';
                break;
            case 'т':
                newStr += 't';
                break;
            case 'у':
                newStr += 'u';
                break;
            case 'ф':
                newStr += 'f';
                break;
            case 'х':
                newStr += 'h';
                break;
            case 'ц':
                newStr += 'c';
                break;
            case 'ч':
                newStr += 'ch';
                break;
            case 'ш':
                newStr += 'sh';
                break;
            case 'щ':
                newStr += 'shh';
                break;
            case 'ъ':
                newStr += '#';
                break;
            case 'ы':
                newStr += 'y';
                break;
            case 'ь':
                newStr += '\'';
                break;
            case 'э':
                newStr += 'je';
                break;
            case 'ю':
                newStr += 'ju';
                break;
            case 'я':
                newStr += 'ja';
                break;

            default:
                newStr += str[i];
        }
    }

    return newStr;
}

function translitToRu(str) {
    let newStr = '';
    for (let i = 0; i < str.length; i++) {
        switch (str[i]) {
            case 'A':
                newStr += 'А';
                break;
            case 'B':
                newStr += 'Б';
                break;
            case 'V':
                newStr += 'В';
                break;
            case 'G':
                newStr += 'Г';
                break;
            case 'D':
                newStr += 'Д';
                break;
            case 'Е':
                newStr += 'Е';
                break;
            case 'Jo':
                newStr += 'Ё';
                break;
            case 'Zh':
                newStr += 'Ж';
                break;
            case 'Z':
                newStr += 'З';
                break;
            case 'I':
                newStr += 'И';
                break;
            case 'J':
                newStr += 'Й';
                break;
            case 'K':
                newStr += 'К';
                break;
            case 'L':
                newStr += 'Л';
                break;
            case 'M':
                newStr += 'М';
                break;
            case 'N':
                newStr += 'Н';
                break;
            case 'O':
                newStr += 'О';
                break;
            case 'P':
                newStr += 'П';
                break;
            case 'R':
                newStr += 'Р';
                break;
            case 'S':
                newStr += 'С';
                break;
            case 'T':
                newStr += 'Т';
                break;
            case 'U':
                newStr += 'У';
                break;
            case 'F':
                newStr += 'Ф';
                break;
            case 'H':
                newStr += 'Х';
                break;
            case 'C':
                newStr += 'Ц';
                break;
            case 'Ch':
                newStr += 'Ч';
                break;
            case 'Sh':
                newStr += 'Ш';
                break;
            case 'Shh':
                newStr += 'Щ';
                break;
            case '#':
                newStr += 'ъ';
                break;
            case 'Y':
                newStr += 'Ы';
                break;
            case '\'':
                newStr += 'ь';
                break;
            case 'Je':
                newStr += 'Э';
                break;
            case 'Ju':
                newStr += 'Ю';
                break;
            case 'Ja':
                newStr += 'Я';
                break;


            case 'a':
                newStr += 'а';
                break;
            case 'b':
                newStr += 'б';
                break;
            case 'v':
                newStr += 'в';
                break;
            case 'g':
                newStr += 'г';
                break;
            case 'd':
                newStr += 'д';
                break;
            case 'e':
                newStr += 'е';
                break;
            case 'jo':
                newStr += 'ё';
                break;
            case 'zh':
                newStr += 'ж';
                break;
            case 'z':
                newStr += 'з';
                break;
            case 'i':
                newStr += 'и';
                break;
            case 'j':
                newStr += 'й';
                break;
            case 'k':
                newStr += 'к';
                break;
            case 'l':
                newStr += 'л';
                break;
            case 'm':
                newStr += 'м';
                break;
            case 'n':
                newStr += 'н';
                break;
            case 'o':
                newStr += 'о';
                break;
            case 'p':
                newStr += 'п';
                break;
            case 'r':
                newStr += 'р';
                break;
            case 's':
                newStr += 'с';
                break;
            case 't':
                newStr += 'т';
                break;
            case 'u':
                newStr += 'у';
                break;
            case 'f':
                newStr += 'ф';
                break;
            case 'h':
                newStr += 'х';
                break;
            case 'c':
                newStr += 'ц';
                break;
            case 'ch':
                newStr += 'ч';
                break;
            case 'sh':
                newStr += 'ш';
                break;
            case 'shh':
                newStr += 'щ';
                break;
            case '#':
                newStr += 'ъ';
                break;
            case 'y':
                newStr += 'ы';
                break;
            case '\'':
                newStr += 'ь';
                break;
            case 'je':
                newStr += 'э';
                break;
            case 'ju':
                newStr += 'ю';
                break;
            case 'ja':
                newStr += 'я';
                break;

            default:
                newStr += str[i];
        }
    }

    return newStr;
}

var hrTimeStart;

var startLogger = (req, res, next) => {
    hrTimeStart = process.hrtime();
    console.log('Logging started, hrtime:', hrTimeStart);
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
    if (!url.startsWith('/v1/') || url.startsWith('/v1/../'))
        return next(new Error('Unknown request'));
    next();
};
app.use(requestsLogger);

app.get(/./, (req, res, next) => {
    console.log('incoming cookie', req.headers.cookie);
    let raw_cookie = req.headers.cookie;
    let aut_cookie;
    if (raw_cookie && raw_cookie.startsWith('authorize='))
        aut_cookie = raw_cookie.substr(10);
    
    if (aut_cookie) {
        let path = '.' + req.originalUrl;
        fs.stat(path, (err, stats) => {
            if (err) {
                return next(new Error('Unknown request'));
            }
            if (stats.isFile()) {
                console.log('is file');
                let stream = fs.createReadStream(path);

                var t = new T();
                stream.pipe(t);
                stream.on('error', (err) => {
                    translitOutput = ''; 
                    return next(err); 
                });
                stream.on('close', () => {
                    console.log('stream result:', translitOutput);
                    sendResponse(res, translitOutput);
                    translitOutput = '';
                });
                res.on('close', () => {
                    stream.destroy();
                    translitOutput = '';
                });
            }
            if (stats.isDirectory()) {
                console.log('is dir');
                fs.readdir(path, (err, files) => {
                    if (err)
                        return next(err);
                    else {
                        files.unshift('.', '..');
                        sendResponse(res, files);
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
    let diffMicros = ((diff[0] * 1000000000 + diff[1]) / 1000000).toFixed(3);
    res.append('X-Time', diffMicros);
    console.log('Logging ended, ms elapsed:', diffMicros);
}

function sendResponse(res, content_str) {
    finishLogging(res);
    res.status(200).send({ content: content_str });
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