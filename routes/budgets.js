const express = require('express')
const { verifyUser } = require('../middleware/authentication')
const {
  getAllBudgets,
  getSingleBudget,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgets')
const { validateBudget } = require('../middleware/validation')
const router = express.Router({ mergeParams: true })

router.use(verifyUser)
router.route('/').get(getAllBudgets).post(validateBudget, createBudget)
router.route('/:id').get(getSingleBudget).patch(updateBudget).delete(deleteBudget)

module.exports = router