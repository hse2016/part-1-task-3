'use strict';

const express = require('express');
const app = express();
const fs = require('fs');

const PORT = process.env.PORT || 4000;

const Transform = require('stream').Transform;

var rus_abc = [
'А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П'
,'Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я',
'a','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п',
'р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'
];

var eng_abc = [
'A', 'B', 'V', 'G', 'D', 'E', 'Jo', 'Zh','Z', 'I', 'J', 'K', 'L', 'M', 'N', 'O','P', 'R', 'S', 'T', 'U', 'F', 'H', 'C', 'Ch', 'Sh', 'Shh','##', 'Y', '\'\'', 
'Je', 'Ju', 'Ja', 'a','b','v','g','d','e','jo','zh','z','i','j','k','l','m','n','o','p','r','s','t',
'u','f','h','c','ch','sh','shh','#','y','\'','je','ju','ja'
];


class T_to_eng extends Transform {
	constructor(options) {
		super(options);
	}
	_transform(chunk, encoding, callback) {
//========================
		var str = chunk.toString('utf-8');
		var new_str = '';
		for (let i = 0; i < str.length; ++i) {
			let letter = str[i];
			ind = eng_abc.indexOf(letter);
			if(ind != -1) {
				new_str += eng_abc[ind];
			}
			else {
				new_str += str[i];
			}
		}
//========================
		callback();
	}
}

class T_to_rus extends Transform {
	constructor(options) {
		super(options);
	}
	_transform(chunk, encoding, callback) {
		var str = chunk.toString('utf8');

		//3 letters
  		str = text.replace('Shh', 'Щ');
		str = test.replase('ShH', 'Щ');
		str = text.replace('shh', 'щ');

		//2 letters
		str = text.replace('Zh', 'Ж');
  		str = text.replace('Sh', 'Ш');
  		str = text.replace('Je', 'Э');
  		str = text.replace('Ju', 'Ю');
  		str = text.replace('Ja', 'Я');
  		str = text.replace('zh', 'ж');  		
  		str = text.replace('sh', 'ш');
		str = text.replace('##', 'Ъ');
		str = text.replace('\'\'', 'Ь');
  		str = text.replace('je', 'э');
  		str = text.replace('ju', 'ю');
  		str = text.replace('ja', 'я');

		var str = chunk.toString('utf-8');
		var new_str = '';
		for (let i = 0; i < str.length; ++i) {
			let letter = str[i];
			ind = rus_abc.indexOf(letter);
			if(ind != -1) {
				new_str += rus_abc[ind];
			}
			else {
				new_str += str[i];
			}
		}

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

});

app.use('/v1', function(req,res,next) {
	var path = req.url
	path.substring(0, 3);
	console.log(path)
	if(fs.lstatSync(path).isDirectory()) {
		files = fs.readdirSync();
		//res.send({content : files});
	}
	else{
		
	}
	next();
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


app.use(function(error, req, res, next){
    res.setHeader('x-request-error', error.toString());
    res.status(503).end();
});

app.use(function(req, res, next){
	res.status(200).end();
});


// IMPORTANT. Это строка должна возвращать инстанс сервера
module.exports = app;
