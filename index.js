;(function() {
  "use strict";

  // import
  const express = require('express');
  const fs = require('fs');

  // custom import
  const TransformStream = require('./transformStream');

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

  // log url
  app.use(function (req, res, next) {
    res.setHeader('X-Request-Url', req.method+' '+req.url);
    console.log('X-Request-Url:', req.method+' '+req.url);
    next();
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

  app.get(/\/v1\/(.*)/, function (req, res) {
    let args = req.params[0]; // 0
    // warn access
    if (args.indexOf('..') !== -1) {
      throw new Error();
    }
    console.log('args', args);
    let path = './' + args;
    if (fs.lstatSync(path).isDirectory()) { // is dir
      fs.readdir(path, function (err, items) {
        if (err) {
          throw new Error();
        }
        items.push('.');
        items.push('..');
        let context = {
          content: items,
        };
        res.send(context);
      });
    } else {
      let stream = fs.createReadStream(path),
          tstream = new TransformStream();

      stream.pipe(tstream).pipe(res);

      stream.on('error', function(err) {res.end(err);});
    }
  });

  app.get(/\/.*/, function (req, res) {
    throw new Error();
    // res.send('Test');
  });

  // log error
  app.use(function (error, req, res, next) {
    res.setHeader('X-Request-Error', "Unknown request");
    res.status(503).end();
  });

  module.exports = app;

})();
