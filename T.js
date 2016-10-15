/**
 * Created by tema on 12.10.16.
 */

var fs = require('fs');
var Transform = require('stream').Transform;

class T extends Transform {

    static get translitsRu() {
        return {
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh', 'З': 'Z',
            'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
            'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
            'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja'
        };
    }

    static get translitsEN() {
        return {
            'A' : 'А', 'B' : 'Б', 'C' : 'Ц', 'D' : 'Д', 'E' : 'Е', 'F' : 'Ф', 'G' : 'Г', 'H' : 'Х', 'I' : 'И',
            'J' : 'Й', 'K' : 'К', 'L' : 'Л', 'M' : 'М', 'N' : 'Н', 'O' : 'О', 'P' : 'П', 'Q' : 'Я', 'R' : 'Р',
            'S' : 'С', 'T' : 'Т', 'U' : 'У', 'V' : 'В', 'W' : 'Щ', 'X' : 'Х', 'Y' : 'Ы', 'Z' : 'З', '\'': 'Ь'
        };
    }

    static get additionalEn() {
        return {
            'JO' : 'Ё', 'JU' : 'Ю', 'YO' : 'Ё', 'CH' : 'Ч',
            'YA' : 'Я', 'JE' : 'Э', 'SHH': 'Щ', 'SH' : 'Ш', 'ZH' : 'Ж'
        }
    }


    constructor(options) {
        super(options);
        this.multi = false;
        this.type = 'utf8';
        this.defined = false;
        this.translits = undefined;
    }

    setType(type) {
        this.type = type;
    }

    translit(str) {

        if(!this.defined) {
            let not_rus = isNoRussian(str);
            let not_en = isNoEnglish(str);

            if (not_en && !not_rus || !not_en && !not_rus && englishIndex(str) > russianIndex(str)) {
                this.translits = T.translitsRu;
                this.defined = true;
            }
            else if (not_rus && !not_en || !not_en && !not_rus && englishIndex(str) < russianIndex(str)) {
                this.translits = T.translitsEN;
                this.defined = true;

                for(let i in T.additionalEn) {
                    str = str.split(i).join(T.additionalEn[i]);
                }
            }
        }

        if (this.translits) {
            var new_str = '';
            for (var i in str) {
                var char = this.translits[str[i]];
                if (char) {
                    new_str += char;
                } else {
                    new_str += str[i];
                }
            }
        }

        return new_str;
    }

    _transform(chunk, encoding, callback) {

        if (this.type == 'base64') {
            var str = chunk.toString('base64').toUpperCase();
            this.push(str);
        }
        else {
            var str = chunk.toString('utf8').toUpperCase();
            let new_str = this.translit(str);
            this.push(new_str);
        }

        callback();
    }
}

function isNoRussian(str) {
    return (/[А-Я-Ё]/gi.test(str) ? false : true);
}
function isNoEnglish(str) {
    return (/[A-Z]/gi.test(str) ? false : true);
}
function englishIndex(str) {
    var res = /[A-Z]/gi.exec(str);
    return res.index;
}
function russianIndex(str) {
    var res = /[А-Я-Ё]/gi.exec(str);
    return res.index;
}


module.exports = T; // TODO: kek

