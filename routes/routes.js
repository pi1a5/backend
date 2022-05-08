var express = require("express")
var router = express.Router()
const HomeController = require("../controllers/HomeController")
const UserController = require("../controllers/UserController")

router.get('/', HomeController.index)
router.post('/api/newUser', UserController.newUser)
router.get('/api/users', UserController.users)

module.exports = router