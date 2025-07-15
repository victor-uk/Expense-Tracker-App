require('dotenv').config()
const User = require('../models/users')
const { StatusCodes } = require('http-status-codes')

const login = async (req, res) => {
  const { user } = req
  
  const token = user.createJWT() // mongoose middleware
  res.status(StatusCodes.OK).json({ token, msg: "Logged In" })
}

const signup = async (req, res) => {
    const { name, email, password } = req.body
    const user = await User.create({ name, email, password })
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({ user: user, token, msg: "Registration successful" })
}

module.exports = {
  login,
  signup
}
