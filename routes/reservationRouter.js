const express = require('express');
const router = express.Router();
const reservationController = require('../controller/reservationController');

router.post('/', reservationController.createReservation);
// Capture PayPal payment after approval
router.post('/capture-payment', reservationController.capturePayment);

// Handle payment cancellation
router.get('/payment-cancel', reservationController.paymentCancel);


router.get('/', reservationController.getAllReservations);

router.route('/:id').patch(reservationController.updateReservation).delete(reservationController.deleteReservation);

router.get('/resturant/:resturantName', reservationController.getAllReservationsForRestaurant);



module.exports = router;
