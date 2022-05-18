var express = require("express");
const CourseController = require("../controllers/CourseController");
var router = express.Router();
const HomeController = require("../controllers/HomeController");
const TicketController = require("../controllers/TicketController");
const UserController = require("../controllers/UserController");

router.get('/', HomeController.index);
router.post('/api/login', UserController.login);
router.post('/api/newUser', UserController.newUser);
router.post('/api/user', UserController.user);
router.post('/api/setCourse', UserController.setCourse);

// Para teste
router.get('/api/users', UserController.users);
router.get('/api/courses', CourseController.courses);
router.get('/api/tickets', TicketController.tickets);

module.exports = router;
