const reservation = require('../models/reservationModel');
const httpStatusText = require('../utils/httpStatusText');
const paypal = require('../paypal');
// Create PayPal Order
exports.createOrder = async (req, res) => {
    const { reservationId, amount } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: amount,
                },
                description: `Reservation ID: ${reservationId}`,
            }
        ]
    });

    try {
        const order = await paypal.execute(request);
        res.status(200).json({ id: order.result.id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating PayPal order', error });
    }
};

// Capture PayPal Order
exports.captureOrder = async (req, res) => {
    const { orderID, reservationId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await paypal.execute(request);

        // Update reservation status to 'Done' upon successful payment
        await reservation.findByIdAndUpdate(reservationId, { bookingStatus: 'Done' });

        res.status(200).json({ message: 'Payment captured successfully', capture: capture.result });
    } catch (error) {
        res.status(500).json({ message: 'Error capturing PayPal order', error });
    }
};

exports.createReservation = async (res, req) => {
    try {
        const { customerName, phoneNumber, numberOfGusts, numberOfTables, reservationDate, reservationTime, resturantName } = req.body;

        const newReservation = new reservation({

            customerName,
            phoneNumber,
            numberOfGusts,
            numberOfTables,
            reservationDate,
            reservationTime,
            resturantName,
            bookingStatus: 'Not-Completed',
        });
        await newReservation.save();
        res.status(201).json({ status: httpStatusText.SUCCESS, data: { Reservation: newReservation } });
    } catch (err) {
        return res.status(400).json({
            status: httpStatusText.ERROR,
            message: err.message
        });
    }
};

exports.getAllReservations = async (req, res) => {
    try {
        const allReservations = await reservation.find();
        if (!allReservations || allReservations.length === 0) {
            return res.status(404).json({ status: httpStatusText.FAIL, massage: "No Reservation Found ", data: null });
        }
        res.status(201).json({ status: httpStatusText.SUCCESS, data: { allReservations } });

    } catch (err) {
        return res.status(400).json({ status: httpStatusText.ERROR, massage: "Error retrieving ", error: err.massage });
    }
}

exports.getAllReservationsForRestaurant = async (req, res) => {
    const { resturantName } = req.params;

    try {
        const reservations = await reservation.find({ resturantName: resturantName });

        if (!reservations || reservations.length === 0) {
            return res.status(404).json({ message: `No reservations found for restaurant: ${resturantName}` });
        }

        res.status(201).json(reservations);
    } catch (err) {
        res.status(400).json({ status: httpStatusText.ERROR, message: 'Error retrieving reservations', error: err.massage });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const reservation = await reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Restaurant not found", data: null });
        }

        const updatedReservation = await reservation.updateOne({ _id: id }, { $set: { ...req.body } });
        res.status(201).json({ status: httpStatusText.SUCCESS, data: { resturant: updatedReservation } });
    } catch (error) {
        return res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};



exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Restaurant not found", data: null });
        }
        await reservation.deleteOne({ _id: req.params.id });
        res.status(201).json({ status: httpStatusText.SUCCESS, message: "Restaurant deleted successfully", data: null });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
}











