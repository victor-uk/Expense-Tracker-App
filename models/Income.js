const { Schema, model } = require('mongoose')

const IncomeSchema = new Schema({
    description: {
        type: String,
        trim: true,
        maxLength: [100, 'Cannot exceed length']
    },
    category: {
        type: String,
        default: "Uncategorised",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    ownedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

IncomeSchema.index({ description: 1})
IncomeSchema.index({ category: 1})

module.exports = model("Income", IncomeSchema)

