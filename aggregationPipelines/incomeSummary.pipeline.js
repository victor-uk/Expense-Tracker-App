const getIncomeSummaryPipeline = () => {
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
        category: 1,
        amount: 1,
        ownedBy: 1
      }
    },
    {
      $group: {
        _id: {
          userId: '$ownedBy',
          category: '$category'
        },
        total: {
          $sum: '$amount'
        }
      }
    },
    {
      $group: {
        _id: '$_id.userId',
        byCategory: {
          $push: {
            category: '$_id.category',
            total: '$total'
          }
        },
        total: { $sum: '$total' }
      }
    },
    {
      $set: { _incomeSummaryId: '$_id' }
    },
    {
      $unset: '_id'
    }
  ]
}

module.exports = getIncomeSummaryPipeline
