const rq = require('supertest');
const app = require('../index');

const HEADER = 'x-request-error';

describe('Error middleware', () => {

    it('return 503', (done) => {
        rq(app)
            .get('/')
            .set('Cookie', ['authorize=12345667'])
            .expect(503)
            .end(done);
    });

    it('return header', (done) => {
        rq(app)
            .get('/')
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers.should.have.property(HEADER);
                done();
            });
    });

    it('multiple unknown request error', (done) => {
        let url = '/incorrect';
        rq(app)
            .get(url)
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers[HEADER].should.eql('Unknown request');
                done();
            });
    });

    it.skip('multiple language error', (done) => {
        let url = '/v1/files/file.multi.txt';
        rq(app)
            .get(url)
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers[HEADER].should.eql('Multiple language');
                done();
            });
    });
});
