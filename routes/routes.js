var express = require("express")
var router = express.Router()
const HomeController = require("../controllers/HomeController")
const UserController = require("../controllers/UserController")

router.get('/', HomeController.index)
router.post('/api/newUser', UserController.newUser)

module.exports = router