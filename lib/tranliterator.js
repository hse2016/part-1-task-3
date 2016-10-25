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

const TRANSLITERATION_EXTENDED_MAP_TO_ENGLISH = {
};

const TRANSLITERATION_EXTENDED_MAP_TO_RUSSIAN = {
  'Shh': 'Щ', 'shh': 'щ', 'jo': 'ё', 'je': 'э', 'ju': 'ю', 'ja': 'я', 'Ju': 'Ю',
  'zh':  'ж',  'Zh': 'Ж', 'Je': 'Э', 'Sh': 'Ш', 'Ch': 'Ч', 'Jo': 'Ё', 'Ja': 'Я',
  'ch':  'ч',  'sh': 'ш'
};

const TRANSLITERATION_MAP_TO_RUSSIAN = {
  'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Z': 'З',
  'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О',
  'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф', 'H': 'Х',
  'C': 'Ц', 'Y': 'Ы', 'W': 'Щ', 'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г',
  'd': 'д', 'e': 'е', 'z': 'з', 'i': 'и', 'j': 'й', 'k': 'к', 'l': 'л',
  'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т',
  'u': 'у', 'f': 'ф', 'h': 'х', 'c': 'ц', '#': 'ъ', 'y': 'ы', "'": 'ь',
  'w': 'щ'
};

class TransformTransliterator extends Transform {
  constructor(options) {
    super(options);

    // for parts of string, which can be splitted in several chunks
    this._current = '';

    // flags of language. if nothing was set, then assume that no transliteration need.
    this._isRussian = false;
    this._isEnglish = false;

    // flags that indicates that json headers was transmitted.
    this._pre = false;
    this._post = false;
  }

  // Does transliteration..
  // It increments this._current with value of current symbol,
  // searches it in hashmap,
  // and transliterate if possible,
  // otherwise iteration will continue.
  _transformIfLanguageDeterminated(baseText, map, extendedMap) {
    if ((! this._isEnglish) && (! this._isRussian)) {
      return baseText;
    }
    let text = this._current + baseText;

    this._current = this._getNextChunkData(text, extendedMap);
    if (this._current.length > 0) {
      text = text.substr(0, text.length - this._current.length);
    }

    for (let item in extendedMap) {
      let regex = new RegExp(item, 'g');
      text = text.replace(regex, extendedMap[item]);
    }

    for (let item in map) {
      let regex = new RegExp(item, 'g');
      text = text.replace(regex, map[item]);
    }

    return text;
  }

  _getNextChunkData(str, extendedMap) {
    let ret = '';
    let sub = '';
    let end = false;
    let ind = 1;

    while (true) {
      ret = sub;
      sub = str.substr(str.length - ind);
      end = true;

      for (let item in extendedMap) {
        if (item.indexOf(sub) !== -1) {
          end = false;
        }
      }

      if (end) {
        break;
      }

      ind += 1;
    }

    for (let item in extendedMap) {
      if (item.length > ret.length && item.indexOf(ret) === 0) {
        return ret;
      }
    }
    return '';
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
      this._extendedMap = TRANSLITERATION_EXTENDED_MAP_TO_ENGLISH;
    } else if(this._isEnglish) {
      this._map = TRANSLITERATION_MAP_TO_RUSSIAN;
      this._extendedMap = TRANSLITERATION_EXTENDED_MAP_TO_RUSSIAN;
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

  // Transforms
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
    // ends json data.
    this._pushJSONPost();

    // end of flush
    callback();
  }

  // transforms to english
  _transformToEnglish(text) {
    return this._transformIfLanguageDeterminated(
      text,
      TRANSLITERATION_MAP_TO_ENGLISH,
      TRANSLITERATION_EXTENDED_MAP_TO_ENGLISH
    );
  }

  // transforms to russian
  _transformToRussian(text) {
    return this._transformIfLanguageDeterminated(
      text,
      TRANSLITERATION_MAP_TO_RUSSIAN,
      TRANSLITERATION_EXTENDED_MAP_TO_RUSSIAN
    );
  }

  // do nothing
  _passUntransformed(text) {
    return text;
  }
}

module.exports.TransformTransliterator = TransformTransliterator;

// vim: foldmethod=indent foldnestmax=1
