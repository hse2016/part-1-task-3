'use strict';

const express = require('express');
const app = express();

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
  res.send('OK');
});

app.listen(PORT, function() {
  console.log(`App is listen on ${PORT}`);
});

module.exports = app;
