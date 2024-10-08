const express = require('express');
const resturantController = require('../controller/resturantController');

const router = express.Router();

router.route('/').get(resturantController.getAllRestaurants).post(resturantController.createRestaurant);

router.route('/:id').get(resturantController.getResturant).patch(resturantController.updateResturant).delete(resturantController.deleteResturant);



module.exports = router;



