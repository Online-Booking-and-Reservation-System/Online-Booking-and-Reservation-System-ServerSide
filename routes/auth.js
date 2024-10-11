const express = require('express') ;

const router  = express.Router() ;
const auth = require('../controller/auth')


router.route('/register')
                .post(auth.register)
             
router.route('/login')
                .post(auth.login)
             
router.route('/verify/:userId/:uniqueString')
                .get(auth.verifyUser)
module.exports = router ; 

