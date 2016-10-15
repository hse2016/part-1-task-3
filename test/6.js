const rq = require('supertest');
const app = require('../index');

const HEADER = 'x-time';

describe('Log time middleware', () => {

    it('header should be number less than 1 millesecond', (done) => {
        rq(app)
            .get('/v1/')
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers[HEADER].should.lessThan(1);
                done();
            });
    });

    it('header should be number rounded to the thousandths', (done) => {
        rq(app)
            .get('/v1/')
            .set('Cookie', ['authorize=12345667'])
            .end((err, res) => {
                res.headers[HEADER].should.containEql('.');
                ((res.headers[HEADER].toString()).split('.')[1].length <= 3).should.be.ok();
                done();
            });
    });

});
