'use strict';

class Dictionary {
    constructor() {
        this.russians = [];
        for (var i = 'А'.charCodeAt(0); i != 'Я'.charCodeAt(0)+1; i++) {
            this.russians.push(String.fromCharCode(i));
            if (String.fromCharCode(i) === 'Е') {
                this.russians.push('Ё');
            }
        }
        this.russians = this.russians.map((element) => {return element.toLowerCase();}).concat(this.russians);

        this.latins = ['A', 'B', 'V', 'G', 'D', 'E', 'Jo', 'Zh', 'Z', 'I', 'J',
                       'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'H',
                       'C', 'Ch', 'Sh', 'Shh', '#', 'Y', "'", 'Je', 'Ju', 'Ja'];
        this.latins = this.latins.map((element) => {return element.toLowerCase();}).concat(this.latins);
        this.toLatin = {};
        this.toRussian = {};
        for (var i = 0; i < this.russians.length; i++) {
            this.toLatin[this.russians[i]] = this.latins[i];
            this.toRussian[this.latins[i]] = this.russians[i];
        }
    }
}

var Transform = require('stream').Transform;

class TransliterationStream extends Transform {
    constructor(options) {
        super(options);
        this.targetLanguage = undefined;
        this.stringBuffer = '';
        this.dict = new Dictionary();
        this.russianIdentifiers = dict.russians.slice(0, dict.russians.length / 2);
        this.latinIdentifiers = ['a', 'b', 'v', 'g', 'd', 'e', 'z', 'i',
                                 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r',
                                 's', 't','u', 'f', 'h', 'c', '#', 'y', "'"];
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8');
        var result = '';
        if (targetLanguage !== undefined) {
            for (var index = 0; index < str.length; index++) {
                if (this.russianIdentifiers.indexOf(str[index].toLowerCase()) != -1) {
                    targetLanguage = 'latin';
                    break;
                } else if (this.latinIdentifiers.indexOf(str[index].toLowerCase()) != -1) {
                    targetLanguage = 'russian';
                    break;
                }
            }
        }
        if (targetLanguage !== undefined) {
            index = 0;
            if (targetLanguage == 'latin') {
                for (var index = 0; index < str.length; index++) {
                    if (this.dict.russians.indexOf(str[index]) != -1) {
                        result += this.dict.toLatin[str[index]];
                    }
                }
            } else if (targetLanguage == 'russian') {
                //TODO
            }
            this.push(result);
        } else {
            this.push(str);
        }
        callback();
    }
}


const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

function startTimeLogging(req, res, next) {
    if (!res.locals) {
        res.locals = {};
    }
    res.locals.requestStartTime = process.hrtime();
    next();
}

function authorize(req, res, next) {
    next();
}

function logRequestMethod(req, res, next) {
    if (!res.locals) {
        res.locals = {};
    }
    let request = req.method + ' ' + req.originalUrl;
    res.append('X-Request-Url', request);
    console.log('New request: ' + request);
    next();
}

function handleError(error, req, res, next){
    if (!res.locals) {
        res.locals = {};
    }
    res.locals.error = error;
    res.status(403); //just for authorization error. For other errors the code may be different
    next();
}

function endTimeLogging(req, res, next) {
    let elapsedTime = process.hrtime(res.locals.requestStartTime);
    elapsedTime = elapsedTime[0]*1000 + (elapsedTime[1]  - elapsedTime[1] % 1000) / 1e6;
    console.log('Request handled in ' + elapsedTime + ' ms');
    res.append('X-Time', elapsedTime.toString());
    next();
}

function resolve(req, res) {
    if (res.locals && res.locals.error) {
        res.send(res.locals.error.toString());
    } else {
        res.send();
    }
}

app.use(startTimeLogging);
app.use(logRequestMethod);
app.use(authorize);
app.use(handleError);
app.use(endTimeLogging);
app.use(resolve);

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
