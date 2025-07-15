const Income = require('../models/income')
const { createCustomError } = require('../error/custom-error')
const { StatusCodes } = require('http-status-codes')

async function getAllIncomeService(params) {
  const {
    search,
    category,
    total,
    time,
    sort,
    field,
    limit,
    page,
    maxAmount,
    minAmount,
    user_id
  } = params;

  const queryObject = {};
  if (search) {
    queryObject.$or = [
      { description: { $regex: search, $options: 'i' } },
      { productDetails: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) {
    queryObject.category = category;
  }
  if (total) {
    queryObject.total = total;
  }
  if (time) {
    if (time < 0) {
      throw createCustomError('Invalid time value', StatusCodes.BAD_REQUEST);
    }
    let expenseAge = { $subtract: [new Date(), '$createdAt'] };
    let timeInMilli = time * 24 * 60 * 60000;
    queryObject.$expr = { $lte: [expenseAge, timeInMilli] };
  }
  if (maxAmount && minAmount) {
    queryObject.$and = [
      { total: { $gte: minAmount } },
      { total: { $lte: maxAmount } }
    ];
  }
  if (maxAmount) {
    queryObject.total = { $lte: maxAmount };
  }
  if (minAmount) {
    queryObject.total = { $gte: minAmount };
  }

  let results = Income.find({ ownedBy: user_id, ...queryObject });

  if (sort) {
    const sortList = sort.split(',').join(' ');
    results = results.sort(sortList);
  } else {
    results = results.sort('-createdAt');
  }
  if (field) {
    const fieldList = field.split(',').join(' ');
    results = results.select(fieldList);
  }
  if (limit) {
    results = results.limit(Number(limit));
  }
  if (page) {
    let numPerPage = limit || 10;
    let pages = numPerPage * (Number(page) - 1);
    results = results.skip(pages).limit(numPerPage);
  }

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
