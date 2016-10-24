/**
 * Created by WERT on 24-Oct-16.
 */
'use strict';

var Transform = require('stream').Transform;

var engSubstringsToReplace =
    ['Shh', 'Jo', 'Zh', 'Ch', 'Sh', 'Je', 'Ju', 'Ja',
        'shh', 'jo', 'zh', 'ch', 'sh', 'je', 'ju', 'ja',
        'A', 'B', 'V', 'G', 'D', 'E', 'Z', 'I',
        'a', 'b', 'v', 'g', 'd', 'e', 'z', 'i',
        'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R',
        'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r',
        'S', 'T', 'U', 'F', 'H', 'C', 'Y',
        's', 't', 'u', 'f', 'h', 'c', 'y',
        '\'', '\'', '#', '#'];

var ruSubstringsToReplace =
    ['Щ', 'Ё', 'Ж', 'Ч', 'Ш', 'Э', 'Ю', 'Я',
        'щ', 'ё', 'ж', 'ч', 'ш', 'э', 'ю', 'я',
        'А', 'Б', 'В', 'Г', 'Д', 'Е', 'З', 'И',
        'а', 'б', 'в', 'г', 'д', 'е', 'з', 'и',
        'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р',
        'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р',
        'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ы',
        'с', 'т', 'у', 'ф', 'х', 'ц', 'ы',
        'ь', 'Ь', 'ъ', 'Ъ'];

function getLanguage(str) {
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code >= 65 && code <= 90) // A..Z
            return 'en';
        else if (code >= 97 && code <= 122) // a..z
            return 'en';
        else if (code === 35 || code === 39) // # '
            return 'en';
        else if (code >= 1040 && code <= 1071) // А..Я
            return 'ru';
        else if (code >= 1072 && code <= 1103) // а..я
            return 'ru';
        else if (code == 1025 || code == 1105) // Ё ё
            return 'ru';
    }
    return new Error("Can't identify file's language");
}

function translitToEng(str) {
    for (let i = 0; i < ruSubstringsToReplace.length; i++) {
        str = str.replace(new RegExp(ruSubstringsToReplace[i], 'g'), engSubstringsToReplace[i]);
    }
    return str;
}

function translitToRu(str) {
    for (let i = 0; i < engSubstringsToReplace.length; i++) {
        str = str.replace(new RegExp(engSubstringsToReplace[i], 'g'), ruSubstringsToReplace[i]);
    }
    return str;
}

class TranslitTransform extends Transform
{
    constructor(options) {
        super(options);
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8');
        var newStr;
        if (getLanguage(str) === 'ru')
            newStr = translitToEng(str);
        else if (getLanguage(str) === 'en')
            newStr = translitToRu(str);
        this.push(newStr);

        callback();
    }

    _flush() {
        this.push('"}');
    }
}

module.exports = TranslitTransform;