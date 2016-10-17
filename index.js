'use strict';

const express = require('express');
const app = express();
const fs = require('fs');
const authorize = 'authorize';

const PORT = process.env.PORT || 4000;

var engCh = ['A','B','V','G','D','E','Jo','Zh','Z','I','J','K','L','M','N','O','P','R','S','T','U','F','H','C','Ch','Sh','Shh','##','Y','"','Je','Ju','Ja',
             'a','b','v','g','d','e','jo','zh','z','i','j','k','l','m','n','o','p','r','s','t','u','f','h','c','ch','sh','shh','#','y',''','je','ju','ja'];
var rusCh = ['А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я',
             'а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'];



function authorize(){}
app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

app.use((req, res, next) => {
  var matches = req.headers.cookie.match(new RegExp(
    "(?:^|; )" + authorize.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  var cookies;
  cookies = matches ? decodeURIComponent(matches[1]) : undefined;

  if(cookies !== undefined && cookies !== ""){
    next();
  }

  if (!req.headers.cookie){
        res.sendStatus(403);
        return;
    }
  });

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
