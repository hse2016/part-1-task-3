const fs = require('fs');
const fsExtra = require('fs-extra');

module.exports = {
    rndDir: () => {
        let resp = {
            create: () => {
                return new Promise((resolve, reject) => {
                    fs.mkdtemp('./tmp-', (err, folder) => {
                        if (err) {
                            return reject(err);
                        }
                        resp.dirName = folder;
                        resolve();
                    });
                });
            },

            remove: () => {
                return new Promise((resolve, reject) => {
                    if (!resp.dirName) {
                        return reject('no dir');
                    }
                    fsExtra.remove(resp.dirName, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                });
            },

            dirName: null
        };

        return resp;
    },

    rndFile: (dir, text) => {
        let filename = '/' + rndName();
        let resp = {
            create: () => {
                return new Promise((resolve, reject) => {
                    fs.writeFile(dir + filename, text || 'test', (err) => {
                        if (err) {
                            return reject(err);
                        }

                        resp.filename = dir + filename;
                        resolve();
                    });
                });
            },
            remove: () => {
                return new Promise((resolve, reject) => {
                    if (!resp.filename) {
                        return reject('no file');
                    }
                    fsExtra.remove(resp.filename, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                });
            },
            filename: null
        };

        return resp;

    },

    fileParser: (res, callback) => {
        res.setEncoding('utf-8');
        res.data = '';
        res.on('data', function (chunk) {
            res.data += chunk;
        });
        res.on('end', function () {
            callback(null, res.data);
        });
    }
};

function rndName() {
    return 'file' + String(Math.random()).slice(2);
}
