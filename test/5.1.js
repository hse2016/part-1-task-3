const rq = require('supertest');
const app = require('../index');
const fs = require('fs');
const h = require('./helpers/files');

describe('Dir lookup', () => {

    let prefix = '/v1/';
    let rnd = h.rndDir();

    before((done) => {
        rnd.create().then(done);
    });

    after((done) => {
        rnd.remove().then(done);
    });

    it('return 200 status', (done) => {
        rq(app)
            .get(prefix)
            .set('Cookie', ['authorize=12345667'])
            .expect(200)
            .end(done);
    });

    describe('Dir list', () => {

        it('should have property content', (done) => {
            rq(app)
                .get(prefix)
                .set('Cookie', ['authorize=12345667'])
                .end((err, res) => {
                    res.body.should.have.property('content');
                    done();
                });
        });

        it('should property content should be array', (done) => {
            rq(app)
                .get(prefix)
                .set('Cookie', ['authorize=12345667'])
                .end((err, res) => {
                    res.body['content'].should.be.an.Array;
                    done();
                });
        });

        it('should contain . and ..', (done) => {
            rq(app)
                .get(prefix)
                .set('Cookie', ['authorize=12345667'])
                .end((err, res) => {
                    res.body['content'].should.containEql('.').and.containEql('..');
                    done();
                });
        });

        it('should dir in dir', (done) => {
            fs.mkdtemp(rnd.dirName + '/tmp-', (err, folder) => {
                if (err) {
                    return done(err);
                }

                rq(app)
                    .get(prefix + rnd.dirName.slice(2))
                    .set('Cookie', ['authorize=12345667'])
                    .end((err, res) => {
                        res.body['content'].should.containEql(folder.split('/').slice(-1)[0]);
                        done();
                    });
            });
        });

        it('should file in dir', (done) => {
            fs.mkdtemp(rnd.dirName + '/tmp-', (err, folder) => {
                if (err) {
                    return done(err);
                }

                let rndFilename = 'filename' + String(Math.random()).slice(2);

                fs.writeFile(folder + '/' + rndFilename, '', (err) => {
                    rq(app)
                        .get(prefix + folder.slice(2))
                        .set('Cookie', ['authorize=12345667'])
                        .end((err, res) => {
                            res.body['content'].should.containEql(rndFilename);
                            done();
                        });
                });
            });
        });

        it('should return error if access to upper dir', (done) => {
            rq(app)
                .get(prefix + '../')
                .set('Cookie', ['authorize=12345667'])
                .end((err, res) => {
                    res.headers.should.have.property('x-request-error');
                    done();
                });
        });
    });
});
