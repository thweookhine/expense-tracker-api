
const jwt = require('jsonwebtoken')

const getCurrentUser = (req,res,next) => {

    const authHeader = req.header["Authorization"] || req.headers["authorization"];

    if(!authHeader){
        res.status(401).json({message: "User Not Authenticated."})
    }
    
    // Get Token
    const token = authHeader.split(" ")[1];

    // Verify Token
    try{
        const currentUser = jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.currentUser = currentUser;
        next();
    }catch(err){
        console.log(err)
        res.status(500).json({message: "JWT Verification Error"})
    }



}

module.exports = {getCurrentUser}