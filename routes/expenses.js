const express = require('express')
const router = express.Router({ mergeParams: true }) // mergeParams allows access to user_id
const {
  getAllExpenses,
  createExpenses,
  getSingleExpenses,
  updateExpenses,
  deleteExpenses
} = require('../controllers/expenses')
const { validateNewExpense } = require('../middleware/validation')
const { verifyUser } = require('../middleware/authentication')

// Apply verifyUser middleware to all routes in this router
router.use(verifyUser)

router
  .route('/')
  .get(getAllExpenses)
  .post(validateNewExpense, createExpenses)
router
  .route('/:id')
  .get(getSingleExpenses)
  .patch(updateExpenses)
  .delete(deleteExpenses)

module.exports = router
