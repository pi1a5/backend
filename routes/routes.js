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
const SessionController = require('../controllers/SessionsController');
const UserController = require('../controllers/UserController');
const HeaderMiddleware = require('../middleware/httpHeaders');
const ChartController = require('../controllers/ChartController');

const router = express.Router();

const options = {
  explorer: true,
  defaultModelsExpandDepth: -1,
  customCss: 'body { background-color: yellow; }',
};

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument, false, options));

router.get('/', HeaderMiddleware, HomeController.index);

// Para google

router.get('/api/oauth/google', SessionController.googleOauthHandler);

// Para Usuario
router.post('/api/login', HeaderMiddleware, UserController.login);
router.post('/api/user', HeaderMiddleware, UserController.user);
router.post('/api/setCourseProntuario', HeaderMiddleware, UserController.setCourseProntuario);
router.post('/api/getUserProfile', HeaderMiddleware, UserController.getUserProfile);
router.post('/api/getUserSupervisor', HeaderMiddleware, UserController.getUserSupervisor);
router.post('/api/getUserInternshipData', HeaderMiddleware, UserController.getUserInternshipData);
router.post('/api/getSupervisorsByArea', HeaderMiddleware, UserController.getSupervisorsByArea);
router.get('/api/getSupervisors', HeaderMiddleware, UserController.getSupervisors);
router.post('/api/deleteSupervisor', HeaderMiddleware, UserController.deleteSupervisor);
router.post('/api/getStatus', HeaderMiddleware, UserController.getStatus);

// Para Processos

router.post('/api/findAllByCourse', HeaderMiddleware, ProcessoController.findAllByArea);
router.post('/api/deleteProcesso', HeaderMiddleware, ProcessoController.deleteProcesso);
router.post('/api/createNewProcesso', HeaderMiddleware, ProcessoController.createNewProcesso);
router.post('/api/updateProcesso', HeaderMiddleware, ProcessoController.updateProcesso);
router.post('/api/getAllBySupervisor', HeaderMiddleware, ProcessoController.getAllBySupervisor);

// Para estagios

router.post('/api/createNewEstagio', HeaderMiddleware, EstagioController.createNewEstagio);
router.post('/api/checkIfHasEstagio', HeaderMiddleware, EstagioController.checkIfHasEstagio);
router.get('/api/limparEstagios', HeaderMiddleware, EstagioController.limparEstagios);
router.post('/api/checkIfEnded', HeaderMiddleware, EstagioController.checkIfEnded);
router.post('/api/endInternship', HeaderMiddleware, EstagioController.endInternship);
router.post('/api/transferInternship', HeaderMiddleware, EstagioController.transferInternship);

// Para Ticket Aluno
router.post('/api/getTicketsUser', HeaderMiddleware, TicketController.getTicketsUser);
router.post('/api/getTicketForm', HeaderMiddleware, TicketController.getTicketForm);
router.post('/api/updateLatestTicket', HeaderMiddleware, TicketController.updateLatestTicket);
router.post('/api/newTicket', HeaderMiddleware, TicketController.newTicket);
router.post('/api/getPendingTicket', HeaderMiddleware, TicketController.getPendingTicket);
router.post('/api/getClosedTickets', HeaderMiddleware, TicketController.getClosedTickets);
router.post('/api/deletePendingTicket', HeaderMiddleware, TicketController.deletePendingTicket);

// Para Ticket Professor
router.post('/api/getTicketsWithoutSupervisor', HeaderMiddleware, TicketController.getTicketsWithoutSupervisor);
router.post('/api/getTicketsWithSupervisor', HeaderMiddleware, TicketController.getTicketsWithSupervisor);
router.post('/api/getClosedTicketsWithSupervisor', HeaderMiddleware, TicketController.getClosedTicketsWithSupervisor);
router.post('/api/feedbackTicket', HeaderMiddleware, TicketController.feedbackTicket);
// router.post('/api/getPdfUrl', TicketController.getPdfUrl);

// Para curso
router.post('/api/createCourse', HeaderMiddleware, CourseController.createCourse);
router.post('/api/deleteCourse', HeaderMiddleware, CourseController.deleteCourse);
router.get('/api/getAreasWithCourses', HeaderMiddleware, CourseController.getAreasWithCourses);
router.post('/api/createArea', HeaderMiddleware, CourseController.createArea);
router.post('/api/deleteArea', HeaderMiddleware, CourseController.deleteArea);
router.post('/api/updateArea', HeaderMiddleware, CourseController.updateArea);
router.get('/api/getModalities', HeaderMiddleware, CourseController.getModalities);

// Para teste
router.get('/api/users', HeaderMiddleware, UserController.users);
router.get('/api/courses', HeaderMiddleware, CourseController.courses);
router.get('/api/tickets', HeaderMiddleware, TicketController.tickets);
router.get('/api/estagios', HeaderMiddleware, EstagioController.estagios);
router.get('/api/processos', HeaderMiddleware, ProcessoController.processos);
router.get('/api/createExample', HeaderMiddleware, ProcessoController.createExample);
router.post('/api/deletar', HeaderMiddleware, DocumentController.delete);
router.get('/api/testeRotas', HeaderMiddleware, UserController.teste);
router.get('/api/createRandomStudent', HeaderMiddleware, UserController.createRandomStudent);

// Para Gráficos
router.post('/api/checkOrientadoresAmount', HeaderMiddleware, ChartController.checkOrientadoresAmount);
router.post('/api/getInternshipsAmountByStatus', HeaderMiddleware, ChartController.getInternshipsAmountByStatus);
router.post('/api/getInternshipsAmountByCourse', HeaderMiddleware, ChartController.getInternshipsAmountByCourse);
router.post('/api/getTicketsStatusByDate', HeaderMiddleware, ChartController.getTicketsStatusByDate);
router.post('/api/getInternshipsAmountByMonth', HeaderMiddleware, ChartController.getInternshipsAmountByMonth);


// Limpar BD
router.get('/api/limparBanco', HeaderMiddleware, ProcessoController.limparBanco);
router.post('/api/documents', HeaderMiddleware, DocumentController.documents);

module.exports = router;
