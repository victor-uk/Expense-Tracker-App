const { createCustomError } = require('../error/custom-error')
const { StatusCodes } = require('http-status-codes')

function buildQueryObject(params) {
  const {
    search,
    category,
    total,
    startDate,
    endDate,
    time,
    maxAmount,
    minAmount,
    categoryField = 'category',
    isExpense = false
  } = params

  const queryObject = {}

  // Search functionality
  if (search) {
    queryObject.$or = [
      { description: { $regex: search, $options: 'i' } },
      { productDetails: { $regex: search, $options: 'i' } }
    ]
  }

  // Category filtering
  if (category) {
    if (isExpense) {
      queryObject[`splitAllocation.${category}`] = { $exists: true }
    } else {
      queryObject[categoryField] = category
    }
  }

  // Exact total amount
  if (total) {
    queryObject.total = total
  }

  // Date range filtering
  if (startDate && endDate) {
    if (startDate < 0 || endDate < 0) {
      throw createCustomError('Invalid time value', StatusCodes.BAD_REQUEST)
    }
    queryObject.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  } else if (time) {
    if (time < 0) {
      throw createCustomError('Invalid time value', StatusCodes.BAD_REQUEST)
    }
  }

  // Amount range filtering
  if (maxAmount && minAmount) {
    queryObject.$and = [
      { total: { $gte: minAmount } },
      { total: { $lte: maxAmount } }
    ]
  } else if (maxAmount) {
    queryObject.total = { $lte: maxAmount }
  } else if (minAmount) {
    queryObject.total = { $gte: minAmount }
  }

  return queryObject
}

function applyQueryOperations(query, params) {
  const { sort, field, limit, page } = params

  // Sorting
  if (sort) {
    const sortList = sort.split(',').join(' ')
    query = query.sort(sortList)
  } else {
    query = query.sort('-createdAt')
  }

  // Field selection
  if (field) {
    const fieldList = field.split(',').join(' ')
    query = query.select(fieldList)
  }

  // Pagination
  if (page) {
    const numPerPage = limit || 10
    const pages = numPerPage * (Number(page) - 1)
    query = query.skip(pages).limit(numPerPage)
  } else if (limit) {
    query = query.limit(Number(limit))
  }

  return query
}

module.exports = {
  buildQueryObject,
  applyQueryOperations
} 