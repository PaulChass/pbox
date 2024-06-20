const request = require('supertest');
const app = require('../server'); // Assuming  app is exported from server.js


describe('POST /api/folders', () => {
    it('should create a new folder', async () => {
        const res = await request(app)
            .post('/api/folders/')
            .send({
                name: 'testFolder',
                parent_id: 17,
                email: 'o@o.o'
            });
        expect(res.statusCode).toEqual(201);
    });
    it('should get the existing folders', async () => {        
        const res = await request(app)
          .get('/api/folders');
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
      });
   

    afterAll(async () => {
    });
});
