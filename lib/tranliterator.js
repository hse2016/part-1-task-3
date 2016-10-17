const Transform = require('stream').Transform;

// Maps for transliterations
const TRANSLITERATION_MAP_TO_ENGLISH = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh',
  'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
  'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C',
  'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh', 'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je',
  'Ю': 'Ju', 'Я': 'Ja','а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e',
  'ё': 'jo', 'ж': 'zh','з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
  'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh', 'ъ': '#', 'ы': 'y',
  'ь': '\'', 'э': 'je', 'ю': 'ju', 'я': 'ja'
};

const TRANSLITERATION_MAP_TO_RUSSIAN = {
  'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Jo': 'Ё', 'Zh': 'Ж',
  'Z': 'З', 'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О',
  'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф', 'H': 'Х', 'C': 'Ц',
  'Ch': 'Ч', 'Sh': 'Ш', 'Shh': 'Щ', 'Y': 'Ы', 'Je': 'Э',
  'Ju': 'Ю', 'Ja': 'Я', 'W': 'Щ', 'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д',
  'e': 'е', 'jo': 'ё', 'zh': 'ж', 'z': 'з', 'i': 'и', 'j': 'й', 'k': 'к',
  'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с',
  't': 'т', 'u': 'у', 'f': 'ф', 'h': 'х', 'c': 'ц', 'ch': 'ч', 'sh': 'ш',
  'shh': 'щ', '#': 'ъ', 'y': 'ы', '\'': 'ь', 'je': 'э', 'ju': 'ю', 'ja': 'я', 'w': 'щ'
};

class TransformTransliterator extends Transform {
  constructor(options) {
    super(options);

    // for parts of string, which can be splitted in several chunks
    this._current = '';

    // flags of language. if nothing was set, then assume that no transliteration need.
    this._isRussian = false;
    this._isEnglish = false;

    // has correct transliteration map, which depends on language.
    this._map = null;

    // flags that indicates that json headers was transmitted.
    this._pre = false;
    this._post = false;
  }

  // Does transliteration..
  // It increments this._current with value of current symbol,
  // searches it in hashmap,
  // and transliterate if possible,
  // otherwise iteration will continue.
  _transformIfLanguageDeterminated(text) {
    let prev;
    let foundKey;
    let containsInMapFlag;
    let result = '';

    for (let i = 0; i < text.length; ++i) {
      prev = this._current;
      this._current += text[i];

      containsInMapFlag = false;
      for (var item in this._map) {
        if (item.indexOf(this._current) === 0) {
          containsInMapFlag = true;
          break;
        }
      }

      // make transliteration, if hashmap contains symbol
      if (! containsInMapFlag) {
        foundKey = null;
        for (let item in this._map) {
          if (item === prev) {
            foundKey = item;
          }
        }
        if (foundKey !== null) {
          result += this._map[foundKey];
        } else {
          result += prev;
        }
        prev = '';
        this._current = text[i];
      }
    }

    foundKey = null;
    for (let item in this._map) {
      if (item.indexOf(this._current) === 0) {
        foundKey = item;
      }
    }

    if (foundKey === null) {
      result += this._current;
      this._current = '';
    }

    return result;
  }

  // Determines language, which we should use when transliterate chunks.
  // If flag was set, doesn't change it.
  // If flag is not set and is not changed then assume that no transliteration need.
  _determineTargetLanguage(text) {
    if ((! this._isRussian) && (! this._isEnglish)) {
      this._isRussian = /[а-яА-Я]/.test(text);
      // only one of the flags will be set
      if (! this._isRussian) {
        this._isEnglish = /[a-zA-Z]/.test(text);
      }
    }
  }

  // Selects correct transliteration map, which depends on determinated language
  _selectDictionary() {
    if (this._isRussian) {
      this._map = TRANSLITERATION_MAP_TO_ENGLISH;
    } else if(this._isEnglish) {
      this._map = TRANSLITERATION_MAP_TO_RUSSIAN;
    }
  }

  // Writes heading json data.
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

  // Transformes
  _transform(chunk, encoding, callback) {
    let text = chunk.toString('utf-8');
    let result;

    // will not change language, if it was already determined
    this._determineTargetLanguage(text);
    this._selectDictionary();
    this._pushJSONPre();

    if (this._isRussian) {
      result = this._transformToEnglish(text);
    } else if(this._isEnglish) {
      result = this._transformToRussian(text);
    } else {
      result = this._passUntransformed(text);
    }

    // Escape all '
    this.push(result.replace(/'/g, "\'"));

    callback();
  }

  // Writes data which was not wrote and rites json taling data.
  _flush(callback) {
    if (this._isRussian || this._isEnglish) {
      let nya = null;
      let result = '';

      for (let item in this._map) {
        if (item === this._current) {
          nya = item;
        }
      }

      if (nya !== null) {
        result += this._map[nya];
      } else {
        result += this._current;
      }

      this.push(result);
    }

    // ends json data.
    this._pushJSONPost();

    // end of flush
    callback();
  }

  // transforms to english
  _transformToEnglish(text) {
    return this._transformIfLanguageDeterminated(text);
  }

  // transforms to russian
  _transformToRussian(text) {
    // replace all occurences
    text = text.replace(/Shh/g, 'Щ');
    text = text.replace(/Sh/g, 'Ш');
    text = text.replace(/Zh/g, 'Ж');
    text = text.replace(/Ch/g, 'Ч');
    text = text.replace(/Ja/g, 'Я');
    text = text.replace(/Jo/g, 'Ё');
    text = text.replace(/Ju/g, 'Ю');
    text = text.replace(/Je/g, 'Э');

    text = text.replace(/shh/g, 'щ');
    text = text.replace(/sh/g, 'ш');
    text = text.replace(/zh/g, 'ж');
    text = text.replace(/ch/g, 'ч');
    text = text.replace(/ja/g, 'я');
    text = text.replace(/jo/g, 'ё');
    text = text.replace(/ju/g, 'ю');
    text = text.replace(/je/g, 'э');

    return this._transformIfLanguageDeterminated(text);
  }

  // do nothing
  _passUntransformed(text) {
    return text;
  }
}

module.exports.TransformTransliterator = TransformTransliterator;

// vim: foldmethod=indent foldnestmax=1
