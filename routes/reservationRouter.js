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


router.get('/', verifyToken, allowedTo('admin', 'manager'), reservationController.getAllReservations);

router.get('/resturant/:restaurantName', authenticateUser, reservationController.getAllReservationsForRestaurant);

router.get('/:customerName', verifyToken, allowedTo('manager'), reservationController.getAllReservationsByCustomerName)

router.route('/:id')
    .patch(verifyToken, allowedTo('admin', 'manager'), reservationController.updateReservation)
    .delete(verifyToken, allowedTo('admin', 'manager'), reservationController.deleteReservation);





module.exports = router;
