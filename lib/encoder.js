const Transform = require('stream').Transform;

class Base64EncoderTransformStream extends Transform {
  constructor(options) {
    super(options);
  }
  _transform(chunk, encoding, callback) {
    this._pushJSONPre();
    this.push(chunk.toString('base64'));
    callback();
  }

  _flush(callback) {
    // ends json data.
    this._pushJSONPost();

    // end of flush
    callback();
  }

  _pushJSONPre() {
    if (! this._pre) {
      this.push('{"content": "');
      this._pre = true;
    }
  }

  // Writes taling json data.
  _pushJSONPost() {
    if (! this._post) {
      this.push('"}');
      this._post = true;
    }
  }
}

exports.Base64EncoderTransformStream = Base64EncoderTransformStream;
