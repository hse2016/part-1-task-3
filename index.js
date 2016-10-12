'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

function getCookie(req){
    if (req === null || req === undefined) return false;
    var pattern = RegExp('authorize' + "=.[^;]*");
    var matched = req.match(pattern);
    return matched;
}

app.use('/', function (req, res) {
    console.log(req.headers.cookie)
    if (getCookie(req.headers.cookie)) {
        res.status(200).end();
    } else {
        res.status(403).end();
    }
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
