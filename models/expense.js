
const mongoose = require('mongoose')
const validator = require('validator')

const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['Groceries', 'Leisure', 'Electronics', 'Utilities', 'Clothing', 'Health', 'Others'],
        required: true,
        default: 'Other'
    },
    description:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
    }
})

const expenseModel = mongoose.model('Expense', expenseSchema)

module.exports = expenseModel