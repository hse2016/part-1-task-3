'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
  req.requsetTime = Date.now();
  return next();
});

app.use((req, res, next) => {
  let cookies = req.headers.cookie;
  if (!cookies) {
    return next();
  }
  req.cookies = cookies
    .split('; ')
    .map(cookie => {
      let [key, value] = cookie.split('=');
      return {
        [key]: value
      };
    })
    .reduce((prev, cur) => Object.assign(prev, cur));
  return next();
});

app.use((req, res, next) => {
  res.append('X-Request-Url', req.method + ' ' + req.originalUrl);
  return next();
});

app.get('/', function(req, res) {
  res.append('X-Time', Date.now() - req.requsetTime);
  res.send('Hello, World!');
});

app.listen(PORT, function() {
  console.log(`App is listen on ${PORT}`);
});

module.exports = app;
