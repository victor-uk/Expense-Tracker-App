const Income = require('../models/income')
const { buildQueryObject, applyQueryOperations } = require('../utils/queryBuilder')

async function getAllIncomeService(params) {
  const { user_id, ...queryParams } = params;

  // Build query object using utility
  const queryObject = buildQueryObject({
    ...queryParams,
    isExpense: false
  });

  // Create base query
  let results = Income.find({ ...queryObject, ownedBy: user_id });

  // Apply query operations using utility
  results = applyQueryOperations(results, queryParams);

  return await results;
}

async function getSingleIncomeService(id) {
  return await Income.findById(id);
}

async function createIncomeService(data) {
  const { description, category, amount, user_id} = data
  return await Income.create({
    description,
    category,
    amount,
    ownedBy: user_id
  });
}

async function updateIncomeService(id, data) {
  return await Income.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteIncomeService(id) {
  return await Income.findByIdAndDelete(id);
}

module.exports = {
  getAllIncomeService,
  getSingleIncomeService,
  createIncomeService,
  updateIncomeService,
  deleteIncomeService
};
