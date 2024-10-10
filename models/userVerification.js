const { verify } = require('jsonwebtoken');
const mongoose  = require('mongoose') ;
const validator = require('validator')
const userVerificationSchema  = new mongoose.Schema({
    userId : {
        type  : String     
    },
    uniqueString : {
        type  : String 
       },
    createdAt :{
        type:Date
    },
    expiredAt :{
        type:Date
    } ,
    

})


module.exports = mongoose.model('userVerification' , userVerificationSchema )