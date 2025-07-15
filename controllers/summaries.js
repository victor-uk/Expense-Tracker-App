const { ReasonPhrases, StatusCodes } = require("http-status-codes")
const { createCustomError } = require("../error/custom-error")
const Summary = require("../models/summaries")

const getUserMonthlySummary = (req, res) => {
    const { user_id: userId } = req.params
    const { month } = req.query

    const monthlySummary = Summary.findOne({ userId: userId, month: month})
    if (!monthlySummary) {
        throw createCustomError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({status: 'success', monthlySummary})
}

module.exports = {
    getUserMonthlySummary
}