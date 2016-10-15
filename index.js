'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log(`App is listen on ${PORT}`);
});

// add cookies
app.use(function (req, res, next) {
  let cookiesString = (req.headers.cookie) ? req.headers.cookie : "",
      cookies = {}, _;
  let cookiesList = cookiesString.split(';');
  for (let i=0, size=cookiesList.length; i < size; ++i) {
    _ = cookiesList[i].split('=');
    cookies[_[0]] = _[1];
  }
  req.cookies = cookies;
  console.log('Got request. find cookies.', req.cookies);
  next();
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
