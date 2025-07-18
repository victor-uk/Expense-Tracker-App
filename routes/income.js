const express = require('express')
const { verifyUser } = require('../middleware/authentication')
const { validateNewIncome } = require('../middleware/validation')
const { getAllIncomes, getSingleIncome, createIncome, updateIncome, deleteIncome } = require('../controllers/income')
const router = express.Router({ mergeParams: true })

router.use(verifyUser)

router.route('/').get(getAllIncomes).post(validateNewIncome, createIncome)
router.route('/:id').get(getSingleIncome).patch(updateIncome).delete(deleteIncome)

module.exports = router

