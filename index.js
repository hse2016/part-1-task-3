'use strict';

const express = require('express');
const app = express();
const fs = require('fs');
const main_path = require('path');

const PORT = process.env.PORT || 4000;

const Transform = require('stream').Transform;



class Translator extends Transform {
	constructor(options) {
		super(options);
		this.aim_lang = null;
		this.jsonprep = false;
		this.jsonrdy = false

	}

	_prepareJSON() {
		if(!this.jsonprep) {
			this.push('{"content": "');
			this.jsonprep = true;
		}
	}

	_finishJSON() {
		if(!this.jsonrdy) {
			this.push('"}');
			this.jsonrdy = true;
		}
			
	}

	_flush(callback) {
		this._finishJSON();
		callback();
	}

	
	_transform(chunk, encoding, callback) {
//========================
		var str = chunk.toString('utf-8');
		var new_str = '';		
		let rusInd = str.match(/[а-яА-Я]/);		
		let engInd = str.match(/[a-zA-Z]/);
		if (this.aim_lang == null) {			
			if(rusInd != null && engInd != null) {
				if(rusInd < engInd) {
					this.aim_lang = 'eng';
				}
				else {
					this.aim_lang = 'rus';
				}
			}
			else {
				if(rusInd != null && engInd == null) {
					this.aim_lang = 'eng';
				}
				else {
					if(rusInd == null && engInd != null) {
						this.aim_lang = 'rus'
						
					}
				}
			}
		}

		this._prepareJSON();
		new_str = str;
		
		if(this.aim_lang == 'rus') {
			//3 letters
	  		new_str = new_str.replace(/Shh/g, 'Щ');
			new_str = new_str.replace(/ShH/g, 'Щ');
			new_str = new_str.replace(/SHH/g, 'Щ');
			new_str = new_str.replace(/SHh/g, 'Щ');
			new_str = new_str.replace(/shh/g, 'щ');

			//2 letters
			new_str = new_str.replace(/Zh/g, 'Ж');
	  		new_str = new_str.replace(/Sh/g, 'Ш');
	  		new_str = new_str.replace(/Je/g, 'Э');
	  		new_str = new_str.replace(/Ju/g, 'Ю');
	  		new_str = new_str.replace(/Ja/g, 'Я');
	  		new_str = new_str.replace(/zh/g, 'ж');  		
	  		new_str = new_str.replace(/sh/g, 'ш');
			new_str = new_str.replace(/##/g, 'Ъ');
			new_str = new_str.replace(/\'\'/g, "Ь");
	  		new_str = new_str.replace(/je/g, 'э');
	  		new_str = new_str.replace(/ju/g, 'ю');
	  		new_str = new_str.replace(/ja/g, 'я');

			new_str = new_str.replace(/\'/g, "ь");
			new_str = new_str.replace(/A/g, 'А');
	  		new_str = new_str.replace(/B/g, 'Б');
	  		new_str = new_str.replace(/C/g, 'Ц');
	  		new_str = new_str.replace(/D/g, 'Д');
	  		new_str = new_str.replace(/E/g, 'Е');
	  		new_str = new_str.replace(/F/g, 'Ф');  		
	  		new_str = new_str.replace(/G/g, 'Г');
			new_str = new_str.replace(/H/g, 'Х');
			new_str = new_str.replace(/I/g, 'И');
	  		new_str = new_str.replace(/J/g, 'Й');
	  		new_str = new_str.replace(/K/g, 'К');
	  		new_str = new_str.replace(/L/g, 'Л');
			new_str = new_str.replace(/M/g, 'М');
	  		new_str = new_str.replace(/N/g, 'Н');
	  		new_str = new_str.replace(/O/g, 'О');
	  		new_str = new_str.replace(/P/g, 'П');
	  		new_str = new_str.replace(/Q/g, 'Я');
	  		new_str = new_str.replace(/R/g, 'Р');  		
	  		new_str = new_str.replace(/S/g, 'С');
			new_str = new_str.replace(/T/g, 'Т');
			new_str = new_str.replace(/U/g, 'У');
	  		new_str = new_str.replace(/V/g, 'В');
	  		new_str = new_str.replace(/W/g, 'Щ');
	  		new_str = new_str.replace(/X/g, 'Х');
			new_str = new_str.replace(/Y/g, 'Ы');
	  		new_str = new_str.replace(/Z/g, 'З');

	  		new_str = new_str.replace(/a/g, 'а');
	  		new_str = new_str.replace(/b/g, 'б');
	  		new_str = new_str.replace(/c/g, 'ц');
	  		new_str = new_str.replace(/d/g, 'д');
	  		new_str = new_str.replace(/e/g, 'е');
	  		new_str = new_str.replace(/f/g, 'ф');  		
	  		new_str = new_str.replace(/g/g, 'г');
			new_str = new_str.replace(/h/g, 'х');
			new_str = new_str.replace(/i/g, 'и');
	  		new_str = new_str.replace(/j/g, 'й');
	  		new_str = new_str.replace(/k/g, 'к');
	  		new_str = new_str.replace(/l/g, 'л');
			new_str = new_str.replace(/m/g, 'м');
	  		new_str = new_str.replace(/n/g, 'н');
	  		new_str = new_str.replace(/o/g, 'о');
	  		new_str = new_str.replace(/p/g, 'п');
	  		new_str = new_str.replace(/q/g, 'я');
	  		new_str = new_str.replace(/r/g, 'р');  		
	  		new_str = new_str.replace(/s/g, 'с');
			new_str = new_str.replace(/t/g, 'т');
			new_str = new_str.replace(/u/g, 'у');
	  		new_str = new_str.replace(/v/g, 'в');
	  		new_str = new_str.replace(/w/g, 'щ');
	  		new_str = new_str.replace(/x/g, 'х');
			new_str = new_str.replace(/y/g, 'ы');
	  		new_str = new_str.replace(/z/g, 'з');
		}
		if(this.aim_lang == 'eng') {
			new_str = new_str.replace(/А/g,'A');
			new_str = new_str.replace(/Б/g,'B');
			new_str = new_str.replace(/В/g,'V');
			new_str = new_str.replace(/Г/g,'G');
			new_str = new_str.replace(/Д/g,'D');
			new_str = new_str.replace(/Е/g,'E');
			new_str = new_str.replace(/Ё/g,'Jo');
			new_str = new_str.replace(/Ж/g,'Zh');
			new_str = new_str.replace(/З/g,'Z');
			new_str = new_str.replace(/И/g,'I');
			new_str = new_str.replace(/Й/g,'J');
			new_str = new_str.replace(/К/g,'K');
			new_str = new_str.replace(/Л/g,'L');
			new_str = new_str.replace(/М/g,'M');
			new_str = new_str.replace(/Н/g,'N');
			new_str = new_str.replace(/О/g,'O');
			new_str = new_str.replace(/П/g,'P');
			new_str = new_str.replace(/Р/g,'R');
			new_str = new_str.replace(/С/g,'S');
			new_str = new_str.replace(/Т/g,'T');
			new_str = new_str.replace(/У/g,'U');
			new_str = new_str.replace(/Ф/g,'F');
			new_str = new_str.replace(/Х/g,'H');
			new_str = new_str.replace(/Ц/g,'C');
			new_str = new_str.replace(/Ч/g,'Ch');
			new_str = new_str.replace(/Ш/g,'Sh');
			new_str = new_str.replace(/Щ/g,'Shh');
			new_str = new_str.replace(/Ъ/g,'##');
			new_str = new_str.replace(/Ы/g,'Y');
			new_str = new_str.replace(/Ь/g,"\'\'");
			new_str = new_str.replace(/Э/g,'Je');
			new_str = new_str.replace(/Ю/g,'Ju');
			new_str = new_str.replace(/Я/g,'Ja');
			
			new_str = new_str.replace(/а/g,'a');
			new_str = new_str.replace(/б/g,'b');
			new_str = new_str.replace(/в/g,'v');
			new_str = new_str.replace(/г/g,'g');
			new_str = new_str.replace(/д/g,'d');
			new_str = new_str.replace(/е/g,'e');
			new_str = new_str.replace(/ё/g,'jo');
			new_str = new_str.replace(/ж/g,'zh');
			new_str = new_str.replace(/з/g,'z');
			new_str = new_str.replace(/и/g,'i');
			new_str = new_str.replace(/й/g,'j');
			new_str = new_str.replace(/к/g,'k');
			new_str = new_str.replace(/л/g,'l');
			new_str = new_str.replace(/м/g,'m');
			new_str = new_str.replace(/н/g,'n');
			new_str = new_str.replace(/о/g,'o');
			new_str = new_str.replace(/п/g,'p');
			new_str = new_str.replace(/р/g,'r');
			new_str = new_str.replace(/с/g,'s');
			new_str = new_str.replace(/т/g,'t');
			new_str = new_str.replace(/у/g,'u');
			new_str = new_str.replace(/ф/g,'f');
			new_str = new_str.replace(/х/g,'h');
			new_str = new_str.replace(/ц/g,'c');
			new_str = new_str.replace(/ч/g,'ch');
			new_str = new_str.replace(/ш/g,'sh');
			new_str = new_str.replace(/щ/g,'shh');
			new_str = new_str.replace(/ъ/g,'#');
			new_str = new_str.replace(/ы/g,'y');
			new_str = new_str.replace(/ь/g,"\'");
			new_str = new_str.replace(/э/g,'je');
			new_str = new_str.replace(/ю/g,'ju');
			new_str = new_str.replace(/я/g,'ja');
		}

		console.log(new_str);
		this.push(new_str);
//========================
		callback();
	}
}

app.listen(PORT, function () {
    console.log(`App is listen on ${PORT}`);
});


var start;
var er;

//timer starts
//type added
app.all('*', function(req, res, next) {
	start = new Date().getMilliseconds();
	res.append('x-request-url', req.method + " " + req.url);
	next();
});


app.get('/v1', function(req, res, next) {
	if(req.headers['cookie'] == undefined) {
		res.status(403).end('Authorise or die!');
	}
	else {
		for (var i = 0; i < 5000000; ++i) {}
		next();
	}
	//next();
});



//timer ends
app.use(function(req, res, next) {
	var end = new Date().getMilliseconds();
	var dur = end - start;
	res.set('x-time', dur);
	next();
});

//catch errors

app.use(function (req, res, next) {
	
	if(!req.url.startsWith("/v1")){
    	res.setHeader('x-request-error', "Unknown request");
    	res.status(503).end();
	}
	else {
		next();
	}
	
});

app.use('/v1', function(req,res,next) {
	var path = req.url;
	if(path.indexOf('/..') > -1) {
		throw new Error(path);
	}
	path = main_path.join(__dirname, path);
	if(fs.lstatSync(path).isDirectory()) {
		fs.readdir(path, function (err, items) {
            let json_items = ['.', '..'] + items;
            res.send({'content': json_items});
        });
	}
	else {
		res.set('Content-type','application/json');
		let readStream = fs.createReadStream(path);
		let tranStream = new Translator();
		readStream.pipe(tranStream).pipe(res);	
	}
});


app.use(function(error, req, res, next){
    res.setHeader('x-request-error', error.toString());
    res.status(503).end();
});

app.use(function(req, res, next){
	res.end();
});


// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
