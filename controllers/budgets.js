const { StatusCodes } = require('http-status-codes')
const {
  getAllBudgetsService,
  getSingleBudgetService,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService
} = require('../services/budgets')

const getAllBudgets = async (req, res) => {
  const { id: user_id } = req.user.user
  const params = { ...req.query, user_id }
  const budgets = await getAllBudgetsService(params)
  res.status(StatusCodes.OK).json({ success: true, data: budgets })
}

const getSingleBudget = async (req, res) => {
  const { id } = req.params
  const budget = await getSingleBudgetService(id)
  if (!budget) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Budget not found' })
  }
  res.status(StatusCodes.OK).json({ success: true, data: budget })
}

const createBudget = async (req, res) => {
  const { id: user_id } = req.user.user
  const budget = await createBudgetService({ ...req.body, user_id })
  res.status(StatusCodes.CREATED).json({ success: true, data: budget })
}

const updateBudget = async (req, res) => {
  const { id } = req.params
  const budget = await updateBudgetService(id, req.body)
  if (!budget) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Budget not found' })
  }
  res.status(StatusCodes.OK).json({ success: true, data: budget })
}

const deleteBudget = async (req, res) => {
  const { id } = req.params
  const budget = await deleteBudgetService(id)
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
