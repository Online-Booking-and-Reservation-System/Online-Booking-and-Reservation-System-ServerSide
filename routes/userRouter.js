const express = require('express') ;
const userController = require('../controller/userController');
const { validationSchema } = require('../middlware/validationSchema');
const verifyToken = require('../middlware/verifyToken')
const allowedTo = require('../middlware/allowedTo')
const router  = express.Router() ;


router.route('/')
    .get(verifyToken ,allowedTo('admin' , 'manager'),userController.getAllUsers)
    .post(validationSchema() , userController.addUser)


router.route('/:id')
    .get( verifyToken ,allowedTo('admin' , 'manager') , userController.getUser)
    .patch(verifyToken ,allowedTo('admin' , 'manager') ,userController.updateUser )
    .delete( verifyToken ,allowedTo('admin' , 'manager') , userController.deleteUser)


module.exports = router ;
