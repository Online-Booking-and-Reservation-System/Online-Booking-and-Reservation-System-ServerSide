const mongoose = require('mongoose');
const { trim } = require('validator');

const reservationsSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
            trim : true  ,
        },
        customerEmail: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: Number,
            required: true,
        },
        numberOfGusts: {
            type: Number,
            required: true,
        },
        numberOfTables: {
            type: Number,
            required: true,

        },
        reservationDate: {
            type: Date,
            required: true,
        },
        reservationTime: {
            type: String,
            required: true,
        },
        resturantName: {
            type: String,
            required: true,
        },
        bookingStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending',
        },
        paypalTransactionId: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        }
    }
);

module.exports = mongoose.model('reservation', reservationsSchema);