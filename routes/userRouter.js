const express = require('express') ;
const userController = require('../controller/userController');
const { validationSchema } = require('../middlware/validationSchema');
const verifyToken = require('../middlware/verifyToken')
const allowedTo = require('../middlware/allowedTo')
const router  = express.Router() ;


router.route('/')
    .get(userController.getAllUsers)
    

router.route('/:id')
    .get( verifyToken ,allowedTo('user','admin' , 'manager') , userController.getUser)
    .patch(verifyToken ,allowedTo('user','manager','admin') ,userController.updateUser )
    .delete( verifyToken ,allowedTo('user','manager','admin') , userController.deleteUser)



module.exports = router ;
