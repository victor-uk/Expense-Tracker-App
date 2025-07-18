const { StatusCodes } = require('http-status-codes')
const {
  getAllIncomeService,
  getSingleIncomeService,
  createIncomeService,
  updateIncomeService,
  deleteIncomeService
} = require('../services/income')

const getAllIncomes = async (req, res) => {
  const { user_id } = req.params
  const params = { ...req.query, user_id }
  
  const userIncomes = await getAllIncomeService(params)
  
  res.status(StatusCodes.OK).json({ nbHit: userIncomes.length, userIncomes })
}

const getSingleIncome = async (req, res) => {
  const { id: incomeId } = req.params
  const income = await getSingleIncomeService(incomeId)
  if (!income) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Income not found' })
  }
  res.status(StatusCodes.OK).json({ success: true, data: income })
}

const createIncome = async (req, res) => {
  const { user_id } = req.params
  const income = await createIncomeService({ ...req.body, user_id })
  res.status(StatusCodes.OK).json({ success: true, data: income })
}

const updateIncome = async (req, res) => {
  const { id } = req.params
  const income = await updateIncomeService(id, req.body)
  if (!income) {
    return res.status(404).json({ success: false, message: 'Income not found' })
  }
  res.status(StatusCodes.OK).json({ success: true, data: income })
}

const deleteIncome = async (req, res) => {
  const { id } = req.params
  const income = await deleteIncomeService(id)
  if (!income) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Income not found' })
  }
  res.status(StatusCodes.OK).json({ success: true, message: 'Income deleted successfully' })
}

module.exports = {
  getAllIncomes,
  getSingleIncome,
  createIncome,
  updateIncome,
  deleteIncome,
}
