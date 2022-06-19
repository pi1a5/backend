/* eslint-disable no-undef */
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const router = require('../routes/routes');

// eslint-disable-next-line new-cap
const app = new express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);

describe('Test Routes', () => {
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
});
