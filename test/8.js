/**
 * Created by tema on 15.10.16.
 */

const rq = require('supertest');
const app = require('../index');

const HEADER = 'x-request-url';

describe('Log request middleware', () => {

    for (var i = 0; i < 10; i++) {
        let word = Math.random().toString(20).slice(2, 20);
        let url = '/' + word;

        it('return header', (done) => {
            rq(app)
                .get(url)
                .set('Cookie', ['authorize=12345667'])
                .end((err, res) => {
                    res.headers.should.have.property(HEADER);
                    done();
                });
        });

        it('header should be in right format', (done) => {
            rq(app)
                .get(url)
                .set('Cookie', ['authorize=12345667'])
                .end((err, res) => {
                    res.headers['x-request-url'].should.eql(`GET /${word}`);
                    done();
                });
        });
    }

});