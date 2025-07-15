const { model, Schema } = require('mongoose')

const SummarySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    trim: true,
    required: true,
    match: [/^(0?[1-9]|1[0-2])-\d{4}$/, `Invalid month format, input should be like ${new Date().getMonth()}-${new Date().getFullYear()}`]
  },
  expense: {
    totalExpense: Number,
    byCategory: [
      {
        category: String,
        total: Number
      }
    ]
  },
  income: {
    totalIncome: Number,
    byCategory: [
      {
        category: String,
        total: Number
      }
    ]
  },
  createdAt: {
    type: Date,
    default: new Date
  }
})

module.exports = model('Summary', SummarySchema)
