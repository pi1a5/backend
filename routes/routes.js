var express = require("express");
const CourseController = require("../controllers/CourseController");
const DocumentController = require("../controllers/DocumentController");
const EstagioController = require("../controllers/EstagioController");
var router = express.Router();
const HomeController = require("../controllers/HomeController");
const TicketController = require("../controllers/TicketController");
const UserController = require("../controllers/UserController");

router.get('/', HomeController.index);

// Para Usuario
router.post('/api/login', UserController.login);
router.post('/api/newUser', UserController.newUser);
router.post('/api/user', UserController.user);

// Para Curso
router.post('/api/setCourse', UserController.setCourse);

// Para Ticket
router.post('/api/newTicketInicio', TicketController.newTicketInicio);
router.post('/api/getTicketsUser', TicketController.getTicketsUser);
router.post('/api/checkIfAcompanhemento', TicketController.checkIfAcompanhamento);

router.get('/api/getTicketsWithoutSupervisor ', TicketController.getTicketsWithoutSupervisor);
//router.post('/api/getTicketsWithSupervisor  ', TicketController.getTicketsWithSupervisor);
//router.post('/api/getClosedTicketsWithSupervisor  ', TicketController.getClosedTicketsWithSupervisor);

// Para teste
router.get('/api/users', UserController.users);
router.get('/api/courses', CourseController.courses);
router.get('/api/tickets', TicketController.tickets);
router.get('/api/estagios', EstagioController.estagios);


router.post('/api/documents', DocumentController.documents);


module.exports = router;
