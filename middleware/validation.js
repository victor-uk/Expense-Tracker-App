const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const { createCustomError } = require('../error/custom-error')
const User = require('../models/users')

const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    throw createCustomError(
      'Invalid user credentials ',
      StatusCodes.BAD_REQUEST
    )
  }
  if (password.length < 8 || password.length > 20) {
    throw createCustomError(
      'Password length must be between 8 and 20 characters',
      StatusCodes.BAD_REQUEST
    )
  }
  next()
}

const validateLogin = async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw createCustomError(
      'Invalid user credentials',
      StatusCodes.BAD_REQUEST
    )
  }
  if (password.length < 8 || password.length > 20) {
    throw createCustomError(
      'Invalid user credentials',
      StatusCodes.BAD_REQUEST
    )
  } // Technically, not needed
  const user = await User.findOne({ email: email })
  if (!user) {
    throw createCustomError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN)
  }
  next()
}

const validateNewExpense = (req, res, next) => {
  const { description, productDetails } = req.body

  if (!description || !productDetails) {
    throw createCustomError(
      'Provide description, and listing',
      StatusCodes.BAD_REQUEST
    )
  }
  next()
}
const validateNewIncome = (req, res, next) => {
  const { description, amount } = req.body

  if (!description || !amount) {
    throw createCustomError(
      'Provide description and amount',
      StatusCodes.BAD_REQUEST
    )
  }
  next()
}

const validateCategory = (req, res, next) => {
  const { category } = req.body
  if (!category) {
    throw createCustomError('Provide a category', StatusCodes.BAD_REQUEST)
  }
  next()
}

function mapValidator (v) {
  for (let value of v.values()) {
    if (value === undefined || value === null) return false
  }
  return true
}

const validateBudget = (req, res, next) => {
  const { month, budget } = req.body
  if (!month, !budget) {
    throw createCustomError("Provide a month and budget", StatusCodes.BAD_REQUEST)
  }
  next()
}

module.exports = {
  validateLogin,
  validateSignup,
  validateNewExpense,
  validateCategory,
  validateNewIncome,
  mapValidator,
  validateBudget
}
