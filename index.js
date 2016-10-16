'use strict';

const express = require('express');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});

// logging start time
app.use((request, response, next) => {
    request.timing = process.hrtime();
    next();
});

// log request
app.use((request, response, next) => {
    response.setHeader("X-Request-Url", request.method + " " + request.url);
    next();
});

// handle request url errors
app.use((request, response, next) => {
    if (!request.url.includes("/v1/")) {
        response.setHeader("X-Request-Error", "Unknown request");
        response.status(503);
    }

    next();
});

// authorization
app.use((request, response, next) => {
    let authorizeValue = JSON.stringify(request.headers.cookie);

    if (authorizeValue == undefined || !authorizeValue.includes("authorize"))
        response.status(403);

    next();
});


// logging finish time
app.use((request, response, next) => {
    response.setHeader("X-Time", parseFloat(process.hrtime(request.timing)[1] / 1000000, 10));
    next();
});

// just display hello world
app.get('*', (request, response, next) => {
    fs.readdir(__dirname + request.url.substring(3), (err, files) => {
        var upperDirectories = __dirname.split("/");
        let dirname = upperDirectories[upperDirectories.length - 1];

        if (files !== undefined && files.indexOf(dirname) == -1) {
            console.log(__dirname);
            files.unshift('.', '..');
            response.send({"content": files});
        }
        else {
            console.log("entered");
            next();
        }
    });
}, (req, res) => {
        res.setHeader("X-Request-Error", "Unknown request");
        res.status(503).send();
    });

// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
