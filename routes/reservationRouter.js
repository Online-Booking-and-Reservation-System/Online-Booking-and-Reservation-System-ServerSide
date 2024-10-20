const express = require('express');
const router = express.Router();
const reservationController = require('../controller/reservationController');
const verifyToken = require('../middlware/verifyToken')
const allowedTo = require('../middlware/allowedTo')
const authenticateUser = require('../middlware/authenticateUser');

router.post('/', verifyToken, allowedTo('user', 'admin', 'manager'), reservationController.createReservation);
// Capture PayPal payment after approval
router.post('/capture-payment', verifyToken, allowedTo('user', 'admin', 'manager'), reservationController.capturePayment);

// Handle payment cancellation
router.get('/payment-cancel', verifyToken, allowedTo('user', 'admin', 'manager'), reservationController.paymentCancel);

router.get('/', verifyToken, allowedTo('manager','admin'), reservationController.getAllReservations);

router.get('/reservation/resturant', authenticateUser, reservationController.getAllReservationsForRestaurant);

router.get('/customer',  authenticateUser, reservationController.getAllReservationsForCustomer)

router.route('/:id')
    .patch(verifyToken, allowedTo('admin', 'manager'), reservationController.updateReservation)
    .delete(verifyToken, allowedTo('admin', 'manager'), reservationController.deleteReservation);





module.exports = router;
