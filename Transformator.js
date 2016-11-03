/**
 * Created by emilfataliev on 03.11.16.
 */
const Transform = require('stream').Transform;

class Transformator extends Transform {

    constructor(options) {
        super(options);
        this.current_str = "";
    }


    _transform(chunk, callback) {
        var str = chunk.toString('utf8');
        var new_str = this.translit(str);
        this.current_str = new_str;
        this.push(new_str);
        callback();
    }

    translit(string) {
        if (isRus(string))
            for (let symbol in rus_to_eng) {
                string = string.replace(new RegExp(symbol, 'g'), rus_to_eng[symbol]);
            }
        string = '{ "content" : "' + string;

        return string;

    }

    _flush(callback) {

        let str = this.current_str;
        str = str.toString('utf8');
        let new_str = this.translit(str);
        this.push(new_str + '"}');


        callback();
    }

}
const rus_to_eng = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
    'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'jo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh',
    'ъ': '#', 'ы': 'y', 'ь': '\'', 'э': 'je', 'ю': 'ju', 'я': 'ja'
};

const additional_eng = {
    'JO': 'Ё', 'JU': 'Ю', 'YO': 'Ё', 'CH': 'Ч',
    'YA': 'Я', 'JE': 'Э', 'SHH': 'Щ', 'SH': 'Ш', 'ZH': 'Ж',
    '#': 'ъ',
    'jo': 'ё', 'ju': 'ю', 'yo': 'ё', 'ch': 'ч',
    'ya': 'я', 'je': 'э', 'shh': 'щ', 'sh': 'ш', 'zh': 'ж', 'ja': 'я',
    'Jo': 'Ё', 'Ju': 'Ю', 'Yo': 'Ё', 'Ch': 'Ч',
    'Ya': 'Я', 'Je': 'Э', 'Shh': 'Щ', 'Sh': 'Ш', 'Zh': 'Ж'
};

const eng_to_rus = {
    'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'И',
    'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Я', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'Щ', 'X': 'Х', 'Y': 'Ы', 'Z': 'З',

    'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и',
    'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'я', 'r': 'р',
    's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'щ', 'x': 'х', 'y': 'ы', 'z': 'з', '\'': 'ь'
};
function isRus(str) {
    return (!!/[А-Я-Ё]/gi.test(str));
}

function isEng(str) {
    return (!!/[A-Z]/gi.test(str));
}
module.exports = Transformator;
