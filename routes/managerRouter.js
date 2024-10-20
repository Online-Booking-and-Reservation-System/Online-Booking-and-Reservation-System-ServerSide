const express = require('express') ;
const managerController = require('../controller/managerControoler');
const { validationSchema } = require('../middlware/validationSchema');
const verifyToken = require('../middlware/verifyToken')
const allowedTo = require('../middlware/allowedTo')
const router  = express.Router() ;

router.route('/')
      .get(managerController.getAllManagers)
      .post(verifyToken ,allowedTo('admin' ) , managerController.addManager)

router.route('/:id')
      .delete( verifyToken ,allowedTo('admin') , managerController.deleteManager)  

module.exports = router ;
