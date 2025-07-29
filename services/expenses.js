// services/expenses.js
const Expense = require('../models/expenses')
const { buildQueryObject, applyQueryOperations } = require('../utils/queryBuilder')

async function getAllExpensesService (params) {
  const { user_id, ...queryParams } = params

  // Build query object using utility
  const queryObject = buildQueryObject({
    ...queryParams,
    isExpense: true
  })

  // Create base query
  let results = Expense.find({ spentBy: user_id, ...queryObject })

  // Apply query operations using utility
  results = applyQueryOperations(results, queryParams)

  return await results
}

async function createExpenseService (data) {
  let { description, productDetails, splitAllocation, user_id } = data
  const total = Object.values(productDetails).reduce((acc, key) => acc + key, 0)
  if (!splitAllocation) {
    splitAllocation = { Uncategorised: total }
  }
  return await Expense.create({
    description,
    productDetails,
    splitAllocation,
    total,
    spentBy: user_id
  })
}

async function updateExpenseService (id, data) {
  const { description, productDetails, splitAllocation, user_id } = data
  const total = Object.values(splitAllocation).reduce(
    (acc, key) => acc + key,
    0
  )
  const updatedData = {
    description,
    productDetails,
    productDetails,
    splitAllocation,
    spentBy: user_id,
    total
  }
  return await Expense.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true })
}
  
  module.exports = {
    getAllExpensesService,
    createExpenseService,
    updateExpenseService
  }

