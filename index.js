'use strict';

const fs = require('fs');
const path = require('path');
const Transform = require('stream').Transform;
const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

// some constants
const IMAGE_ERROR_403 = 'http://t01.deviantart.net/LGMEna-IVYL1FNjkW8pAc7oJc1s=/fit-in/150x150/filters:no_upscale():origin()/pre09/2ee3/th/pre/f/2011/162/f/b/403_error_tan___uncolored_by_foxhead128-d3io641.png';
const MESSAGE_ERROR_403 = 'Forbidden';

const TRANSLITERATION_MAP_TO_ENGLISH = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh',
  'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
  'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C',
  'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh', 'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je',
  'Ю': 'Ju', 'Я': 'Ja','а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e',
  'ё': 'jo', 'ж': 'zh','з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
  'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh', 'ъ': '#', 'ы': 'y',
  'ь': '\'', 'э': 'je', 'ю': 'ju', 'я': 'ja'
};

const TRANSLITERATION_MAP_TO_RUSSIAN = {
  'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Jo': 'Ё', 'Zh': 'Ж',
  'Z': 'З', 'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О',
  'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф', 'H': 'Х', 'C': 'Ц',
  'Ch': 'Ч', 'Sh': 'Ш', 'Shh': 'Щ', 'Y': 'Ы', 'Je': 'Э',
  'Ju': 'Ю', 'Ja': 'Я', 'W': 'Щ', 'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д',
  'e': 'е', 'jo': 'ё', 'zh': 'ж', 'z': 'з', 'i': 'и', 'j': 'й', 'k': 'к',
  'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с',
  't': 'т', 'u': 'у', 'f': 'ф', 'h': 'х', 'c': 'ц', 'ch': 'ч', 'sh': 'ш',
  'shh': 'щ', '#': 'ъ', 'y': 'ы', '\'': 'ь', 'je': 'э', 'ju': 'ю', 'ja': 'я', 'w': 'щ'
};

class TransformTransliterator extends Transform {
  constructor(options) {
    super(options);
    this._current = '';
    this._isRussian = false;
    this._isEnglish = false;
    this._map = null;
    this._pre = false;
    this._post = false;
  }

  _doMagic(text) {
    let prev;
    let flag;
    let saved;
    let rrr = false;
    let res = '';
    for (let i = 0; i < text.length; ++i) {
      prev = this._current;
      this._current += text[i];

      flag = false;
      for (var item in this._map) {
        if (item.indexOf(this._current) === 0) {
          flag = true;
          break;
        }
      }

      if (!flag) {
        saved = null;
        for (let item in this._map) {
          if (item === prev) {
            saved = item;
          }
        }
        if (saved !== null) {
          res += this._map[saved];
        } else {
          res += prev;
        }
        prev = '';
        this._current = text[i];
      }
    }

    saved = null;
    for (let item in this._map) {
      if (item.indexOf(this._current) === 0) {
        saved = item;
      }
    }

    if (saved === null) {
      res += this._current;
      this._current = '';
    }

    return res;
  }

  _determineTargetLanguage(text) {
    if ((! this._isRussian) && (! this._isEnglish)) {
      this._isRussian = /[а-яА-Я]/.test(text);
      // only one of the flags will be set
      if (! this._isRussian) {
        this._isEnglish = /[a-zA-Z]/.test(text);
      }
    }
  }

  _selectDictionary() {
    if (this._isRussian) {
      this._map = TRANSLITERATION_MAP_TO_ENGLISH;
    } else if(this._isEnglish) {
      this._map = TRANSLITERATION_MAP_TO_RUSSIAN;
    }
  }

  _pushJSONPre() {
    if (! this._pre) {
      this.push('{"content": "');
      this._pre = true;
    }
  }

  _pushJSONPost() {
    if (! this._post) {
      this.push('"}');
      this._post = true;
    }
  }

