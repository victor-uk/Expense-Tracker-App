const Expense = require('../models/expenses')
const { StatusCodes } = require('http-status-codes')
const { getAllExpensesService, createExpenseService, updateExpenseService } = require('../services/expenses')

const getAllExpenses = async (req, res) => {
  const { user_id } = req.params
  const params = { ...req.query, user_id }
  const userExpenses = await getAllExpensesService(params)
  res.status(StatusCodes.OK).json({ nbHit: userExpenses.length, userExpenses })
}

const getSingleExpenses = async (req, res) => {
  const { id: expense_id } = req.params
  const singleExpense = await Expense.findById(expense_id)
  if (!singleExpense) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Expense not found' });
  }
  res.status(StatusCodes.OK).json({ singleExpense })
}

const createExpenses = async (req, res) => {
  const { user_id } = req.params
  const newExpense = await createExpenseService({ ...req.body, user_id })
  res.status(StatusCodes.OK).json({ newExpense })
}

const updateExpenses = async (req, res) => {
  const { user_id, id } = req.params
  const updatedExpense = await updateExpenseService(id, { ...req.body, user_id })
  if (!updatedExpense) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Expense not found' });
  }
  res.status(StatusCodes.OK).json({ success: true, data: updatedExpense })
}

const deleteExpenses = async (req, res) => {
  const { id } = req.params
  const deletedExpense = await Expense.findByIdAndDelete(id)
  if (!deletedExpense) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Expense not found' });
  }
  res.status(StatusCodes.OK).json({ success: true, message: "Expense successfully deleted" })
}

module.exports = {
  getAllExpenses,
  getSingleExpenses,
  createExpenses,
  updateExpenses,
  deleteExpenses,
}
