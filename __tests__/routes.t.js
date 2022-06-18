/* eslint-disable no-undef */
const request = require('supertest');
const express = require('express');
const router = require('../routes/routes');

// eslint-disable-next-line new-cap
const app = new express();
app.use('/', router);

function serialise(obj) {
  return Object.keys(obj)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&');
}

describe('Test Routes', () => {
  // Rotas GET
  test('responds to /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/courses', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/tickets', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/estagios', async () => {
    const res = await request(app).get('/api/estagios');
    expect(res.statusCode).toBe(200);
  });

  // Rotas POST

  test('responds to /api/user', async () => {
    const res = await request(app).post('/api/user').send(serialise({ sub: '115058635279984514484' }));
    expect(res.statusCode).toBe(200);
  });
});
