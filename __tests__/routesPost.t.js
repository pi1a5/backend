/* eslint-disable linebreak-style */
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

function serialise(obj) {
  return Object.keys(obj)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&');
}

describe('Test Routes', () => {
  test('responds to /api/user', async () => {
    const res = await request(app).post('/api/user').send(serialise({ sub: '115058635279984514484' }));
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/login', async () => {
    const res = await request(app).post('/api/login').send(serialise({ idToken: 'teste2', sub: '115058635279984514484' }));
    expect(res.statusCode).toBe(200);
  });
});
