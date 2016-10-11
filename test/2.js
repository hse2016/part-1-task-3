const rq = require('supertest');
const app = require('../index');

const HEADER = 'x-time';

describe('Log time middleware', () => {

    it('return header', (done) => {
        rq(app)
            .get('/v1/')
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers.should.have.property(HEADER);
                done();
            });
    });

    it('header should be number', (done) => {
        rq(app)
            .get('/v1/')
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers[HEADER].should.be.above(0).and.be.a.Number;
                done();
            });
    });
});
