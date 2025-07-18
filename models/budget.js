const { Schema, model } = require('mongoose')
const { mapValidator } = require('../middleware/validation')

const BudgetSchema = new Schema({
  description: {
    type: String
  },
  month: {
    type: String,
    match: [/^(0?[1-9]|1[0-2])-\d{4}$/, `Invalid month format, input should be like ${new Date().getMonth()}-${new Date().getFullYear()}`],
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
