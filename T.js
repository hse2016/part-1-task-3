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
            'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Jo': 'Ё', 'Zh': 'Ж', 'Z': 'З',
            'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'R': 'Р',
            'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф', 'H': 'Х', 'C': 'Ц', 'Ch': 'Ч', 'Sh': 'Ш', 'Shh': 'Щ',
            '#': 'Ъ', 'Y': 'Ы', '\'': 'Ь', 'Je': 'Э', 'Ju': 'Ю', 'Ja': 'Я'
        };
    }


    constructor(options) {
        super(options);
        this.multi = false;
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8').toUpperCase();

        let translits;
        if (isNoEnglish(str))
            translits = T.translitsRu;
        else if (isNoRussian(str))
            translits = T.translitsEN;


        if (translits) {

            var new_str = '';
            for (var i in str) {
                var char = translits[str[i]];
                if (char) {
                    new_str += char;
                } else {
                    new_str += str[i];
                }
            }
        }


        this.push(new_str);
        callback();
    }
}

function isNoRussian(str) {
    return (/[А-Я-Ё]/gi.test(str) ? false : true);
}
function isNoEnglish(str) {
    return (/[A-Z]/gi.test(str) ? false : true);
}

module.exports = T; // TODO: kek

