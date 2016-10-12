'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.use(function(request, response, next) {
  console.log(request);
  next();
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
