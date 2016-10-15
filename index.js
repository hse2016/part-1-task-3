'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

function getCookie(req) {
    let list = {};
    let cookies = req.headers.cookie;

    cookies && cookies.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

app.use(function (req, res, next) {
    var cookies = getCookie(req);

    if (cookies['authorize']) {
        next();
        res.end();

    } else {
        res.sendStatus(403).end();
    }

});
// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
