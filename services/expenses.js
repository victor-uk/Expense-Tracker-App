// services/expenses.js
const Expense = require('../models/expenses')
const { createCustomError } = require('../error/custom-error')
const { StatusCodes } = require('http-status-codes')


async function getAllExpensesService (params) {
  const {
    search,
    category,
    total,
    startDate,
    endDate,
    sort,
    field,
    limit,
    page,
    maxAmount,
    minAmount,
    user_id
  } = params

  const queryObject = {}
  if (search) {
    queryObject.$or = [
      { description: { $regex: search, $options: 'i' } },
      { productDetails: { $regex: search, $options: 'i' } }
    ]
  }
  if (category) {
    queryObject[`splitAllocation.${category}`] = { $exists: true }
  }
  if (total) {
    queryObject.total = total
  }
  if (startDate && endDate) {
    if (startDate < 0 || endDate) {
      throw createCustomError('Invalid time value', StatusCodes.BAD_REQUEST)
    }
    queryObject.$and = [{}]
  }
  if (maxAmount && minAmount) {
    queryObject.$and = [
      { total: { $gte: minAmount } },
      { total: { $lte: maxAmount } }
    ]
  }
  if (maxAmount) {
    queryObject.total = { $lte: maxAmount }
  }
  if (minAmount) {
    queryObject.total = { $gte: minAmount }
  }

  let results = Expense.find({ spentBy: user_id, ...queryObject })

  if (sort) {
    const sortList = sort.split(',').join(' ')
    results = results.sort(sortList)
  } else {
    results = results.sort('-createdAt')
  }
  if (field) {
    const fieldList = field.split(',').join(' ')
    results = results.select(fieldList)
  }
  if (limit) {
    results = results.limit(Number(limit))
  }
  if (page) {
    let numPerPage = limit || 10
    let pages = numPerPage * (Number(page) - 1)
    results = results.skip(pages).limit(numPerPage)
  }

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
  const updateData = {
    description,
    productDetails,
    splitAllocation,
    total,
    spentBy: user_id
  }
  return await Expense.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  })
}

module.exports = {
  getAllExpensesService,
  createExpenseService,
  updateExpenseService
}

