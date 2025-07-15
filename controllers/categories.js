const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const User = require('../models/users')
const Expense = require('../models/expenses')
const { createCustomError } = require('../error/custom-error')

const updateUserCategory = async (req, res) => {
  const { category } = req.body
  const { id } = req.params
  const categories = await User.findByIdAndUpdate(
    id,
    { $addToSet: { categories: category } },
    { new: true, runValidators: true }
  )
  res.status(StatusCodes.OK).json({ categories })
}

const deleteUserCategory = async (req, res) => {
  const { category } = req.body
  const { id } = req.params

  const categories = await User.findByIdAndUpdate(
    id,
    { $pull: { categories: category } },
    { new: true, runValidators: true }
  )
  if (!categories) {
    throw createCustomError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND)
  }
  let field = `splitAllocation.${category}`
  const expensesWithCategory = await Expense.updateMany(
    { [field]: { $exists: true } },
    [
      { $set: { 'splitAllocation.Uncategorised': `$${field}` } },
      { $unset: field }
    ]
  )

  res.status(StatusCodes.OK).json({ categories, expensesWithCategory })
}

module.exports = { updateUserCategory, deleteUserCategory }
