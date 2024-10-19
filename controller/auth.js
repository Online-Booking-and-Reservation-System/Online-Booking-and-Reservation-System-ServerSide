require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const UserVerification = require('../models/userVerification');
const httpStatusText = require('../utils/httpStatusText');
const generateToken = require('../utils/generateToken');
const Admin = require('../models/adminModel');
const Manager = require('../models/managerModel');

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

        // Check role
        let role = 'user'; // Default role
        const isAdmin = await Admin.findOne({ email });
        const isManager = await Manager.findOne({ email });
        let restaurantName ;
        console.log(isManager.restaurantName);
        if (isAdmin) {
            role = 'admin';
        } else if (isManager) {
            role = 'manager';
            restaurantName  = isManager.restaurantName 
        }
        

        const newUserVerification = new UserVerification({
            tempUserData: {
                fullName,
                email,
                phoneNumber,
                password: hashedPassword, // Store hashed password
                role: role,
                restaurantName : restaurantName
            },
            email: email,
            verificationCode: hashedCode,
            expiresAt: Date.now() + 15 * 60 * 1000, // Set expiration to 15 minutes
        });

        const token = await generateToken({ email: newUserVerification.email, id: newUserVerification._id });
        newUserVerification.token = token;

        await newUserVerification.save();

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify your Email',
            html: `<p>Your verification code is <strong>${verificationCode}</strong>. It expires in 15 minutes.</p>`,
        };

        // Improved error handling for email sending
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ status: httpStatusText.ERROR, message: 'Error sending verification email' });
            }
        });

        res.status(201).json({ status: httpStatusText.SUCCESS, message: 'Verification email sent', data: newUserVerification.token });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};

// Verify user with code
const verifyUser = async (req, res) => {
    try {
        const { verificationCode } = req.body;
        const userVerification = await UserVerification.findOne({ email: req.user.email }); // Use email to find the record

        if (!userVerification) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Verification record not found' });
        }

        const currentTime = Date.now();
        if (userVerification.expiresAt < currentTime) {
            await UserVerification.deleteOne({ email: userVerification.email }); // Delete using email

            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Verification code has expired' });
        }

        const isCodeValid = await bcrypt.compare(verificationCode, userVerification.verificationCode);

        if (!isCodeValid) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid verification code' });
        }

        const { tempUserData } = userVerification;
        const newUser = new User({
            fullName: tempUserData.fullName,
            email: tempUserData.email,
            phoneNumber: tempUserData.phoneNumber,
            password: tempUserData.password,
            role: tempUserData.role,
            restaurantName : tempUserData.restaurantName ,
            verified: true, // Set user as verified
        });
        
        const token = await generateToken({ email: newUser.email, id: newUser._id, role: newUser.role });
        newUser.token = token;
        await newUser.save();

        await UserVerification.deleteOne({ email: userVerification.email }); // Delete using email


        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'User verified', token });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};

// Login function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email && !password ){
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'email and password required ' });

        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'User does not exist' });
        }

        if (!user.verified) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Email not verified' });
        }

        const matchedPassword = await bcrypt.compare(password, user.password);
        if (user && matchedPassword) {
            const token = await generateToken({ email: user.email, id: user._id  , role : user.role });
            console.log(user.role );
            
            return res.status(200).json({ status: httpStatusText.SUCCESS, data : {token} });
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
