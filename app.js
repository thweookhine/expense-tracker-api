const express = require('express')
const app = express();
const userRouter = require('./routes/user')
const expenseRouter = require('./routes/expense')

app.use(express.json())

app.use('/api/user', userRouter)
app.use('/api/expense', expenseRouter)

module.exports = {app}
