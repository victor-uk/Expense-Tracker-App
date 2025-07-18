/*global process */
require('express-async-errors')
const express = require('express')
const connectDB = require('./db/connect')
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
const generateSummary = require('./services/summary')
const cron = require('node-cron')

require('dotenv').config()



app.use(express.json())
app.use(morgan('short'))
app.use('/api/v1/', auth)
app.use('/api/v1/:user_id/expenses', expenses)
app.use('/api/v1/users', users)
app.use('/api/v1/:user_id/incomes', incomes)
app.use('/api/v1/:user_id/budgets', budgets)
app.use('/api/v1/:user_id/summaries', summaries)


app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`server is listening on port ${port}`);
        })
    } catch (error) {
        console.log(error);
    }
}


const task = cron.schedule('* 22 28-31 * *', generateSummary, { noOverlap: true })

task.start()

task.on('execution:started', (ctx) => {
  console.log('Execution started at', ctx.date, 'Reason:', ctx.execution?.reason);
});

task.on('execution:finished', (ctx) => {
  console.log('Execution finished. Result:', ctx.execution?.result);
});

task.on('execution:failed', (ctx) => {
  console.error('Execution failed with error:', ctx.execution?.error?.message);
});

start()
