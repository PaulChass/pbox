const request = require('supertest');
const app = require('../server'); // Assuming app is exported from server.js
const sequelize = require('../config/db');

let server;
let userId; // Declare userId outside of describe block

beforeAll(done => {
  // Start the server and store the instance
  server = app.listen(done);
});

afterAll(async () => {
  // Clean up: Delete the user that was registered during the test
  if (userId) {
    await request(app)
      .delete(`/api/users/${userId}`)  // Adjust endpoint as per your API
      .set('Authorization', 'Bearer your-auth-token-here') // If authorization is required
      .expect(200); // Assuming successful deletion returns 200
  }

  // Close the server and the Sequelize connection
  await server.close();
  await sequelize.close();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    // Assuming the response body contains the new user's ID
    userId = res.body.user.id;
  });

  it('should login an existing user', async () => {
    // Now, attempt to login with the registered user credentials
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
  });

  it('should handle incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistentuser@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});
