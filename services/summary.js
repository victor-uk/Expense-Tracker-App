const expenseSummaryPipeline = require('../aggregationPipelines/expenseSummary.pipeline')
const incomeSummaryPipeline = require('../aggregationPipelines/incomeSummary.pipeline')
const Expense = require('../models/expenses')
const Income = require('../models/income')
const Summary = require('../models/summaries')

const generateSummary = async () => {
  // using the aggregation pipeline:
  const expenseSummaries = await Expense.aggregate(expenseSummaryPipeline())
  const incomeSummaries = await Income.aggregate(incomeSummaryPipeline())

  const date = new Date()
  const summariesMap = new Map()

  //Merges expenseSummaries and incomeSummaries for each user
  for (const exp of expenseSummaries) {
    summariesMap.set(exp._expenseSummaryId.toString(), {
      userId: exp._expenseSummaryId,
      month: `${date.getMonth() + 1 }-${date.getFullYear()}`,
      expense: {
        totalExpense: exp.totalExpense,
        byCategory: exp.byCategory
      },
      income: {
        totalIncome: 0,
        byCategory: []
      }
    })
  }

  for (const inc of incomeSummaries) {
    const key = inc._incomeSummaryId.toString()

    if (summariesMap.has(key)) {
      summariesMap.get(key).income = {
        totalIncome: inc.totalIncome,
        byCategory: inc.byCategory
      }
    } else {
      summariesMap.set(key, {
        userId: inc._incomeSummaryId,
        month: `${date.getMonth() + 1}-${date.getFullYear()}`,
        income: {
          totalIncome: inc.totalIncome,
          byCategory: inc.byCategory
        },
        expense: {
          totalExpense: 0,
          byCategory: []
        }
      })
    }
  }

  // Puts the data in an array for uploading
  const mergedSummaries = Array.from(summariesMap.values())
  await Summary.bulkWrite(
    mergedSummaries.map(summary =>{
      return {
        updateOne: {
          filter: {userId: summary.userId, month: summary.month},
          update: { $set: summary},
          upsert: true
        }
      }
    })
  )
}

module.exports = generateSummary
