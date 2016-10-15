let BaseTransformstream = require('stream').Transform;

let RU_EN = {"А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ё":"Jo","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Shh","Ъ":"#","Ы":"Y","Ь":"'","Э":"Je","Ю":"Ju","Я":"Ja"};

class TransformStream extends BaseTransformstream {

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    var str = chunk.toString('utf8');
    var transformed = [];
    for (let i=0, size=str.length; i < size; ++i) {
      transformed.push((RU_EN[str[i]]) ? RU_EN[str[i]] : str[i]);
    }
    this.push(transformed.join(''));
    callback();
  }
}

// TODO: Why cant export default class
module.exports = TransformStream;

