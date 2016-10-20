let BaseTransformstream = require('stream').Transform;

// let RU_EN = {"А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ё":"Jo","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Shh","Ъ":"#","Ы":"Y","Ь":"'","Э":"Je","Ю":"Ju","Я":"Ja"};
let RU_EN = {
  "А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ё":"Jo","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Shh","Ъ":"#","Ы":"Y","Ь":"'","Э":"Je","Ю":"Ju","Я":"Ja",
  "A":"А","B":"Б","V":"В","G":"Г","D":"Д","E":"Е","Jo":"Ё","Zh":"Ж","Z":"З","I":"И","J":"Й","K":"К","L":"Л","M":"М","N":"Н","O":"О","P":"П","R":"Р","S":"С","T":"Т","U":"У","F":"Ф","H":"Х","C":"Ц","Ch":"Ч","Sh":"Ш","Shh":"Щ","#":"ъ","Y":"Ы","'":"ь","Je":"Э","Ju":"Ю","Ja":"Я",
  "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"jo","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"shh","ъ":"#","ы":"y","ь":"'","э":"je","ю":"ju","я":"ja",
  "a":"а","b":"б","v":"в","g":"г","d":"д","e":"е","jo":"ё","zh":"ж","z":"з","i":"и","j":"й","k":"к","l":"л","m":"м","n":"н","o":"о","p":"п","r":"р","s":"с","t":"т","u":"у","f":"ф","h":"х","c":"ц","ch":"ч","sh":"ш","shh":"щ","y":"ы","je":"э","ju":"ю","ja":"я",
  "+":"+","!":"!","@":"@","$":"$","%":"%","^":"^","&":"&","*":"*","(":"(",")":")","_":"_"
};
class TransformStream extends BaseTransformstream {

  constructor(options) {
    super(options);
    this.firstChunk = true;
    this.tail = '';
  }

  _transform(chunk, encoding, callback) {
    var str = this.tail + chunk.toString('utf8');
    // console.log(str);
    // console.log(str);
    var transformed = [];
    let letter = '';
    let i = 0, size = str.length;
    for (; i + 5 < size; ++i) {
      letter = str[i];
      while (i < size && RU_EN[letter + str[i+1]]) {
        letter += str[i+1];
        ++i;
      }
      if (RU_EN[letter]) {
        transformed.push(RU_EN[letter]);
      } else {
        transformed.push(letter);
      }
    }
    this.tail = str.slice(i, size);
    str = transformed.join('').replace('\n', '\\n').replace('"', '\\"');
    if (this.firstChunk) {
      str = '{"content":"'+str;
      this.firstChunk = false;
    }
    this.push(str);
    callback();
  }

  _flush(callback) {
    let str = this.tail, i = 0, letter = '', transformed = [];
    for (let size=str.length; i < size; ++i) {
      letter = str[i];
      while (i < size && RU_EN[letter + str[i+1]]) {
        letter += str[i+1];
        ++i;
      }
      if (RU_EN[letter]) {
        transformed.push(RU_EN[letter]);
      } else {
        transformed.push(letter);
      }
    }
    str = transformed.join('').replace('\n', '\\n').replace('"', '\\"');
    if (this.firstChunk) {
      str = '{"content":"'+str;
      this.firstChunk = false;
    }
    this.push(str+'"}');
    callback();
  }
}

// TODO: Why cant export default class
module.exports = TransformStream;

