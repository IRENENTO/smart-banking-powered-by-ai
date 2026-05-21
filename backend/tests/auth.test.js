const request = require('supertest');
const app = require('../src/server');

describe('Auth Routes', () => {
  it('POST /api/auth/login — returns 400 for missing credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/register — returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});
    expect(res.status).toBe(400);
  });

  it('GET / — returns API info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg');
  });

  it('GET /nonexistent — returns 404', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.status).toBe(404);
  });
});
