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
  // Rotas Usuario
  test('responds to /api/user', async () => {
    const res = await request(app).post('/api/user').send(serialise({ sub: '115058635279984514484' }));
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/login', async () => {
    const res = await request(app).post('/api/login').send(serialise({ idToken: 'teste2', sub: '115058635279984514484' }));
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/newUser', async () => {
    const res = await request(app).post('/api/newUser').send(serialise({
      name: 'teste', email: 'teste', picture: 'teste', idToken: 'teste', sub: 'teste',
    }));
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/checkOrientadoresAmount', async () => {
    const res = await request(app).post('/api/checkOrientadoresAmount').send(serialise({ sub: '108209164670727566020' }));
    expect(res.statusCode).toBe(200);
  });

  // Rotas de Curso
  test('responds to /api/setCourseProntuario', async () => {
    const res = await request(app).post('/api/setCourseProntuario').send(serialise({
      idCurso: 0, prontuario: 'teste', sub: 'teste',
    }));
    expect(res.statusCode).toBe(500);
  });

  // Rotas de Ticket Aluno
  test('responds to /api/newTicketInicio', async () => {
    const res = await request(app).post('/api/newTicketInicio').send(serialise({
      corpoTexto: 'teste', dataLimite: '10/10/1999', sub: 'teste', eProfessor: 'false',
    }));
    expect(res.statusCode).toBe(500);
  });

  test('responds to /api/newTicketAcompanhamento', async () => {
    const res = await request(app).post('/api/newTicketAcompanhamento').send(serialise({
      corpoTexto: 'teste', dataLimite: '10/10/1999', sub: 'teste', eProfessor: 'false',
    }));
    expect(res.statusCode).toBe(500);
  });

  test('responds to /api/newTicketFim', async () => {
    const res = await request(app).post('/api/newTicketFim').send(serialise({
      corpoTexto: 'teste', dataLimite: '10/10/1999', sub: 'teste', eProfessor: true,
    }));
    expect(res.statusCode).toBe(500);
  });

  test('responds to /api/getTicketsUser', async () => {
    const res = await request(app).post('/api/getTicketsUser').send(serialise({ sub: 'teste' }));
    expect(res.statusCode).toBe(404);
  });

  test('responds to /api/checkIfAcompanhamento', async () => {
    const res = await request(app).post('/api/checkIfAcompanhamento').send(serialise({ sub: 'teste' }));
    expect(res.statusCode).toBe(404);
  });

  test('responds to /api/checkIfFinalizou', async () => {
    const res = await request(app).post('/api/checkIfFinalizou').send(serialise({ sub: 'teste' }));
    expect(res.statusCode).toBe(200);
  });

  // Rotas de Ticket Orientador

  test('responds to /api/getTicketsWithoutSupervisor', async () => {
    const res = await request(app).post('/api/getTicketsWithoutSupervisor').send(serialise({ sub: 'teste' }));
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/getTicketsWithSupervisor', async () => {
    const res = await request(app).post('/api/getTicketsWithSupervisor').send(serialise({ sub: 'teste' }));
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/getClosedTicketsWithSupervisor', async () => {
    const res = await request(app).post('/api/getClosedTicketsWithSupervisor').send(serialise({ sub: 'teste' }));
    expect(res.statusCode).toBe(200);
  });

  test('responds to /api/feedbackTicket', async () => {
    const res = await request(app).post('/api/newTicketFim').send(serialise({
      eAceito: 'true', feedback: 'teste', sub: 'teste', idTicket: 0,
    }));
    expect(res.statusCode).toBe(500);
  });
});
