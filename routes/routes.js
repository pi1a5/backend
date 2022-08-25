const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const CourseController = require('../controllers/CourseController');
const DocumentController = require('../controllers/DocumentController');
const EstagioController = require('../controllers/EstagioController');
const HomeController = require('../controllers/HomeController');
const TicketController = require('../controllers/TicketController');
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

// Para Ticket Aluno
router.post('/api/newTicketInicio', HeaderMiddleware, TicketController.newTicketInicio);
router.post('/api/newTicketAcompanhamento', HeaderMiddleware, TicketController.newTicketAcompanhamento);
router.post('/api/newTicketFim', HeaderMiddleware, TicketController.newTicketFim);
router.post('/api/getTicketsUser', HeaderMiddleware, TicketController.getTicketsUser);
router.post('/api/checkIfAcompanhemento', HeaderMiddleware, TicketController.checkIfAcompanhamento);
router.post('/api/checkIfFinalizou', HeaderMiddleware, TicketController.checkIfFinalizou);

// Para Ticket Professor
router.post('/api/getTicketsWithoutSupervisor', HeaderMiddleware, TicketController.getTicketsWithoutSupervisor);
router.post('/api/getTicketsWithSupervisor', HeaderMiddleware, TicketController.getTicketsWithSupervisor);
router.post('/api/getClosedTicketsWithSupervisor', HeaderMiddleware, TicketController.getClosedTicketsWithSupervisor);
router.post('/api/feedbackTicket', HeaderMiddleware, TicketController.feedbackTicket);
// router.post('/api/getPdfUrl', TicketController.getPdfUrl);

// Para teste
router.get('/api/users', HeaderMiddleware, UserController.users);
router.get('/api/courses', HeaderMiddleware, CourseController.courses);
router.get('/api/tickets', HeaderMiddleware, TicketController.tickets);
router.get('/api/estagios', HeaderMiddleware, EstagioController.estagios);

// Limpar BD
router.get('/api/limparBanco', HeaderMiddleware, EstagioController.limparBanco);

router.post('/api/documents', HeaderMiddleware, DocumentController.documents);

module.exports = router;
