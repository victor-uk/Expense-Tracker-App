const express = require('express')
const { verifyUser } = require('../middleware/authentication')
const { getUserMonthlySummary } = require('../controllers/summaries')
const router = express.Router({ mergeParams: true})

router.use(verifyUser)
router.route('/').get(getUserMonthlySummary)

module.exports = router