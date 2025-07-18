const express = require('express')
const { verifyUser } = require('../middleware/authentication')
const { getUserMonthlySummary, getAllSummaries } = require('../controllers/summaries')
const router = express.Router({ mergeParams: true})

router.use(verifyUser)
router.route('/').get(getUserMonthlySummary)
router.route('/all').get(getAllSummaries)

module.exports = router