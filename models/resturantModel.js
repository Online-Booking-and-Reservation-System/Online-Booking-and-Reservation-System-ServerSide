const mongoose = require('mongoose');

const resturantsSchema = new mongoose.Schema({

    restaurantName: {
        type: String,
        required: [true, "Resturant Name is required"],
    },
    fullAddress: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imgUrl: {
        type: String,
        required: true,

    },
    numberOfTables: {
        type: Number,
        required: true,

    },
    sizeTable: {
        type: String,
        required: true,
    },
    openTime: {
        type: Number,
        required: true,
    },
    closeTime: {
        type: Number,
        required: true,
    },

});

module.exports = mongoose.model('Resturant', resturantsSchema);