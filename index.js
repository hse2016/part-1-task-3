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

var isAuthorized = function(cookie) {
  return /^authorized=.*/.test(cookie);
};

// cookie middleware
app.use(function(request, response, next) {
  let cookie = getCookie(request);

  // if not authorized, then error
  if (! isAuthorized(cookie)) {
    res.end(403, {error: 'Not authorized'});
    return;
  }

  // authorized
  next();
});

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
