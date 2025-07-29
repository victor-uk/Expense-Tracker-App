/*global process */
require('express-async-errors')
const express = require('express')
const app = express()
const expenses = require('./routes/expenses')
const incomes = require('./routes/income')
const auth = require('./routes/auth')
const users = require('./routes/users')
const budgets = require('./routes/budgets')
const summaries = require('./routes/summaries')
const errorHandler = require('./middleware/errorHandler')
const morgan = require('morgan')
const notFound = require('./middleware/notFound')

app.use(express.json())
app.use(morgan('short'))
app.use('/api/v1/', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/users/me/expenses', expenses)
app.use('/api/v1/users/me/incomes', incomes)
app.use('/api/v1/users/me/budgets', budgets)
app.use('/api/v1/users/me/summaries', summaries)


app.use(notFound)
app.use(errorHandler)



module.exports = app