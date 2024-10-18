const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: [validator.isEmail, 'Must be a valid email address'],
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'manager'],
            default: 'user',
        },
        verified: {
            type: Boolean,
            default: false,
        },
        token : {
            type : String ,
            default : ""
        },
        restaurantName :{
            type : String ,
            default : ""
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
