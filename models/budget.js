const { Schema, model } = require('mongoose')
const { mapValidator } = require('../middleware/validation')

const BudgetSchema = new Schema({
  description: {
    type: String
  },
  month: {
    type: String,
    match: [/^\d{4}-\d{2}$/, "Invalid input"],
    required: true,
    trim: true
  },
  budget: {
    type: Map,
    of: Number,
    required: true,
    validate: {
      validator: mapValidator,
      message: "Each budget must have a value"
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

module.exports = model('Budget', BudgetSchema)
