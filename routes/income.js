const express = require('express')
const { verifyUser } = require('../middleware/authentication')
const { validateNewIncome } = require('../middleware/validation')
const router = express.Router({ mergeParams: true })

router.use(verifyUser)

router.route('/').get().post(validateNewIncome)
router.route('/:id').get().patch().delete()

module.exports = router

