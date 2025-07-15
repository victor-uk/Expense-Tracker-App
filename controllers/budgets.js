// controllers/budgets.js

const Budget = require('../models/budget')
const { StatusCodes } = require('http-status-codes')

const getAllBudgets = async (req, res) => {
  const { user_id } = req.params
  const { month } = req.query``
  const queryObject = {}
  if (month) {
    queryObject.month = month
  }
  const budgets = await Budget.find({ ...queryObject, createdBy: user_id}).sort('-createdAt')
  res.status(StatusCodes.OK).json({ success: true, data: budgets })
}

const getSingleBudget = async (req, res) => {
  const { id } = req.params
  const budget = await Budget.findById(id)
  if (!budget) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Budget not found' })
  }
  res.status(StatusCodes.OK).json({ success: true, data: budget })
}

const createBudget = async (req, res) => {
  const { user_id } = req.params
  const budget = await Budget.create({...req.body, createdBy: user_id})
  res.status(StatusCodes.CREATED).json({ success: true, data: budget })
}

const updateBudget = async (req, res) => {
  const { id } = req.params
  const budget = await Budget.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
  if (!budget) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Budget not found' })
  }
  res.status(StatusCodes.OK).json({ success: true, data: budget })
}

const deleteBudget = async (req, res) => {
  const { id } = req.params
  const budget = await Budget.findByIdAndDelete(id)
  if (!budget) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Budget not found' })
  }
  res.status(StatusCodes.OK).json({ success: true, message: 'Budget deleted successfully' })
}

module.exports = {
  getAllBudgets,
  getSingleBudget,
  createBudget,
  updateBudget,
  deleteBudget,
}
