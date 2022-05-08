var express = require("express")
var router = express.Router()
const HomeController = require("../controllers/HomeController")
const UserController = require("../controllers/UserController")

router.get('/', HomeController.index)
router.post('/api/auth', UserController.auth)

module.exports = router