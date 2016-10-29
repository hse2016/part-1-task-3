/**
 * Created by tema on 15.10.16.
 */

const rq = require('supertest');
const app = require('../index');

describe('Dir lookup', () => {

    for (var i = 0; i < 10; i++) {
        let word = Math.random().toString(20).slice(2, 20);
        let url = '/' + word;

        it('Acces to non-existent dir or file', (done) => {
            rq(app)
                .get('/v1' + url)
                .set('Cookie', ['authorize=12345667'])
                .expect(503)
                .end(done);
        });
    }

});
