const getExpenseSummaryPipeline = () => {
  let monthEnd = new Date()
  let monthBeginning = new Date()
  let startToEndDateDiff = monthEnd.getDate() - 1
  monthBeginning.setDate(monthEnd.getDate() - startToEndDateDiff)

  return [
    {
      $match: {
        createdAt: {
          $gte: monthBeginning,
          $lte: monthEnd
        }
      }
    },
    {
      $project: {
        _id: 0,
        splitAllocation: { $objectToArray: '$splitAllocation' },
        spentBy: 1
      }
    },
    { $unwind: '$splitAllocation' },
    {
      $group: {
        _id: {
          user: '$spentBy',
          category: '$splitAllocation.k'
        },
        total: { $sum: '$splitAllocation.v' }
      }
    },
    {
      $group: {
        _id: '$_id.user',
        byCategory: {
          $push: {
            category: '$_id.category',
            total: '$total'
          }
        },
        totalExpense: { $sum: '$total' }
      }
    },
    {
      $set: {
        _expenseSummaryId: '$_id'
      }
    },
    {
      $unset: '_id'
    }
  ]
}

module.exports = getExpenseSummaryPipeline
