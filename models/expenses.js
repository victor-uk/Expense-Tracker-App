const { Schema, model } = require('mongoose')
const User = require('./users')
const { mapValidator } = require('../middleware/validation')


const ExpenseSchema = new Schema({
  description: {
    type: String,
    trim: true,
    maxLength: [100, 'Cannot exceed length']
  },
  productDetails: {
    type: Map,
    of: Number,
    required: true,
    validate: {
      validator: mapValidator,
      message: 'Each product must have a value.'
    }
  },
  splitAllocation: {
    type: Map,
    of: Number,
    required: true,
    default: () => ({ Uncategorized: 0 }),
    validate: {
      validator: mapValidator,
      message: 'Each split allocation must have a value.'
    }

  },
  total: {
    type: Number,
    min: [100, 'Cannot go lower']
  },
  spentBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

ExpenseSchema.index({ description: 1 })
ExpenseSchema.index({ spentBy: 1 })

// Checks whether expense category is present in user defined categories
ExpenseSchema.pre('validate', async function (next) {
  const splitAllocation = this.splitAllocation
  let keys
  if (splitAllocation instanceof Map) {
    keys = Array.from(splitAllocation.keys())
  } else {
    keys = Object.keys(splitAllocation)
  }
  for (const key of keys) {
    const isPresent = await User.findOne({ categories: key })
    if (!isPresent) {
      return next(new Error(`Category ${key} is not valid for any user`))
    }
  }
  next()
})


module.exports = model('Expense', ExpenseSchema)

