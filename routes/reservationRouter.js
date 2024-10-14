const express = require('express');
const router = express.Router();
const reservationController = require('../controller/reservationController');

router.post('/', reservationController.createReservation);

router.get('/', reservationController.getAllReservations);

router.route('/:id').patch(reservationController.updateReservation).delete(reservationController.deleteReservation);

router.get('/resturant/:restaurantName', reservationController.getAllReservationsForRestaurant);



module.exports = router;
