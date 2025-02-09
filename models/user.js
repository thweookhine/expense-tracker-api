
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator'); 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: [validator.isEmail, "field must be a valid email address."]
    },
    password: {
        type: String,
        required: true
    },
    totalExpenses: {
        type: Number,
        default: 0
    }
})

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// userSchema.methods.comparePassword = async function(candidatePassword) {
//     const isMatch = await bcrypt.compare(candidatePassword, this.password);
//     return isMatch;
// };

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

const userModel = mongoose.model('User', userSchema)

module.exports = userModel