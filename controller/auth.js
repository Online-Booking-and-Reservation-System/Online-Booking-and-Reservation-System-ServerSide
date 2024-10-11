require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const UserVerification = require('../models/userVerification');
const httpStatusText = require('../utils/httpStatusText');
const generateToken = require('../utils/generateToken');

// Set up the email transporter
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.PASSWORD,
    },
});

// Register new user and send verification code
const register = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password } = req.body;

        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCode = await bcrypt.hash(verificationCode, 10);

        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            verified: false, // Initially, the user is not verified
        });

        const newUserVerification = new UserVerification({
            userId: newUser._id,
            verificationCode: hashedCode,
            expiresAt: Date.now() + 15 * 60 * 1000, // Set expiration to 15 minutes
        });

        const token = await generateToken({ email: newUser.email, id: newUser._id });
        newUser.token = token;

        await newUser.save();
        await newUserVerification.save();

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify your Email',
            html: `<p>Your verification code is <strong>${verificationCode}</strong>. It expires in 15 minutes.</p>`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ status: httpStatusText.ERROR, message: 'Error sending verification email' });
            }
        });

        res.status(201).json({ status: httpStatusText.SUCCESS, message: 'Verification email sent', data: newUser });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};

// Verify user with code
const verifyUser = async (req, res) => {
    try {
        const { verificationCode } = req.body;
        const userVerification = await UserVerification.findOne({ userId: req.user._id });

        if (!userVerification) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Verification record not found' });
        }

        const currentTime = Date.now();
        if (userVerification.expiresAt < currentTime) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Verification code has expired' });
        }

        const isCodeValid = await bcrypt.compare(verificationCode, userVerification.verificationCode);

        if (!isCodeValid) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid verification code' });
        }
        
        const user = await User.findById(userVerification.userId);
        if(userVerification.expiresAt < currentTime && !user.verified){
            return await user.deleteOne(user._id)

        }
        user.verified = true;
        await user.save();

        await UserVerification.deleteOne({ userId: user._id });

        const token = await generateToken({ email: user.email, id: user._id });
        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'User verified', token });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};

// Login function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'User does not exist' });
        }

        if (!user.verified) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Email not verified' });
        }

        const matchedPassword = await bcrypt.compare(password, user.password);
        if (matchedPassword) {
            const token = await generateToken({ email: user.email, id: user._id });
            return res.status(200).json({ status: httpStatusText.SUCCESS, token });
        } else {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};

module.exports = {
    register,
    verifyUser,
    login,
};

// require('dotenv').config()
// const bcrypt  = require('bcrypt') ;
// const jwt  = require('jsonwebtoken')
// const nodemailer  = require('nodemailer')
// const {v4 : uuidv4} = require('uuid')
// const User = require('../models/userModel')
// const UserVerification  = require('../models/userVerification')
// const httpStatusText = require('../utils/httpStatusText');
// const generateToken = require('../utils/generateToken');

// let transporter  = nodemailer.createTransport({
//     service : "gmail" ,
//     auth: {
//         user : process.env.AUTH_EMAIL,
//         pass : process.env.PASSWORD
//     }
// })


// const register = async(req, res)=>{

//     try {
//             const {fullName  , email , phoneNumber , password } =  req.body ; 
           
//             const oldUser  = await User.findOne({email : email})
//             if(oldUser){
//                 return res.status(400).json({status : httpStatusText.FAIL , data : 'user already exist'}) ;

//             }

            
//             const hashedPassword = await bcrypt.hash(password , 10)
//             const verificationCode = uuidv4(); // Example: Generate a verification code
//             const hashedCode = await bcrypt.hash(verificationCode, 10);
    
            
//             const newUserVerification  = new UserVerification({
//                user : {
//                 fullName ,
//                 email,
//                 phoneNumber,
//                 password : hashedPassword ,
//                 verified : false 
//                },
//                verificationCode: hashedCode,
//                expiresAt: Date.now() + 15 * 60 * 1000 // Set expiration time to 15 minutes from now    
//             })

//             // generate JWT token 
//          //   const token  = await generateToken({email : newUser.email , id : newUser._id , role : newUser.role })
//             const token  = await generateToken({email : newUserVerification.user.email})
//             newUserVerification.token = token
           
