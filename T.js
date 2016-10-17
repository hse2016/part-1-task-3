/**
 * Created by tema on 12.10.16.
 */

var fs = require('fs');
var Transform = require('stream').Transform;

class T extends Transform {

    static get translitsRu() {
        return {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'jo', 'ж': 'zh', 'з': 'z',
            'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
            'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh',
            'ъ': '#', 'ы': 'y', 'ь': '\'', 'э': 'je', 'ю': 'ju', 'я': 'ja',

            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh', 'З': 'Z',
            'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
            'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
            'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja'
        };
    }

    static get translitsEN() {
        return {
            'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'И',
            'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Я', 'R': 'Р',
            'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'Щ', 'X': 'Х', 'Y': 'Ы', 'Z': 'З', '\'': 'ь',
            '#': 'ъ',

            'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и',
            'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'я', 'r': 'р',
            's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'щ', 'x': 'х', 'y': 'ы', 'z': 'з'

        };
    }

    static get additionalEn() {
        return {
            'Jo': 'Ё', 'Ju': 'Ю', 'Yo': 'Ё', 'Ch': 'Ч',
            'Ya': 'Я', 'Je': 'Э', 'Shh': 'Щ', 'Sh': 'Ш', 'Zh': 'Ж', 'Ja': 'Я',

            'JO': 'Ё', 'JU': 'Ю', 'YO': 'Ё', 'CH': 'Ч',
            'YA': 'Я', 'JE': 'Э', 'SHH': 'Щ', 'SH': 'Ш', 'ZH': 'Ж', 'JA': 'Я',

            'jo': 'ё', 'ju': 'ю', 'yo': 'ё', 'ch': 'ч',
            'ya': 'я', 'je': 'э', 'shh': 'щ', 'sh': 'ш', 'zh': 'ж', 'ja': 'я'
        }
    }


    constructor(options) {
        super(options);
        this.multi = false;
        this.type = 'utf8';
        this.defined = false;
        this.translits = undefined;
        this.lastChars = '';
        this.alreadyFlush = false;
    }

    setType(type) {
        this.type = type;
    }

    getStringAfterLastAdditionalChar(str) {

        let max = -1;
        let val = '';
        for(let i in T.additionalEn) {
            let ind = str.lastIndexOf(i);
            if (ind > max) {
                max = ind;
                val = i;
            }
        }

        if (max > -1){
            this.lastChars = str.slice(max + val.length);
            str = str.slice(0, max + val.length);
        }
        return str;
    }

    translit(str) {

        if (!this.defined) {
            let not_rus = isNoRussian(str);
            let not_en = isNoEnglish(str);

            if (not_en && !not_rus || !not_en && !not_rus && englishIndex(str) > russianIndex(str)) {
                this.translits = T.translitsRu;
                this.defined = true;
            }
            else if (not_rus && !not_en || !not_en && !not_rus && englishIndex(str) < russianIndex(str)) {
                this.translits = T.translitsEN;
                this.defined = true;

            }
        }

        if (this.translits) {

            // Только английские
            if(!this.translit['B']) {

                if (!this.flushing)
                    str = this.lastChars + str;

                this.lastChars = ''

                str = this.getStringAfterLastAdditionalChar(str);

            }

            for (let i in T.additionalEn) {
                str = str.replace(new RegExp(i, 'g'), T.additionalEn[i]);
            }

            for (let i in this.translits) {
                str = str.replace(new RegExp(i, 'g'), this.translits[i]);
            }

            // var new_str = '';
            // for (var i in str) {
            //     var char = this.translits[str[i]];
            //     if (char) {
            //         new_str += char;
            //     } else {
            //         new_str += str[i];
            //     }
            // }
        }

        return str;
    }

    _flush(callback) {

        this.flushing = true;
        let str = this.lastChars;

        if (this.type == 'base64') {
            str = str.toString('base64');
            this.push(str);
        }
        else {
            str = str.toString('utf8');
            let new_str = this.translit(str);
            this.push(new_str);
        }

        callback();
    }

    _transform(chunk, encoding, callback) {

        if (this.type == 'base64') {
            var str = chunk.toString('base64');
            this.push(str);
        }
        else {
            var str = chunk.toString('utf8');
            let new_str = this.translit(str);
            this.push(new_str);
        }

        callback();
    }
}

function

isNoRussian(str) {
    return (/[А-Я-Ё]/gi.test(str) ? false : true);
}

function

isNoEnglish(str) {
    return (/[A-Z]/gi.test(str) ? false : true);
}

function

englishIndex(str) {
    var res = /[A-Z]/gi.exec(str);
    return res.index;
}

function

russianIndex(str) {
    var res = /[А-Я-Ё]/gi.exec(str);
    return res.index;
}


module
    .exports = T; // TODO: kek

