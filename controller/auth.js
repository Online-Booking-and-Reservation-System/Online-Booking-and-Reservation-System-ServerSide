require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const UserVerification = require('../models/userVerification');
const httpStatusText = require('../utils/httpStatusText');
const generateToken = require('../utils/generateToken');
const Admin = require('../models/adminModel') ;
const Manager = require('../models/managerModel')


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

        //check role 
        const isAdmin  = await Admin.findOne({email : email })  ;
        const isManager = await Manager.findOne({email :  email })

        if(isAdmin){
            role  = 'admin'
        }else if(isManager){
            role  = 'manager'
        }else{
            role  = 'user'
        }

        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role : role ,
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

        res.status(201).json({ status: httpStatusText.SUCCESS, message: 'Verification email sent', data: newUser.token });
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

        const token = await generateToken({ email: user.email, id: user._id  , role : user.role});
        user.token = token
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