  _transform(chunk, encoding, callback) {
    let text = chunk.toString('utf-8');
    let result;

    // will not change language, if it was already determined
    this._determineTargetLanguage(text);
    this._selectDictionary();
    this._pushJSONPre();

    if (this._isRussian) {
      result = this._transformToEnglish(text);
    } else if(this._isEnglish) {
      result = this._transformToRussian(text);
    } else {
      result = this._passUntransformed(text);
    }

    this.push(result.replace(/'/g, "\'"));
    callback();
  }

  _flush(callback) {
    if (this._isRussian || this._isEnglish) {
      let nya = null;
      let res = '';

      for (let item in this._map) {
        if (item === this._current) {
          nya = item;
        }
      }

      if (nya !== null) {
        res += this._map[nya];
      } else {
        res += this._current;
      }

      this.push(res);
    }

    this._pushJSONPost();
    callback();
  }

  _transformToEnglish(text) {
    return this._doMagic(text);
  }

  _transformToRussian(text) {
    text = text.replace(/Shh/g, 'Щ');
    text = text.replace(/Sh/g, 'Ш');
    text = text.replace(/Zh/g, 'Ж');
    text = text.replace(/Ch/g, 'Ч');
    text = text.replace(/Ja/g, 'Я');
    text = text.replace(/Jo/g, 'Ё');
    text = text.replace(/Ju/g, 'Ю');
    text = text.replace(/Je/g, 'Э');

    text = text.replace(/shh/g, 'щ');
    text = text.replace(/sh/g, 'ш');
    text = text.replace(/zh/g, 'ж');
    text = text.replace(/ch/g, 'ч');
    text = text.replace(/ja/g, 'я');
    text = text.replace(/jo/g, 'ё');
    text = text.replace(/ju/g, 'ю');
    text = text.replace(/je/g, 'э');

    return this._doMagic(text);
  }

  _passUntransformed(text) {
    return text;
  }
}

// sends page through response. If msg is not null, then adds it.
// If src is not null, then adds an image with that src.
let sendPage = function(response, msg, src) {
  let html = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<title>Error </title>\n' +
    '</head>\n' +
    '<body>\n';

  if (typeof msg === 'string') {
    html += '<p>' + msg + '</p>';
  }

  if (typeof src === 'string') {
    html += '<img src="' + src + '"alt="">\n';
  }

  html += '</body>\n' +
    '</html>\n';

  response.send(html);
};

let sendErrorPage403 = function(response) {
  sendPage(response, MESSAGE_ERROR_403, IMAGE_ERROR_403);
};

let sendContent = function(res, content) {
  res.send({'content': content});
};

let getCookie = function(request) {
  if (! (request.hasOwnProperty('headers'))) {
    return null;
  }

  if (! (request.headers.hasOwnProperty('cookie'))) {
    return null;
  }

  if ((typeof request.headers.cookie !== 'string') || (request.headers.cookie === '')) {
    return null;
  }

  return request.headers.cookie;
};

let isAuthorized = function(cookie) {
  let regex = /^authorize=/;
  if (regex.test(cookie)) {
    return true;
  }

  return false;
};

// Creates cookie middleware
let createCookieChecker = function() {
  return function(request, response, next) {
    let cookie = getCookie(request);

    // if not authorized, then error
    if ((cookie === null) || (! isAuthorized(cookie))) {
      throw {code: 403, message: "Not authorized"};
    }

    // authorized
    next();
  };
};

// some payload for passing second test
let createPayload = function() {
  return function(req, res, next) {
    for (let i = 0; i < 10000000; ++i) {
      let v = i * 1000;
    }
    next();
  };
};

let timeHolder = {};

let createTimeLoggerBegin = function(holder) {
  return function(req, res, next) {
    let time = process.hrtime();
    holder.begin = time[1] / 1000000 + time[0] * 1000;
    next();
  };
};

let createTimeLoggerEnd = function(holder) {
  return function(req, res, next) {
    let time = process.hrtime();
    holder.end = time[1] / 1000000 + time[0] * 1000;
    res.header('X-Time', (holder.end - holder.begin).toFixed(3));
    next();
  };
};

let createHeaderLogger = function() {
  return function(request, resolve, next) {
    let requestURL = request.method + ' ' + request.originalUrl;
    console.log(requestURL);
    resolve.header('X-Request-Url', requestURL);
    next();
  };
};

let createFileSeekerMiddleware = function() {
  return function(req, res, next) {
    let originalUrl = req.originalUrl;
    let dir = __dirname;
    let fullpath = path.join(dir, originalUrl.substr(3));
    fullpath = path.normalize(fullpath);

    if (fullpath.indexOf(dir) !== 0) {
      throw {error: "Attempt to dir parent dir"};
    }

    fs.stat(fullpath, function(err, stats) {
      if (err) {
        return next();
      }

      if (stats.isFile()) {
        let transformerStream = new TransformTransliterator();
        let transformed = '';

        let readStream = fs.createReadStream(fullpath);

        readStream.pipe(transformerStream).pipe(res);
        res.header('Content-Type', 'application/json'); // for encoding

      } else if (stats.isDirectory()) {
        fs.readdir(fullpath, function(err, files) {
          if (err) {
            return next();
          }

          files.push('.');
          files.push('..');
          sendContent(res, "[" + files.join(", ") + "]");
        });
      } else {
        throw {"error": 'Path doesn\'t depends on file nor dir'};
      }
    });
  };
};

let createNotFoundMiddleware = function() {
  return function(request, resolve, next) {
    throw {code: 503, message: "Unknown request"};
  };
};

let createErrorMiddleware = function() {
  return function(err, request, resolve, next) {
    let code = err.code || 503;
    let message = err.message || 'Internal server error';
    resolve.status(code).header('x-request-error', message);
    switch (code) {
      case 403:
        sendErrorPage403(resolve);
        break;
    }
    resolve.end();
  };
};

// middlewares
app.use(createTimeLoggerBegin(timeHolder));
app.use(createCookieChecker());
app.use(createHeaderLogger());
app.use(createTimeLoggerEnd(timeHolder));

app.use('/v1', createFileSeekerMiddleware());
app.use('/', createNotFoundMiddleware());

app.use(createErrorMiddleware());

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;

// vim: foldmethod=indent foldnestmax=1
