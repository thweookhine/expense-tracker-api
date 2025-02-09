const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const {body,validationResult} = require('express-validator')
const { default: mongoose } = require('mongoose')

const userRouter = express.Router()

userRouter.post('/register', 
    body('name')
        .not()
        .isEmpty()
        .withMessage("User Name must be provided."),
    body('email')
        .isEmail()
        .withMessage("Email must be valid"),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage('Password must be between 4 and 20 characters.')
    ,async (req,res) => {

    // Validation Check
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({message: "Validation Error!", errors: errors.array()})
    }

    const {name,email,password} = req.body;
    try{
        // Check email duplication
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({message: "User Email already Exists!"})
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({name, email, password: hashedPassword});

        await user.save();
        const token = jwt.sign({id: user._id},process.env.JWT_SECRET_KEY,{
            expiresIn: "1h",
        })
    
        res.json({token});

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
})

userRouter.get('/getAll', async (req,res) =>{
    const users = await User.find({});
    res.status(200).json(users)
})

userRouter.get('/getById/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid User ID" });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


userRouter.post('/login', 
    body('email')
        .isEmail()
        .withMessage("Email must be valid"),
    body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage("Password Must be provided")
    ,async (req,res) => {

        // Validation Check
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({message: "Validation Error!", errors: errors.array()})
        }

        const {email,password} = req.body;
        const existingUser = await User.findOne({email});

        if(!existingUser){
            return res.status(400).json({message: "Invalid Credentials!"})
        }

        const isMatch = await existingUser.comparePassword(password);
        console.log(isMatch)
        if(!isMatch){
            return res.status(400).json({message: "Invalid Credentials!"})
        }

        const token = jwt.sign({id: existingUser._id},process.env.JWT_SECRET_KEY,{
            expiresIn: "1h",
        })

        res.json({token})

    }
)

module.exports = userRouter
