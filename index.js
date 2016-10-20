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

  // IMPORTANT. Это строка должна возвращать инстанс сервера

  // views

  app.get(/\/v1\/(.*)/, function (req, res) {
    let path = simplifyPath(req.params[0]); // 0
    // warn access
    if (path === undefined) {
      throw new Error();
    }
    path = './' + path;

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

      res.setHeader('Content-Type', 'application/json');
      console.log(typeof res);
      stream.pipe(tstream).pipe(res);

      // stream.on('error', function(err) {res.end(err);});
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

  // add path check
  function simplifyPath(path) {
    let newPath = [];
    path = path.split('/');
    let depth = 0;
    for (let i=0, size=path.length; i < size; ++i) {
      if (path[i] === '..') {
        if (depth <= 0)
          return undefined;
        depth -= 1;
        newPath.pop();
      } else {
        depth += 1;
        newPath.push(path[i]);
      }
    }
    return newPath.join('/');
  }

  function isAuthorized(request) {
    return !!(request && request.cookies && request.cookies.authorize);
  }

  module.exports = app;

})();
