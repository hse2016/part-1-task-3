/**
 * Created by tema on 15.10.16.
 */

const rq = require('supertest');
const app = require('../index');

const HEADER = 'x-request-error';

describe('Error middleware', () => {

    for (var i = 0; i < 10; i++) {
        let word = Math.random().toString(20).slice(2, 20);
        it('multiple unknown request error to directory ' + word, (done) => {
            var url = '/' + word;
            rq(app)
                .get(url)
                .set('Cookie', ['authorize=12345667'])
                .end((err, res) => {
                    res.headers[HEADER].should.eql('Unknown request');
                    done();
                });
        });
    }

});