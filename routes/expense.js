const express = require('express')
const jwt = require('jsonwebtoken')
const Expense = require('../models/expense')
const { body, validationResult } = require('express-validator')
const { verifyToken, getCurrentUser } = require('../middlewares/current-user')
const moment = require('moment')

const expenseRouter = express.Router()

expenseRouter.post('/create', 
    body('amount')
    .not()
    .isEmpty()
    .withMessage("Amount must be provided."),
    body('category')
    .not()
    .isEmpty()
    .withMessage("Category must be provided.")
    , getCurrentUser
    ,async (req, res) => {

    // Validation Check
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({message: "Validation Error!", errors: errors.array()})
    }

    const {amount, category,description, date } = req.body

    try {
        const newExpense = new Expense({
            amount,
            userId: req.currentUser.id,
            category,
            description: description ? description : 'No description provided',
            date
        })

        const savedExpense = await newExpense.save()
        res.status(201).json(savedExpense)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to create expense' })
    }
})

expenseRouter.put('/edit/:expenseId', 
    body('amount')
    .not()
    .isEmpty()
    .withMessage("Amount must be provided."),
    body('category')
    .not()
    .isEmpty()
    .withMessage("Category must be provided.")
    , getCurrentUser
    ,async (req, res) => {
        savedExpense
    // Validation Check
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({message: "Validation Error!", errors: errors.array()})
    }
    
    const {expenseId} = req.params
    const {amount, category,description, date } = req.body
    
    // Find Existing Expense by ID
    const existingExpense = await Expense.findById(expenseId);

    if(!existingExpense){
        res.status(404).json({message: `Expense with Expense ID ${expenseId} is not found`})
    }

    if(existingExpense.userId != req.currentUser.id){
        res.status(401).json({message: `User does not have access to edit this expense.`})
    }

    try {
        existingExpense.amount = amount;
        existingExpense.category = category;
        existingExpense.description = description;

        const savedExpense = await existingExpense.save()
        res.status(200).json(savedExpense)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to update expense' })
    }
})

expenseRouter.get('/showAll',  getCurrentUser
    ,async (req, res) => {
    
    // Find all expenses
    const expenses = await Expense.find({});

    res.status(200).json(expenses)
    
})

expenseRouter.delete('/delteExpense/:expenseId', getCurrentUser, 
    async(req,res) => {
        const expenseId = req.params.expenseId
        // Find Expense by ID
        const existingExpense = await Expense.findById(expenseId);

        if(!existingExpense){
            res.status(404).json({message: `Expense with Expense ID ${expenseId} is not found`})
        }

        if(existingExpense.userId != req.currentUser.id){
            res.status(401).json({message: `User does not have access to edit this expense.`})
        }

        try{
            await existingExpense.deleteOne({
                id: expenseId
            })
        }catch(err){
            console.log(err);
            res.status(500).json({message: `Error during deleting`})
        }

        res.status(200).json({message: 'Successfully deleted'})

    }
)

// Retreive data by past week
expenseRouter.get('/getExpenses', async (req,res) => {
    try{
        const {filter, startDay } = req.query;

        let startDate, endDate;

        switch(filter){
            case 'lastWeek': 
                startDate = moment().startOf('isoWeek').subtract(1,'week').toDate()
                endDate = moment().startOf('isoWeek').subtract(1,'week').endOf('isoWeek').toDate()
                break;

            case 'lastMonth':
                startDate = moment().subtract(1, 'month').startOf('month').toDate();
                endDate = moment().subtract(1, 'month').endOf('month').toDate();
                break; 
            
            case 'last3Months':
                startDate = moment().subtract(3, 'months').startOf('month').toDate();
                endDate = moment().subtract(3, 'months').endOf('month').toDate();
                break;

            case 'customDays': 
                if(!startDay){
                    return res.status(400).json({ error: 'customDays parameter is required for this filter' });
                }
                startDate = moment().subtract(startDay, 'days').toDate();
                endDate = moment().toDate();
                break;
            default:
                    return res.status(400).json({ error: 'Invalid filter parameter' });
        }
            
            const data = await Expense.find({
                date: {
                    $gte: startDate,
                    $lte: endDate,
                }
            })

            console.log('data ',data)
            res.status(200).json(data);
    }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = expenseRouter
