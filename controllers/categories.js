const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const User = require('../models/users')
const Expense = require('../models/expenses')
const { createCustomError } = require('../error/custom-error')

const updateUserCategory = async (req, res) => {
  const { category } = req.body
  const { id } = req.params
  
  // Validate category is not empty
  if (!category || category.trim() === '') {
    throw createCustomError('Provide a category', StatusCodes.BAD_REQUEST)
  }
  
  const user = await User.findByIdAndUpdate(
    id,
    { $addToSet: { categories: category.trim() } },
    { new: true, runValidators: true }
  )
  if (!user) {
    throw createCustomError('Not Found', StatusCodes.NOT_FOUND)
  }

  res.status(StatusCodes.OK).json({ categories: user.categories })
}

const deleteUserCategory = async (req, res) => {
  const { category } = req.body
  const { id } = req.params

  // Validate category is not empty
  if (!category || category.trim() === '') {
    throw createCustomError('Provide a category', StatusCodes.BAD_REQUEST)
  }
  
  let field = `splitAllocation.${category.trim()}`
  const user = await User.findByIdAndUpdate(
    id,
    { $pull: { categories: category } },
    { new: true, runValidators: true }
  )
  
  if (!user) {
    throw createCustomError('Not Found', StatusCodes.NOT_FOUND)
  }
  
  const expensesWithCategory = await Expense.updateMany(
    { [field]: { $exists: true } },
    [
      { $set: { 'splitAllocation.Uncategorised': `$${field}` } },
      { $unset: field }
    ]
  )

  res.status(StatusCodes.OK).json({ 
    categories: user.categories, 
    expensesWithCategory 
  })
}

module.exports = { updateUserCategory, deleteUserCategory }
