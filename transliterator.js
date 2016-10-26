const Transform = require('stream').Transform;

const rus = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
    'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja'
};

(function () {
    for (let key in rus) {
        rus[key.toLowerCase()] = rus[key].toLowerCase();
    }
})();

const en = {
    'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф',
    'G': 'Г', 'H': 'Х', 'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л',
    'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Я', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'Щ', 'X': 'Х',
    'Y': 'Ы', 'Z': 'З', '\'': 'ь', '#': 'ъ'
};

const enSpecial = {
    'Jo': 'Ё', 'Yo': 'Ё', 'Ju': 'Ю', 'Yu': 'Ю', 'Ja': 'Я', 'Ya': 'Я',
    'Je': 'Э', 'Sh': 'Ш', 'Zh': 'Ж', 'Ch': 'Ч'
};

const enShh = ['shh', 'Shh', 'SHh', 'SHH', 'ShH'];

(function () {
    for (let key in enSpecial) {
        enSpecial[key.toLowerCase()] = enSpecial[key].toLowerCase();
        enSpecial[key.toUpperCase()] = enSpecial[key].toUpperCase();
    }
})();

(function () {
    for (let key in en) {
        en[key.toLowerCase()] = en[key].toLowerCase();
    }
})();

class Transliterator extends Transform {
    constructor(options, lang) {
        super(options);
        if (lang === 'en') {
            this.dictionary = en;
            this.dictionaryName = 'en';
        } else if (lang === 'rus') {
            this.dictionary = rus;
            this.dictionaryName = 'rus';
        }
        this._alreadyBeg = false;
        this._alreadyEnd = false;
    }

    _transform(chunk, encoding, callback) {
        let str = chunk.toString('utf8');
        let formatted = '';
        if (!this._alreadyBeg) {
            this.push('{"content": "');
        }
        for (let i = 0; i < str.length; i++) {
            if (!this.dictionary) {
                if (str[i] in rus) {
                    this.dictionary = rus;
                    this.dictionaryName = 'rus';
                } else if (str[i] in en) {
                    this.dictionary = en;
                    this.dictionaryName = 'en';
                }
            }
            if (this.dictionaryName === 'en') {
                if ((i < str.length - 2) && (enShh.indexOf(str[i] + str[i + 1] + str[i + 2]) !== -1)) {
                    formatted += (str[i] === 's') ? 'щ' : 'Щ';
                    i += 2;
                } else {
                    if ((i < str.length - 1) && ((str[i] + str[i + 1]) in enSpecial)) {
                        formatted += enSpecial[str[i] + str[i + 1]];
                        i += 1;
                    } else {
                        if (str[i] in this.dictionary) {
                            formatted += this.dictionary[str[i]];
                        } else {
                            formatted += str[i];
                        }
                    }
                }
            } else if (this.dictionary && str[i] in this.dictionary) {
                formatted += this.dictionary[str[i]];
            } else {
                formatted += str[i];
            }
        }
        this.push(formatted.replace(/"/g, '\"'));
        callback();
    }

    _flush(callback) {
        if (! this._alreadyEnd) {
            this.push('"}');
        }

        callback();
    }
}

module.exports = Transliterator;