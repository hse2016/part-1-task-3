'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

var getCookie = function(request) {
  if (! (request.hasOwnProperty('headers'))) {
    return null;
  }

  if (! (request.headers.hasOwnProperty('cookie'))) {
    return null;
  }

  if (request.headers.cookie === '') {
    return null;
  }

  return request.headers.cookie;
};

app.use(function(request, response, next) {
  console.log(request.headers);
  next();
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
