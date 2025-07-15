const { Router } = require('express')
const { login, signup } = require('../controllers/auth')
const { validateSignup, validateLogin } = require('../middleware/validation')
const { authenticateUser } = require('../middleware/authentication')
const router = Router()

router.post('/login', validateLogin, authenticateUser, login)
router.post('/signup', validateSignup, signup)

module.exports = router