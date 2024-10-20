const express = require('express') ;
const userController = require('../controller/userController');
const { validationSchema } = require('../middlware/validationSchema');
const verifyToken = require('../middlware/verifyToken')
const allowedTo = require('../middlware/allowedTo')
const router  = express.Router() ;


router.route('/')
    .get(userController.getAllUsers)
    

router.route('/:id')
    .get( verifyToken ,allowedTo('admin' , 'manager') , userController.getUser)
    .patch(verifyToken ,allowedTo('admin') ,userController.updateUser )
    .delete( verifyToken ,allowedTo('admin') , userController.deleteUser)



module.exports = router ;
