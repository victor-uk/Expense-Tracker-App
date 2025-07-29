const cron = require('node-cron')
const generateSummary = require('./services/summary')
const connectDB = require('./db/connect')
const app = require('./app')

require('dotenv').config()

const port = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`server is listening on port ${port}`);
        })
        task.start()
    } catch (error) {
        console.log(error);
    }
}

// Runs the schedule by 10pm at the 28-31st of every month
const task = cron.schedule('* 22 28-31 * *', generateSummary, { noOverlap: true })



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
