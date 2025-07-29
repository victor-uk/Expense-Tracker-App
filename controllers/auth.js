require('dotenv').config()
const User = require('../models/users')
const { StatusCodes } = require('http-status-codes')

const login = async (req, res) => {
  const { user } = req
  
  const token = user.createJWT() // mongoose middleware
  res.status(StatusCodes.OK).json({ token, user, message: "Login successful" })
}

const signup = async (req, res) => {
    const { name, email, password } = req.body
    const user = await User.create({ name, email, password })
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({ user: user, token, message: "Registration successful" })
}

module.exports = {
  login,
  signup
}
