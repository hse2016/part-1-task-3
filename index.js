'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

const IMAGE_ERROR_403 = 'http://t01.deviantart.net/LGMEna-IVYL1FNjkW8pAc7oJc1s=/fit-in/150x150/filters:no_upscale():origin()/pre09/2ee3/th/pre/f/2011/162/f/b/403_error_tan___uncolored_by_foxhead128-d3io641.png';
const MESSAGE_ERROR_403 = 'Forbidden';

var sendPage = function(response, statusCode, msg, src) {
  let html = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<title>Error </title>\n' +
    '</head>\n' +
    '<body>\n';

  if (typeof msg === 'string') {
    html += '<p>' + msg + '</p>';
  }

  if (typeof src === 'string') {
    html += '<img src="' + src + '"alt="">\n';
  }

  html += '</body>\n' +
    '</html>\n';

  response
    .status(statusCode)
    .send(html)
    .end();
};

var sendError403 = function(response) {
  sendPage(response, 403, MESSAGE_ERROR_403, IMAGE_ERROR_403);
};

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
  return /^authorize=/.test(cookie);
};

// cookie middleware
app.use(function(request, response, next) {
  let cookie = getCookie(request);

  // if not authorized, then error
  if ((cookie === null) || (! isAuthorized(cookie))) {
    sendError403(response);
    return;
  }

  // authorized
  next();
});

app.get('/', function(req, res) {
  res.status(200).end();
});


app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
