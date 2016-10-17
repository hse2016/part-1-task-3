/**
 * Created by Evgeny on 17/10/16.
 */

const Transform = require('stream').Transform;


class MyTransform extends Transform {

    constructor(opt){
        super(opt);
        this.isToRus = false;
        this.detected = false;
        this.toNextChunk = '';
        this.isFlushing = false;
    }

    _transform(chunk, encoding, callback) {
        var str = chunk.toString('utf8');
        if (this.detected === false){
            this.detectLanguage(str);
        }
        // console.log(str);
        if (this.detected === true){
            if (this.isToRus) {
                str = this.translate(str, engToRus, engToRus_additional);
            }
            else {
                str = this.translate(str, rusToEng);
            }
        }
        this.push(str);
        callback();
    }

    _flush(callback) {
        this.isFlushing = true;
        let str = this.toNextChunk;
        // console.log(str);
        if (this.detected === true){
            if (this.isToRus) {
                str = this.translate(str, engToRus, engToRus_additional);
            }
            else {
                str = this.translate(str, rusToEng);
            }
        }
        // console.log(str);
        this.push(str);
        callback();
    }

    moveLasts(str, map_additional) {
        let last_ind = -1;
        let value = '';
        for (let val in map_additional) {
            let ind = str.lastIndexOf(val);
            if (ind > last_ind) {
                last_ind = ind;
                value = val;
            }
        }
        if (last_ind > -1){
            // console.log('befire slice', str, last_ind, str.length);
            this.toNextChunk = str.slice(last_ind + value.length);
            str = str.slice(0, last_ind + value.length);
            // console.log('after slice ', str, this.toNextChunk);
        }
        return str;
    }

    translate(str, map, map_additional){
        if (!this.isFlushing) {
            str = this.toNextChunk + str;
        }
        this.toNextChunk = '';
        if (map_additional && !this.isFlushing) {
            // console.log('moveNext');
            str = this.moveLasts(str, map_additional);
            for (let val in map_additional) {
                str = str.replace(new RegExp(val, 'g'), map_additional[val]);
            }
        }

        for (let val in map) {
            // console.log('normal saerch', str);
            str = str.replace(new RegExp(val,'g'), map[val]);
        }
        return str;
    }


    detectLanguage(str){
        let eng = str.search(new RegExp('[a-z]', 'i'));
        let rus = str.search(new RegExp('[а-я]', 'i'));
        if (eng > -1 && (eng < rus || rus < 0)){
            this.detected = true;
            this.isToRus = true;
        }
        else if (rus > -1 && (rus < eng || eng < 0)){
            this.detected = true;
            this.isToRus = false;
        }
    }
}

module.exports = MyTransform;


const rusToEng = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Jo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
    'Ъ': '#', 'Ы': 'Y', 'Ь': '\'', 'Э': 'Je', 'Ю': 'Ju', 'Я': 'Ja',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'jo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh',
    'ъ': '#', 'ы': 'y', 'ь': '\'', 'э': 'je', 'ю': 'ju', 'я': 'ja'
};

const engToRus_additional = {
    'JO': 'Ё', 'JU': 'Ю', 'YO': 'Ё', 'CH': 'Ч',
    'YA': 'Я', 'JE': 'Э', 'SHH': 'Щ', 'SH': 'Ш', 'ZH': 'Ж',
    '#': 'ъ',
    'jo': 'ё', 'ju': 'ю', 'yo': 'ё', 'ch': 'ч',
    'ya': 'я', 'je': 'э', 'shh': 'щ', 'sh': 'ш', 'zh': 'ж', 'ja': 'я',
    'Jo': 'Ё', 'Ju': 'Ю', 'Yo': 'Ё', 'Ch': 'Ч',
    'Ya': 'Я', 'Je': 'Э', 'Shh': 'Щ', 'Sh': 'Ш', 'Zh': 'Ж'
};

const engToRus = {
    'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'И',
    'J': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Я', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'Щ', 'X': 'Х', 'Y': 'Ы', 'Z': 'З',

    'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и',
    'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'я', 'r': 'р',
    's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'щ', 'x': 'х', 'y': 'ы', 'z': 'з', '\'': 'ь'
};