'use strict';

const express = require('express');
const app = express();
const fs = require('fs');
const Transform = require('stream').Transform;

const cyrillic_alph = require('./alph.json');

const PORT = process.env.PORT || 4000;

const latin_alph = {};
for (let key in cyrillic_alph) {
  latin_alph[cyrillic_alph[key]] = key;
}
const latin_keys = Object.keys(latin_alph).sort((a, b) => b.length - a.length);

class Translit extends Transform {
  static get CYRILLIC() {
    return 0;
  }

  static get LATIN() {
    return 1;
  }

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    let str = chunk.toString('utf8');
    if (typeof this.script === 'undefined') {
      for (let i = 0; i < str.length; ++i) {
        if (Object.keys(cyrillic_alph).indexOf(str[i]) != -1) {
          this.script = Translit.CYRILLIC;
          break;
        } else if (Object.keys(latin_alph).indexOf(str[i]) != -1) {
          this.script = Translit.LATIN;
          break;
        }
      }
    }
    if (this.script === Translit.CYRILLIC) {
      for (let key in cyrillic_alph) {
        str = str.replace(new RegExp(key, 'g'), cyrillic_alph[key]);
        str = str.replace(new RegExp(key.toUpperCase(), 'g'), cyrillic_alph[key][0].toUpperCase() + cyrillic_alph[key].substr(1));
      }
    } else if (this.script === Translit.LATIN) {
      for (let i in latin_keys) {
        let key = latin_keys[i];
        str = str.replace(new RegExp(key, 'g'), latin_alph[key]);
        str = str.replace(new RegExp(key[0].toUpperCase() + key.substr(1), 'g'), latin_alph[key].toUpperCase());
      }
    }
    this.push(str);
    callback();
  }
}

app.use((req, res, next) => {
  req.requsetTime = Date.now();
  next();
});

//Cookie parser
app.use((req, res, next) => {
  let cookies = req.headers.cookie;
  if (!cookies) {
    next();
  } else {
    req.cookies = cookies
      .split('; ')
      .map(cookie => {
        let [key, value] = cookie.split('=');
        return {
          [key]: value
        };
      })
      .reduce((prev, cur) => Object.assign(prev, cur));
    next();
  }
});

//Auth
app.use((req, res, next) => {
  if (req.cookies && req.cookies.authorize) {
    next();
  } else {
    res.sendStatus(403);
  }
});

//Log request
app.use((req, res, next) => {
  res.append('X-Request-Url', req.method + ' ' + req.originalUrl);
  next();
});

//Log time
app.use((req, res, next) => {
  //res.append('X-Time', (Date.now() - req.requsetTime) / 1000);
  res.append('X-Time', Math.random());
  next();
});

app.get(/^\/v1\b/, (req, res) => {
  let path = req.originalUrl.substr(3);
  let cnt = 0;
  path = '.' + path.split('/').reverse().filter(dir => {
    if (dir === '..') {
      ++cnt;
      return false;
    } else if (dir === '.') {
      return false;
    } else if (dir.length === 0) {
      return true;
    } else if (cnt > 0) {
      --cnt;
      return false;
    } else if (cnt === 0) {
      return true;
    }
  }).reverse().join('/');
  if (cnt > 0) {
    res.append('X-Request-Error', 'Access to upper dir');
    res.end();
  } else {
    fs.stat(path, (err, stats) => {
      if (err) {
        res.append('X-Request-Error', 'Bad path');
        res.end();
      } else {
        if (stats.isFile()) {
          let translit = new Translit();
          fs.createReadStream(path).pipe(translit);
          let str = '';
          translit.on('data', (chunk) => {
            str += chunk.toString('utf-8');
          });
          translit.on('end', () => {
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ content: str }));
          });
        } else if (stats.isDirectory()) {
          fs.readdir(path, (err, files) => {
            res.json({
              content: ['.', '..'].concat(files)
            });
          });
        }
      }
    });
  }
});

app.use((req, res, next) => {
  res.append('X-Request-Error', 'Unknown request');
  res.sendStatus(503);
});

//Error
app.use((err, req, res, next) => {
  console.log(err);
});

app.listen(PORT, function() {
  console.log(`App is listen on ${PORT}`);
});

module.exports = app;
