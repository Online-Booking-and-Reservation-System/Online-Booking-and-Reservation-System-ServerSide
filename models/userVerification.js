const { verify } = require('jsonwebtoken');
const mongoose  = require('mongoose') ;
const validator = require('validator')
const userVerificationSchema  = new mongoose.Schema({
    userId : {
        type  :mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true     
    },
    verificationCode : {
        type  : String ,
        required : true 
    },
    expiresAt :{
        type:Date , 
        required : true 
    } ,
    

})


module.exports = mongoose.model('userVerification' , userVerificationSchema )