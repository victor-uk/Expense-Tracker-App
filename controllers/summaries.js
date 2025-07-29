const { ReasonPhrases, StatusCodes } = require("http-status-codes")
const { createCustomError } = require("../error/custom-error")
const Summary = require("../models/summaries")
const Budget = require("../models/budget")


const getAllSummaries = async (req, res) => {
    const allSummaries = await Summary.find()
    if (!allSummaries) {
        res.status(404).send("Not found")
    }
    res.status(200).json({ allSummaries })
}

const getUserMonthlySummary = async (req, res) => {
    const { id: userId } = req.user.user
    const { month } = req.query
    const monthlySummary = await Summary.findOne({ userId: userId, month: month})
    const hasBudget = await Budget.findOne({ createdBy: userId, month: month})

    if (!monthlySummary) {
        throw createCustomError(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({status: 'success', data: { ...monthlySummary, hasBudget }})
}

module.exports = {
    getUserMonthlySummary,
    getAllSummaries
}