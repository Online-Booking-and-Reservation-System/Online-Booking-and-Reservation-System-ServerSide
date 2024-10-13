const mongoose = require('mongoose');

const reservationsSchema = new mongoose.Schema(
    {
        customerName: {
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
            required: true,
            enum: ['Canceled', 'Done', 'Not-Completed'],
            default: 'Not-Completed',
        },

    }
);

module.exports = mongoose.model('reservation', reservationsSchema);