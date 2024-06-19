const request = require('supertest');
const { app, startServer } = require('../server');
const sequelize = require('../config/db');

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testlo',
        email: 'testlo@example.com',
        password: 'password'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });
});

describe('POST /login', () => {
  it('should login an existing user', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testmuser',
        email: 'testmuser@example.com',
        password: 'password'
      });

    // Now, attempt to login with the registered user credentials
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testmuser@example.com',
        password: 'password'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
  });

  it('should handle incorrect email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistentuser@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
  
  it('should handle incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testmuser@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
