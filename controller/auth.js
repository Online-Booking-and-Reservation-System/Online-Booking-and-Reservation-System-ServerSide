require('dotenv').config()
const bcrypt  = require('bcrypt') ;
const jwt  = require('jsonwebtoken')
const nodemailer  = require('nodemailer')
const {v4 : uuidv4} = require('uuid')
const User = require('../models/userModel')
const UserVerification  = require('../models/userVerification')
const httpStatusText = require('../utils/httpStatusText');
const generateToken = require('../utils/generateToken');

let transporter  = nodemailer.createTransport({
    service : "gmail" ,
    auth: {
        user : process.env.AUTH_EMAIL,
        pass : process.env.PASSWORD
    }
})


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
                role  ,
                verified : false 
            })

            // generate JWT token 
            const token  = await generateToken({email : newUser.email , id : newUser._id , role : newUser.role })
            newUser.token = token
            await newUser.save()

            const verificationCode   = uuidv4()  ;

            const hashedVerificationCode  = await bcrypt.hash(verificationCode , 10 ) ;

            const userVerification = new UserVerification({
                userId: newUser._id,
                verificationCode:  hashedVerificationCode,
                expiresAt: Date.now() + 3600000 // Expires in 1 hour
            });

            await userVerification.save() ;

            const mailOptions  = {
                from: process.env.AUTH_EMAIL,
                to: newUser.email,
                subject: 'Verify your Email',
                html: `<p>Your verification code is <strong>${verificationCode}</strong>. It expires in 1 hour.</p>`
            } ;

            transporter.sendMail(mailOptions ,(error , info)=>{
                if(error){
                    console.error('error sending email : ' , error )
                }
            })
            res.status(201).json({status : httpStatusText.SUCCESS , data : {user : newUser , message  : 'verification email sent '}}) ;
            
    } catch (error) {
        return res
                .status(400)
                .json(
                        {   status : httpStatusText.ERROR , 
                            message: error.message
                        })

    }

}
const verifyUser = async(req , res)=>{
    try {
        const {userId , verificationCode } = req.body ;

        const userVerification = await UserVerification.findOne({userId})

        if(!userVerification){
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Verification not found' });
        }

        const isCodeValid = await bcrypt.compare(verificationCode , userVerification.verificationCode) ;

        if(!isCodeValid){
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid verification code' });
        }

                // Check if the code is expired
        if (userVerification.expiresAt < Date.now()) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Verification code expired' });
        }
        
                // Mark user as verified
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'User not found' });
        }
        
        user.verified = true;
        await user.save();
        
                // Remove the verification entry
        await UserVerification.deleteOne({ userId });
        
        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Email successfully verified' });
        
    }catch (error){
        return res.status(400).json({
            status: httpStatusText.ERROR,
            message: error.message
        });
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
        if (!user.verified) {
            return res.status(400).json({
                status: httpStatusText.FAIL,
                message: "Email not verified"
            });
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
    login ,
    verifyUser
}
//api should be statless => so use jwt 