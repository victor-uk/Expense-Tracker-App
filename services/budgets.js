const Budget = require('../models/budget')
const { buildQueryObject, applyQueryOperations } = require('../utils/queryBuilder')

async function getAllBudgetsService(params) {
  const { user_id, ...queryParams } = params

  // Build query object using utility
  const queryObject = buildQueryObject({
    ...queryParams,
    isExpense: false,
    categoryField: 'month' // Use month as the category field for budgets
  })

  // Create base query
  let results = Budget.find({ createdBy: user_id, ...queryObject })

  // Apply query operations using utility
  results = applyQueryOperations(results, queryParams)

  return await results
}

async function getSingleBudgetService(id) {
  return await Budget.findById(id)
}

async function createBudgetService(data) {
  const { user_id, ...budgetData } = data
  return await Budget.create({
    ...budgetData,
    createdBy: user_id
  })
}

async function updateBudgetService(id, data) {
  return await Budget.findByIdAndUpdate(id, data, { 
    new: true, 
    runValidators: true 
  })
}

async function deleteBudgetService(id) {
  return await Budget.findByIdAndDelete(id)
}

module.exports = {
  getAllBudgetsService,
  getSingleBudgetService,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService
} 