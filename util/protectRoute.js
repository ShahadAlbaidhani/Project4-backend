const jwt = require("jsonwebtoken")
require("dotenv").config()

const protectRoute = async (req , res , next) =>{

    try{
        let token = req.headers.token
        let decode = jwt.verify(token , process.env.SECRETKEY)  
        req.user = decode.user
        next()
    }catch(err){
        res.status(404)
        .json({name : err.name ,
            message:err.message,
           url : req.originalUrl
           })

    }

}

module.exports = protectRoute