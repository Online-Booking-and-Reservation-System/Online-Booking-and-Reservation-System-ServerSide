const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email : String  , 
}) ;

const Admin  = mongoose.model("Adminemail" , adminSchema)

module.exports = Admin;