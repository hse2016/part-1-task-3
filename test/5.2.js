'use strict';
const rq = require('supertest');
const app = require('../index');
const fs = require('fs');
const h = require('./helpers/files');

describe('Check transform', () => {

    let prefix = '/v1/';
    let rnd = h.rndDir();

    before((done) => {
        rnd.create().then(done);
    });

    after((done) => {
        rnd.remove().then(done);
    });

    it('return status 200', (done) => {
        let file = h.rndFile(rnd.dirName);
        file.create()
            .then(() => {
                rq(app)
                    .get(prefix + file.filename.slice(2))
                    .set('Cookie', ['authorize=12345667'])
                    .expect(200)
                    .end(() => {
                        file.remove().then(done);
                    });
            });
    });

    it('should return correct content type', (done) => {
        let file = h.rndFile(rnd.dirName);
        file.create()
            .then(() => {
                rq(app)
                    .get(prefix + file.filename.slice(2))
                    .set('Cookie', ['authorize=12345667'])
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        res.headers.should.have.property('content-type');
                        res.headers['content-type'].should.eql('application/json');
                        file.remove().then(done);
                    });
            });
    });

    it('should return chunked content', (done) => {
        let file = h.rndFile(rnd.dirName);
        file.create()
            .then(() => {
                rq(app)
                    .get(prefix + file.filename.slice(2))
                    .set('Cookie', ['authorize=12345667'])
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        res.headers.should.have.property('transfer-encoding');
                        res.headers['transfer-encoding'].should.eql('chunked');
                        file.remove().then(done);
                    });
            });
    });

    it('should return content property', (done) => {
        let file = h.rndFile(rnd.dirName);
        file.create()
            .then(() => {
                rq(app)
                    .get(prefix + file.filename.slice(2))
                    .set('Cookie', ['authorize=12345667'])
                    .expect(200)
                    .buffer()
                    .parse(h.fileParser)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        res.body.should.have.property('content');
                        file.remove().then(done);
                    });
            });
    });

    describe('should transform', () => {

        it('untranslated string', (done) => {
            const str = '!@$%^&*()_+';
            checkTranslate(str, str, done);

        });

        describe('one chunk, lowercase', () => {
            const ru = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
            const en = "abvgdejozhzijklmnoprstufhcchshshh#y'jejuja";

            it('ru -> en', (done) => {
                checkTranslate(ru, en, done);
            });

            it('en -> ru', (done) => {
                checkTranslate(en, ru, done);
            });
        });

        describe('one chunk, multicase', () => {
            const ru = 'ЧаЩа';
            const en = 'ChaShha';

            it('ru -> en', (done) => {
                checkTranslate(ru, en, done);
            });

            it('en -> ru', (done) => {
                checkTranslate(en, ru, done);
            });
        });

        describe('multiple chunk', () => {
            const ln = 1000 * 200;
            const ru = 'а' + Array.from(Array(ln), _ => 'ч').join('');
            const en = 'a' + Array.from(Array(ln), _ => 'ch').join('');

            it('ru -> en', (done) => {
                checkTranslate(ru, en, done);
            });

            it('en -> ru', (done) => {
                checkTranslate(en, ru, done);
            });
        });
    });

    function checkTranslate(send, check, done) {
        let file = h.rndFile(rnd.dirName, send);
        file.create()
            .then(() => {
                rq(app)
                    .get(prefix + file.filename.slice(2))
                    .set('Cookie', ['authorize=12345667'])
                    .expect(200)
                    .buffer()
                    .parse(h.fileParser)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        res.body.content.should.eql(check);
                        file.remove().then(done);
                    });
            });
    }
});
