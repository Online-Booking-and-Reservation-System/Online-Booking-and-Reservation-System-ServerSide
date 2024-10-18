const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    email : String  ,
    restaurantName : String  
}) ;

const Manager  = mongoose.model("Managermail" , managerSchema)

module.exports = Manager; 