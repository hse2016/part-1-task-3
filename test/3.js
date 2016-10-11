const rq = require('supertest');
const app = require('../index');

const HEADER = 'x-request-url';

describe('Log request middleware', () => {

    it('return header', (done) => {
        rq(app)
            .get('/v1/')
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers.should.have.property(HEADER);
                done();
            });
    });

    it('header should be in right format', (done) => {
        let url = '/v1/test';
        rq(app)
            .get(url)
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers[HEADER].should.eql(`GET ${url}`);
                done();
            });
    });
});
