const mongoose  = require('mongoose') ;
const validator = require('validator')
const userSchema  = new mongoose.Schema({
    fullName : {
        type  : String  , 
        required : true 
    },
    email : {
        type  : String ,
        required : true  ,
        unique : true , 
        validate : [validator.isEmail , 'fild must be a valid email adress']
    },
    phoneNumber :{
        type:String ,
        required : true 
    },
    password : {
        type : String ,
        required: true 
    } ,
    token : {
        type : String 
    },
    role : {
        type :  String  ,
        enum : ['user' , 'admin' ,'manager'] ,
        default : 'user'
    }

})


module.exports = mongoose.model('User' , userSchema)