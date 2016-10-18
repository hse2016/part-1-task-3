'use strict';

const express = require('express');
const app = express();
const fs = require('fs');
const authorize = 'authorize';
const TransformStream = require('stream').Transform;

const PORT = process.env.PORT || 4000;

const engCh = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
    'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'jo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh',
    'ъ': '#', 'ы': 'y', 'ь': '\'', 'э': 'je', 'ю': 'ju', 'я': 'ja'};
const rusCh = {
    'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'И',
    'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Я', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'Щ', 'X': 'Х', 'Y': 'Ы', 'Z': 'З',
    'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и',
    'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'я', 'r': 'р',
    's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'щ', 'x': 'х', 'y': 'ы', 'z': 'з', '\'': 'ь'
};

app.use((req, res, next) => {
   req.startAt = process.hrtime();
   next();
  });

app.use((req, res, next) => {//urls
    let method_url = req.method + ' ' + req.originalUrl;
    res.setHeader('X-Request-Url', method_url);
    console.log('X-Request-Url: ', method_url);
    next();
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});
var cookies;
app.use((req, res, next) => {
  var matches = req.headers.cookie.match(new RegExp(
    "(?:^|; )" + authorize.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));

  cookies = matches ? decodeURIComponent(matches[1]) : undefined;

  if(cookies !== undefined && cookies !== ""){
    next();
  }

  if (!req.headers.cookie){
        res.sendStatus(403);
        return;
    }
  });

  class TextTransform extends TransformStream{
    let toRus;
    let toEng;
    var str;
    constructor() {
      if (/[А-я]/.i.test(cookies)) {
        toRus = false;
        toEng = true;
      }
      else {
        toRus = true;
        toEng = false;
      }
      transformation();
    }
    function transformation(cookies, toRus, toEng){
      if(toRus && !toEng){
        var replacer = function(a) {return engCh[a]||a};
        str = cookies.replace(/[A-z]/g, replacer);
      }
      else if (!toRus && toEng) {
        var replacer = function(a) {return engCh[a]||a};
        str = cookies.replace(/[А-я]/g, replacer);
      }
      else {
        str = null;
      }
      console.log(cookies, str);
    }
  }

  app.use((req, res, next) => {
    var time = process.hrtime(req.startAt);
    time = (time[1] / 1000).toFixed(3);
    res.setHeader('X-Time', time);
    res.status(200);
    next();
});

app.use(function(error, req, res, next){
    res.setHeader('X-Request-Error', error.toString());
    res.status(503).end();
});
// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