//             await newUserVerification.save()


            
//             const mailOptions  = {
//                 from: process.env.AUTH_EMAIL,
//                 to: newUser.email,
//                 subject: 'Verify your Email',
//                 html: `<p>Your verification code is <strong>${verificationCode}</strong>. It expires in 15 minutes.</p>`
//             } ;

//             transporter.sendMail(mailOptions ,(error , info)=>{
//                 if(error){
//                     console.error('error sending email : ' , error )
//                 }
//             })
//             res.status(201).json({status : httpStatusText.SUCCESS , data : {user : newUserVerification ,  message  : 'verification email sent '}}) ;
            
//     } catch (error) {
//         return res
//                 .status(400)
//                 .json(
//                         {   status : httpStatusText.ERROR , 
//                             message: error.message
//                         })

//     }

// }
// const verifyUser = async(req , res)=>{
//     try {
//         const { verificationCode } = req.body ;
//         const user  = req.user ;
//         console.log(user );
        
//         if(user.expiresAt < Date.now()){
//             return res.status(400).json({ status: 'fail', message: 'Verification code has expired' });

//         }
//         const isCodeValid = await bcrypt.compare(verificationCode.toString(), user.verificationCode);
//         if (!isCodeValid) {
//             return res.status(400).json({ status: 'fail', message: 'Invalid verification code' });
//         }

//         // Move the user from UserVerification collection to the actual User collection
//         const newUser = new User(user.user);
//         newUser.verified = true; // Mark the user as verified
//         await newUser.save();

//         // Delete the user from the UserVerification collection after successful verification
//         await UserVerification.deleteOne({ 'user.email': email });

//         res.status(200).json({ status: 'success', message: 'User successfully verified and saved' });
    
//     //     //cont expiresAt = 
//     //     // const userVerification = await UserVerification.findOne({userId})

//     //     // if(!userVerification){
//     //     //     return res.status(400).json({ status: httpStatusText.FAIL, message: 'Verification not found' });
//     //     // }

//     //     const isCodeValid = await bcrypt.compare(verificationCode , userVerification.verificationCode) ;

//     //     if(!isCodeValid){
//     //         return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid verification code' });
//     //     }

//     //             // Check if the code is expired
//     //     if (userVerification.expiresAt < Date.now()) {
//     //         return res.status(400).json({ status: httpStatusText.FAIL, message: 'Verification code expired' });
//     //     }
        
//     //             // Mark user as verified
//     //     const user = await User.findById(userId);
//     //     if (!user) {
//     //         return res.status(400).json({ status: httpStatusText.FAIL, message: 'User not found' });
//     //     }
        
//     //     user.verified = true;
//     //     await user.save();
        
//     //     // Remove the verification entry
//     //     await UserVerification.deleteOne({ userId });
        
//     //     res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Email successfully verified' });
        
//     }catch (error){
//         return res.status(400).json({
//             status: httpStatusText.ERROR,
//             message: error.message
//         });
//     }
// }
// const login  = async(req,res)=>{
//     try {
//         const { email  , password} = req.body ;
//         if(!email  && !password){
//             return res
//                 .status(400)
//                 .json(
//                         {   status : httpStatusText.FAIL , 
//                             message: "email and password are required "
//                         })
//         }
//         const user =  await User.findOne({email :  email}) ;
//         if(!user){
//             return res.status(400).json({status : httpStatusText.FAIL , data : 'user not exist'}) ;
//         }
//         if (!user.verified) {
//             return res.status(400).json({
//                 status: httpStatusText.FAIL,
//                 message: "Email not verified"
//             });
//         }
//         const matchedPassword  = await  bcrypt.compare(password  , user.password) ;

//         if(user && matchedPassword){
//             const token = await generateToken({email : user.email , id : user._id  , role : user.role})
//             return res.status(200).json({status :  httpStatusText.SUCCESS , data : {token}})
//         }else{
//             return res.status(500).json({status : httpStatusText.ERROR , data : "somthing wrong whith login check your email and password "})
//         }
//     } catch (error) {
//         return res
//         .status(400)
//         .json(
//                 {   status : httpStatusText.ERROR , 
//                     message: error.message
//                 })
//     }

// }

// module.exports ={
//     register ,
//     login ,
//     verifyUser
// }
// //api should be statless => so use jwt 