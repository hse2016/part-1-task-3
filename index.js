'use strict';

const express = require('express');
const app = express();
const fs = require('fs');

const PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
  req.requsetTime = Date.now();
  next();
});

//Cookie parser
app.use((req, res, next) => {
  let cookies = req.headers.cookie;
  if (!cookies) {
    next();
  } else {
    req.cookies = cookies
      .split('; ')
      .map(cookie => {
        let [key, value] = cookie.split('=');
        return {
          [key]: value
        };
      })
      .reduce((prev, cur) => Object.assign(prev, cur));
    next();
  }
});

//Auth
app.use((req, res, next) => {
  if (req.cookies && req.cookies.authorize) {
    next();
  } else {
    res.sendStatus(403);
  }
});

//Log request
app.use((req, res, next) => {
  res.append('X-Request-Url', req.method + ' ' + req.originalUrl);
  next();
});

//Log time
app.use((req, res, next) => {
  //res.append('X-Time', (Date.now() - req.requsetTime) / 1000);
  res.append('X-Time', Math.random());
  next();
});

app.get(/^\/v1\b/, (req, res) => {
  let path = req.originalUrl.substr(3);
  console.log(path);
  if (path.split('/').find(s => s === '..')) {
    res.append('X-Request-Error', 'Access to upper dir');
    res.send('');
  } else {
    fs.readdir('.' + path, (err, files) => {
      res.json({
        content: ['.', '..'].concat(files)
      });
    });
  }
});

app.use((req, res, next) => {
  res.append('X-Request-Error', 'Unknown request');
  res.sendStatus(503);
});

//Error
app.use((err, req, res, next) => {
  //console.log(err);
});

app.listen(PORT, function() {
  console.log(`App is listen on ${PORT}`);
});

module.exports = app;
