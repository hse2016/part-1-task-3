'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

function authorize(){}
app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

app.use(function(error, req, res, next){
    res.setHeader('error', error.toString());
    res.status(503).end();
});
// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
