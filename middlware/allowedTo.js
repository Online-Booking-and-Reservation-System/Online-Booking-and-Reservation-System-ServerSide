const httpStatusText = require('../utils/httpStatusText')
module.exports = (...roles)=>{
    return (req, res , next ) =>{
        if(!roles.includes(req.currentUser.role)){
            
            return next(res.status(401).json({status : httpStatusText.ERROR , data : "this role is not authorized "  })) ;
        }
        next() ;
    }
}