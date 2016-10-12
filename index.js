'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

const IMAGE_ERROR_403 = 'http://t01.deviantart.net/LGMEna-IVYL1FNjkW8pAc7oJc1s=/fit-in/150x150/filters:no_upscale():origin()/pre09/2ee3/th/pre/f/2011/162/f/b/403_error_tan___uncolored_by_foxhead128-d3io641.png';
const MESSAGE_ERROR_403 = 'Forbidden';

var sendNyaError = function(response, src, msg) {
  response.send(
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
      '<meta charset="UTF-8">\n' +
      '<title>Error :(</title>\n' +
    '</head>\n' +
    '<body>\n' +
      '<img src="' + src + '"alt="">\n' +
      '<p>' + msg + '</p>' +
    '</body>\n' +
    '</html>\n'
  );
};

var sendError403 = function(response) {
  sendNyaError(response, IMAGE_ERROR_403, MESSAGE_ERROR_403);
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
  return /^authorized=.*/.test(cookie);
};

// cookie middleware
app.use(function(request, response, next) {
  let cookie = getCookie(request);

  // if not authorized, then error
  if ((cookie === null) || (! isAuthorized(cookie))) {
    response.status(403);
    sendError403(response);
    response.end();
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
