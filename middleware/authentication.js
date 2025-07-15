/*global process*/
const { StatusCodes } = require('http-status-codes')
const bcrypt = require('bcryptjs')
const User = require('../models/users')
const { createCustomError } = require('../error/custom-error')
const jwt = require('jsonwebtoken')

const authenticateUser = async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email })
  if (!user) {
    throw createCustomError('Unknown email', StatusCodes.FORBIDDEN)
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw createCustomError('Incorrect password', StatusCodes.FORBIDDEN) // Invalid credentials
  }
  req.user = user
  next()
}

const verifyUser = (req, res, next) => {
  const { authorization } = req.headers
  const array = authorization && authorization.split(' ')
  if (!array || array[0] !== 'Bearer') { // accessToken
    throw createCustomError('Unknown user', StatusCodes.FORBIDDEN)
  }
  try {
    const decoded = jwt.verify(array[1], process.env.JWT_SECRET)
    req.user = decoded
  } catch (error) {
    throw createCustomError('Unknown user', error.message, StatusCodes.FORBIDDEN)
  }
  next()
}

module.exports = {
  authenticateUser,
  verifyUser
}
