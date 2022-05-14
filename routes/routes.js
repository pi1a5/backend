var express = require("express");
var router = express.Router();
const HomeController = require("../controllers/HomeController");
const UserController = require("../controllers/UserController");

router.get('/', HomeController.index);
router.post('/api/login', UserController.login);
router.post('/api/newUser', UserController.newUser);
router.post('/api/user', UserController.user);

// Para teste
router.get('/api/users', UserController.users);
router.get('/api/test', UserController.test);

module.exports = router;