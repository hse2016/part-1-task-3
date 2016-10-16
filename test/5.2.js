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

    it.skip('should return content propery', (done) => {
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
});
