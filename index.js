const { default: mongoose, startSession } = require('mongoose')

const {app} = require('./app')
require('dotenv').config()

start = async() => {
    if(!process.env.MONGO_URI){
        throw new Error('Mongo URI must be defined.')
    }

    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("MONGO DB connected"))
        .catch((err) => console.log(err))

    app.listen(3000,() => {
        console.log('Listening on Port: 3000')
    })
}

start()