const express = require('express');
const router = express.Router();
const reservationController = require('../controller/reservationController');

router.post('/create', reservationController.createReservation);

router.get('/', reservationController.getAllReservations);

router.route('/:id').patch(reservationController.updateReservation).delete(reservationController.deleteReservation);

router.get('/resturant/:restaurantName', reservationController.getAllReservationsForRestaurant);

// Route for creating a PayPal order
router.post('/create-order', reservationController.createOrder);

// Route for capturing the PayPal order
router.post('/capture-order', reservationController.captureOrder);

module.exports = router;
