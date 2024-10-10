require('dotenv').config()
const bcrypt  = require('bcrypt') ;
const jwt  = require('jsonwebtoken')
const nodemailer  = require('nodemailer')
const {v4 : uuidv4} = require('uuid')
const User = require('../models/userModel')
const UserVerification  = require('../models/userVerification')
const httpStatusText = require('../utils/httpStatusText');
const generateToken = require('../utils/generateToken');

const register = async(req, res)=>{
    try {
            const {fullName  , email , phoneNumber , password } =  req.body ; 
            const oldUser  = await User.findOne({email : email})
            if(oldUser){
                return res.status(400).json({status : httpStatusText.FAIL , data : 'user already exist'}) ;

            }
            let role ; 
            if (email.endsWith('@admin.com')) { 
              role = 'admin';
            }else if (email.endsWith('@manager.com')){
                role = 'manager' ;
            }else{
                role = 'user' ;

            }
            const hashedPassword = await bcrypt.hash(password , 10)
            const newUser  = new User({
                fullName ,
                email,
                phoneNumber,
                password : hashedPassword ,
                role 
            })

            // generate JWT token 
            const token  = await generateToken({email : newUser.email , id : newUser._id , role : newUser.role })
            newUser.token = token
            await newUser.save() ;
          
            res.status(201).json({status : httpStatusText.SUCCESS , data : {user : newUser}}) ;
            
    } catch (error) {
        return res
                .status(400)
                .json(
                        {   status : httpStatusText.ERROR , 
                            message: error.message
                        })

    }

}

const login  = async(req,res)=>{
    try {
        const { email  , password} = req.body ;
        if(!email  && !password){
            return res
                .status(400)
                .json(
                        {   status : httpStatusText.FAIL , 
                            message: "email and password are required "
                        })
        }
        const user =  await User.findOne({email :  email}) ;
        if(!user){
            return res.status(400).json({status : httpStatusText.FAIL , data : 'user not exist'}) ;
        }
        const matchedPassword  = await  bcrypt.compare(password  , user.password) ;

        if(user && matchedPassword){
            const token = await generateToken({email : user.email , id : user._id  , role : user.role})
            return res.status(200).json({status :  httpStatusText.SUCCESS , data : {token}})
        }else{
            return res.status(500).json({status : httpStatusText.ERROR , data : "somthing wrong whith login check your email and password "})
        }
    } catch (error) {
        return res
        .status(400)
        .json(
                {   status : httpStatusText.ERROR , 
                    message: error.message
                })
    }

}

module.exports ={
    register ,
    login
}
//api should be statless => so use jwt 