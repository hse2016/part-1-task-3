const rq = require('supertest');
const app = require('../index');

describe('Auth middleware', () => {

    it('unauthorized', (done) => {
        rq(app)
            .get('/v1/')
            .expect(403)
            .end(done);
    });

    it('authorized', (done) => {
        rq(app)
            .get('/v1/')
            .set('Cookie', ['authorize=12345667'])
            .expect(200)
            .end(done);
    });
});
