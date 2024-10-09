const jwt = require('jsonwebtoken')
const httpStatusText = require('../utils/httpStatusText')
const verifyToken  = (req, res , next)=>{
    const authHeader = req.headers['Authorization'] || req.headers['authorization']   
    if(!authHeader){
        return res.status(400).json({status : httpStatusText.ERROR , message :'token is  required' , code : 400})

    }
    const token  = authHeader.split(' ')[1] ;
    
    try{
        const currentUser = jwt.verify(token  , process.env.SECRET_KEY) ;
        req.currentUser = currentUser ; 
        next() ;
        
    }catch(err){
        return res.status(400).json({status : httpStatusText.ERROR , data : null , message :"invalid token " , code : 401  })

    }

}
module.exports = verifyToken ;