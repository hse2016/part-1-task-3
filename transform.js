const Transform = require('stream').Transform;

class Translit extends Transform {
    constructor(options) {
        super(options);
    }

    _transform(data, encoding, callback) {
        console.log('!', data.toString('utf-8'));
        this.push('{"content": ' + data.toString('utf-8') + '}');
        callback();
    };
}

module.exports = Translit;
