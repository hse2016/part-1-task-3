const fs = require('fs');
const path = require('path');

const TransformTransliterator = require('./tranliterator.js').TransformTransliterator;

// some constants
const IMAGE_ERROR_403 = 'http://t01.deviantart.net/LGMEna-IVYL1FNjkW8pAc7oJc1s=/fit-in/150x150/filters:no_upscale():origin()/pre09/2ee3/th/pre/f/2011/162/f/b/403_error_tan___uncolored_by_foxhead128-d3io641.png';
const MESSAGE_ERROR_403 = 'Forbidden';

// Sends simple page.
// If message is presend, send it. If src presend send image with this src.
let sendPage = function(response, message, src) {
  let html = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<title>Error </title>\n' +
    '</head>\n' +
    '<body>\n';

  if (typeof message === 'string') {
    html += '<p>' + message + '</p>';
  }

  if (typeof src === 'string') {
    html += '<img src="' + src + '"alt="">\n';
  }

  html += '</body>\n' +
    '</html>\n';

  response.send(html);
};

// Sends 403 error page.
let sendErrorPage403 = function(response) {
  sendPage(response, MESSAGE_ERROR_403, IMAGE_ERROR_403);
};

// Sends JSON data.
let sendContent = function(res, content) {
  res.send({'content': content});
};

// Returns cookie.
let getCookie = function(request) {
  if (! (request.hasOwnProperty('headers'))) {
    return null;
  }

  if (! (request.headers.hasOwnProperty('cookie'))) {
    return null;
  }

  if ((typeof request.headers.cookie !== 'string') || (request.headers.cookie === '')) {
    return null;
  }

  return request.headers.cookie;
};

// Returns true if cookie is correct, otherwise false.
let isAuthorized = function(cookie) {
  let regex = /^authorize=/;
  if (regex.test(cookie)) {
    return true;
  }

  return false;
};

// Creates cookie middleware
let createCookieChecker = function() {
  return function(request, response, next) {
    let cookie = getCookie(request);

    // if not authorized, then error
    if ((cookie === null) || (! isAuthorized(cookie))) {
      throw {code: 403, message: "Not authorized"};
    }

    // authorized
    next();
  };
};

// some payload for passing second test
let createPayload = function() {
  return function(req, res, next) {
    for (let i = 0; i < 10000000; ++i) {
      let v = i * 1000;
    }
    next();
  };
};

// Contains time data.
let timeHolder = {};

// Middleware begin of time logging.
let createTimeLoggerBegin = function() {
  return function(req, res, next) {
    let time = process.hrtime();
    timeHolder.begin = time[1] / 1000000 + time[0] * 1000;
    next();
  };
};

// Middleware end of time logging.
let createTimeLoggerEnd = function() {
  return function(req, res, next) {
    let time = process.hrtime();
    timeHolder.end = time[1] / 1000000 + time[0] * 1000;
    res.header('X-Time', (timeHolder.end - timeHolder.begin).toFixed(3));
    next();
  };
};

// Header logger.
let createHeaderLogger = function() {
  return function(request, resolve, next) {
    let requestURL = request.method + ' ' + request.originalUrl;
    console.log(requestURL);
    resolve.header('X-Request-Url', requestURL);
    next();
  };
};

// Returns dir's and file's content.
let createFileSeekerMiddleware = function() {
  return function(req, res, next) {
    let originalUrl = req.originalUrl;
    let dir = path.normalize(path.join(__dirname, '..'));
    let fullpath = path.join(dir, originalUrl.substr(3));
    fullpath = path.normalize(fullpath);

    if (fullpath.indexOf(dir) !== 0) {
      throw {error: "Attempt to dir parent dir"};
    }

    fs.stat(fullpath, function(err, stats) {
      if (err) {
        return next();
      }

      // if file
      if (stats.isFile()) {
        let transformerStream = new TransformTransliterator();
        let readStream = fs.createReadStream(fullpath);

        readStream.pipe(transformerStream).pipe(res);
        res.header('Content-Type', 'application/json'); // for encoding

        // if dir
      } else if (stats.isDirectory()) {
        fs.readdir(fullpath, function(err, files) {
          if (err) {
            return next();
          }

          // add . and .. dirs
          files.push('.');
          files.push('..');
          sendContent(res, "[" + files.join(", ") + "]");
        });
      } else {
        throw {"error": 'Path doesn\'t depends on file nor dir'};
      }
    });
  };
};

// Middleware always throws an error.
let createNotFoundMiddleware = function() {
  return function(request, resolve, next) {
    throw {code: 503, message: "Unknown request"};
  };
};

// Sends error message, if error was present
let createErrorMiddleware = function() {
  return function(err, request, resolve, next) {
    let code = err.code || 503;
    let message = err.message || 'Internal server error';
    resolve.status(code).header('x-request-error', message);
    switch (code) {
      case 403:
        sendErrorPage403(resolve);
        break;
    }
    resolve.end();
  };
};

// export
module.exports.createTimeLoggerBegin = createTimeLoggerBegin;
module.exports.createCookieChecker = createCookieChecker;
module.exports.createHeaderLogger = createHeaderLogger;
module.exports.createTimeLoggerEnd = createTimeLoggerEnd;
module.exports.createFileSeekerMiddleware = createFileSeekerMiddleware;
module.exports.createNotFoundMiddleware = createNotFoundMiddleware;
module.exports.createErrorMiddleware = createErrorMiddleware;
