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
        this.russianIdentifiers = this.dict.russians.slice(0, this.dict.russians.length / 2);
        this.latinIdentifiers = ['a', 'b', 'v', 'g', 'd', 'e', 'z', 'i',
                                 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r',
                                 's', 't','u', 'f', 'h', 'c', '#', 'y', "'"];
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8');
        var result = '';
        if (this.targetLanguage === undefined) {
            for (var index = 0; index < str.length; index++) {
                if (this.russianIdentifiers.indexOf(str[index].toLowerCase()) != -1) {
                    this.targetLanguage = 'latin';
                    break;
                } else if (this.latinIdentifiers.indexOf(str[index].toLowerCase()) != -1) {
                    this.targetLanguage = 'russian';
                    break;
                }
            }
        }
        if (this.targetLanguage !== undefined) {
            index = 0;
            if (this.targetLanguage == 'latin') {
                for (var index = 0; index < str.length; index++) {
                    if (this.dict.russians.indexOf(str[index]) != -1) {
                        result += this.dict.toLatin[str[index]];
                    } else {
                        result += str[index];
                    }
                }
            } else if (this.targetLanguage == 'russian') {
                var index = 0;
                while (index < str.length - 2) {
                    if (this.dict.latins.indexOf(str.slice(index, index+3)) != -1) {
                        result += this.dict.toRussian[str.slice(index, index+3)];
                        index += 3;
                    } else if (this.dict.latins.indexOf(str.slice(index, index+2)) != -1) {
                        result += this.dict.toRussian[str.slice(index, index+2)];
                        index += 2;
                    } else if (this.dict.latins.indexOf(str[index]) != -1) {
                        result += this.dict.toRussian[str[index]];
                        index += 1;
                    } else {
                        result += str[index];
                        index += 1;
                    }
                }
                this.stringBuffer = str.slice(index, str.length);
            }
            this.push(result);
        } else {
            this.push(str);
        }
        callback();
    }

    _flush(callback) {
        var index = 0;
        var result = '';
        var str = this.stringBuffer;
        if (this.targetLanguage == 'russian') {
            if (this.dict.latins.indexOf(str.slice(index, index+2)) != -1) {
                result += this.dict.toRussian[str.slice(index, index+2)];
                index += 2;
            } else if (this.dict.latins.indexOf(str[index]) != -1) {
                result += this.dict.toRussian[str[index]];
                index += 1;
                if (this.dict.latins.indexOf(str[index]) != -1) {
                    result += this.dict.toRussian[str[index]];
                    index += 1;
                } else {
                    result += str[index];
                }
            } else {
                result += str[index];
                result += str[index+1];
            }
        }
        this.push(result);
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
    var cookieStrings = req.headers.cookie;
    if (!cookieStrings) {
        res.status(403);
        res.locals.status = 403;
        next(new Error('Forbidden'));
        return;
    }
    cookieStrings = cookieStrings.split(';');
    var cookies = {};
    for (var i in cookieStrings) {
        var cookie = cookieStrings[i].trim();
        var splitIndex = cookie.indexOf('=');
        cookies[cookie.slice(0, splitIndex)] = cookie.slice(splitIndex+1, cookie.length);
    }
    if (cookies['authorize']) {
        next();
    } else {
        res.status(403);
        res.locals.status = 403;
        next(new Error('Forbidden'));
    }
    // next();
}

function logRequestMethod(req, res, next) {
    let request = req.method + ' ' + req.originalUrl;
    res.append('X-Request-Url', request);
    console.log('New request: ' + request);
    next();
}

var fs = require('fs');
function readPath(req, res, next) {
    var path = req.originalUrl;
    if (path.slice(0, 4) !== '/v1/') {
        res.status(503);
        res.locals.status = 503;
        next(new Error('Wrong url'));
        return;
    }
    if (path.slice(0, 3) == '../' || path.indexOf('/../') != -1) {
        res.status(503);
        res.locals.status = 503;
        next(new Error('No access to upper dir'));
        return;
    }
    path = './' + path.slice(4, path.length); //TODO: check if it is ok

    var fileStats = fs.statSync(path); //TODO: check if the path is absolute
    if (fileStats.isDirectory()) {
        var files = fs.readdirSync(path);
        files.push('.');
        files.push('..');
        var response = {};
        response.content = files;
        res.locals.result = response;
        res.status(200);
        res.locals.status = 200;
        next();
    } else if (fileStats.isFile()){
        var input = fs.createReadStream(path);
        var transform = new TransliterationStream();
        res.locals.result = '';
        transform.on('data', (function(chunk) {
            this.locals.result += chunk.toString('utf8');
        }).bind(res));
        transform.on('finish', (function(next, chunk){
            console.log('Result: ' + this.locals.result);
            this.locals.result = {'content': this.locals.result};
            this.status(200);
            this.locals.status = 200;
            next();
        }).bind(res, next));
        input.pipe(transform).read();
    } else {
        next(new Error('No such file or directory'));
    }
}

function handleError(error, req, res, next){
    res.locals.error = error;
    if (res.locals.status == 503) {
        res.append('X-Request-Error', 'Unknown request');
    } else if (res.locals.status != 403) {
        res.append('X-Request-Error', error.toString());
        res.status(503);
    }
    console.error(error.toString());
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
    if (res.locals && res.locals.result) {
        res.send(res.locals.result);
    } else {
        res.send();
    }
}

app.use(startTimeLogging);
app.use(logRequestMethod);
app.use(authorize);
app.use(readPath);
app.use(handleError);
app.use(endTimeLogging);
app.use(resolve);


// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
