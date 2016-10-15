'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
  console.log(`App is listen on ${PORT}`);
});

// log request time
app.use(function(req, res, next) {
  req.requestTime = new Date().getTime();
  next();
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

// check authorized
app.use(function (req, res, next) {
  if (isAuthorized(req)) {
    next();
    return;
  }
  res.sendStatus(403);
});

// log time
app.use(function (req, res, next) {
  let date = new Date();
  let time = date.getTime() - req.requestTime + 1;
  res.setHeader('X-Time', time);
  console.log('X-Time=' + time);
  next();
});

function isAuthorized(request) {
  return !!(request && request.cookies && request.cookies.authorize);
}

// IMPORTANT. Это строка должна возвращать инстанс сервера

// views
app.get('/v1/', function (req, res) {
    res.send('Test');
});

module.exports = app;
