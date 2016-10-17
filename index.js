'use strict';

const express = require('express');
const app = express();
const fs = require('fs');

const PORT = process.env.PORT || 4000;

function authorize(){}
app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});
var engCh = ['A','B','V','G','D','E','Jo','Zh','Z','I','J','K','L','M','N','O','P','R','S','T','U','F','H','C','Ch','Sh','Shh','##','Y','"','Je','Ju','Ja',
             'a','b','v','g','d','e','jo','zh','z','i','j','k','l','m','n','o','p','r','s','t','u','f','h','c','ch','sh','shh','#','y',''','je','ju','ja'];
var rusCh = ['А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я',
             'а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'];


app.use(function(error, req, res, next){
    res.setHeader('error', error.toString());
    res.status(503).end();
});
// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
