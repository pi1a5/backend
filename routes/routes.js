/* eslint-disable linebreak-style */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const CourseController = require('../controllers/CourseController');
const DocumentController = require('../controllers/DocumentController');
const EstagioController = require('../controllers/EstagioController');
const HomeController = require('../controllers/HomeController');
const TicketController = require('../controllers/TicketController');
const ProcessoController = require('../controllers/ProcessoController');
const UserController = require('../controllers/UserController');
const HeaderMiddleware = require('../middleware/httpHeaders');

const router = express.Router();

const options = {
  explorer: true,
  defaultModelsExpandDepth: -1,
  customCss: 'body { background-color: yellow; }',
};

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument, false, options));

router.get('/', HeaderMiddleware, HomeController.index);

// Para Usuario
router.post('/api/login', HeaderMiddleware, UserController.login);
router.post('/api/newUser', HeaderMiddleware, UserController.newUser);
router.post('/api/user', HeaderMiddleware, UserController.user);
router.post('/api/checkOrientadoresAmount', HeaderMiddleware, UserController.checkOrientadoresAmount);
router.post('/api/setCourseProntuario', HeaderMiddleware, UserController.setCourseProntuario);
router.post('/api/getAlunoProfile', HeaderMiddleware, UserController.getAlunoProfile);

// Para Processos

router.post('/api/findAllByCourse', HeaderMiddleware, ProcessoController.findAllByCourse);
router.post('/api/updateEtapa', HeaderMiddleware, ProcessoController.updateEtapa);
router.post('/api/deleteProcesso', HeaderMiddleware, ProcessoController.deleteProcesso);
router.post('/api/createNewProcesso', HeaderMiddleware, ProcessoController.createNewProcesso);
router.post('/api/updateProcesso', HeaderMiddleware, ProcessoController.updateProcesso);

// Para estagios

router.post('/api/createNewEstagio', HeaderMiddleware, EstagioController.createNewEstagio);
router.post('/api/checkIfHasEstagio', HeaderMiddleware, EstagioController.checkIfHasEstagio);
router.get('/api/limparEstagios', HeaderMiddleware, EstagioController.limparEstagios);

// Para Ticket Aluno
router.post('/api/createTicket', HeaderMiddleware, TicketController.createTicket);
router.post('/api/getTicketsUser', HeaderMiddleware, TicketController.getTicketsUser);
router.post('/api/checkIfFinalizou', HeaderMiddleware, TicketController.checkIfFinalizou);
router.post('/api/getTicketForm', HeaderMiddleware, TicketController.getTicketForm);
router.post('/api/updateLatestTicket', HeaderMiddleware, TicketController.updateLatestTicket);
router.post('/api/newTicket', HeaderMiddleware, TicketController.newTicket);
router.post('/api/getPendingTicket', HeaderMiddleware, TicketController.getPendingTicket);
router.post('/api/getClosedTickets', HeaderMiddleware, TicketController.getClosedTickets);

// Para Ticket Professor
router.post('/api/getTicketsWithoutSupervisor', HeaderMiddleware, TicketController.getTicketsWithoutSupervisor);
router.post('/api/getTicketsWithSupervisor', HeaderMiddleware, TicketController.getTicketsWithSupervisor);
router.post('/api/getClosedTicketsWithSupervisor', HeaderMiddleware, TicketController.getClosedTicketsWithSupervisor);
router.post('/api/feedbackTicket', HeaderMiddleware, TicketController.feedbackTicket);
// router.post('/api/getPdfUrl', TicketController.getPdfUrl);

// Para curso
router.post('/api/createNewCourse', HeaderMiddleware, CourseController.createNewCourse);

// Para teste
router.get('/api/users', HeaderMiddleware, UserController.users);
router.get('/api/courses', HeaderMiddleware, CourseController.courses);
router.get('/api/tickets', HeaderMiddleware, TicketController.tickets);
router.get('/api/estagios', HeaderMiddleware, EstagioController.estagios);
router.get('/api/processos', HeaderMiddleware, ProcessoController.processos);
router.get('/api/createExample', HeaderMiddleware, ProcessoController.createExample);
router.post('/api/test', HeaderMiddleware, ProcessoController.test);


// Limpar BD
router.get('/api/limparBanco', HeaderMiddleware, ProcessoController.limparBanco);
router.post('/api/documents', HeaderMiddleware, DocumentController.documents);

module.exports = router;
