const Manager = require('../models/managerModel')
const {validationResult} = require('express-validator')
const httpStatusText = require("../utils/httpStatusText")

exports.addManager = async (req,  res)=>{

    const errors  = validationResult(req) ;
    if(!errors.isEmpty()){
        return res.status(400).json({status : httpStatusText.FAIL , data : {errors : errors.array()}})
    }
   
    
    const newManager = new Manager(req.body)  ;
    await newManager.save() ;
    res.status(201).json({status : httpStatusText.SUCCESS , data : {user : newManager}}) ;
    
    
}

exports.deleteManager = async  (req, res)=>{
    const deletedManager  = await Manager.deleteOne({_id : req.params.id})
    res.status(200).json({status : httpStatusText.SUCCESS , data :null }) ;
}

exports.getAllManagers = async(req, res)=>{
   try{
       const managers = await Manager.find({}) ; 
       res.json({status : httpStatusText.SUCCESS , data : {managers} })

   }catch(err){
    res.status(404).json({status : httpStatusText.ERROR , data : {err} })

   }
} ;
