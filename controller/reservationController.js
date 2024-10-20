const Reservation = require('../models/reservationModel');
const httpStatusText = require('../utils/httpStatusText');
const sendBookingConfirmation = require('../utils/emailService');
const paypal = require('@paypal/checkout-server-sdk');
const paypalClient = require('../utils/paypalConfig');
const User  = require('../models/userModel')
// Create reservation and initiate PayPal payment
exports.createReservation = async (req, res) => {
    const { customerName, customerEmail, phoneNumber, numberOfGusts, numberOfTables, reservationDate, reservationTime, resturantName, amount } = req.body;
    try {
        
        // Create a new reservation with "Pending" status
        const newReservation = new Reservation({
            customerName,
            customerEmail,
            phoneNumber,
            numberOfGusts,
            numberOfTables,
            reservationDate,
            reservationTime,
            resturantName,
            amount
        });

        await newReservation.save();

        // Create PayPal payment
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount,
                },
                description: `Reservation at ${resturantName}`,
            }],
            application_context: {
                brand_name: 'Reservation App',
                return_url: 'http://localhost:3000/api/reservations/payment-success',
                cancel_url: 'http://localhost:3000/api/reservations/payment-cancel',
            },
        });

        const order = await paypalClient.execute(request);

        // Return PayPal order ID to the frontend
        res.status(201).json({
            reservation: newReservation,
            paypalOrderId: order.result.id
        });
        await sendBookingConfirmation(newReservation);

    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(400).json({
            message: 'Error creating reservation',
            error,
        });


    }


};

// Capture PayPal payment after approval
exports.capturePayment = async (req, res) => {
    const { orderId, reservationId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await paypalClient.execute(request);

        // Update the reservation with payment details
        const reservation = await Reservation.findById(reservationId);
        reservation.paymentStatus = 'Paid';
        reservation.paypalTransactionId = capture.result.id;
        reservation.bookingStatus = 'Completed';

        await reservation.save();

        res.status(201).json({
            message: 'Payment captured successfully',
            reservation: reservation,
            paymentDetails: capture
        });
    } catch (error) {
        console.error('Error capturing PayPal payment:', error);
        res.status(400).json({
            message: 'Error capturing payment',
            error,
        });
    }
};

// Route for handling PayPal payment cancellation
exports.paymentCancel = (req, res) => {
    res.status(201).json({
        message: 'Payment cancelled by user',
    });
};


exports.getAllReservations = async (req, res) => {
    try {
        const allReservations = await Reservation.find();
        if (!allReservations || allReservations.length === 0) {
            return res.status(404).json({ status: httpStatusText.FAIL, massage: "No Reservation Found ", data: null });
        }
        res.status(201).json({ status: httpStatusText.SUCCESS, data: { allReservations } });

    } catch (err) {
        return res.status(400).json({ status: httpStatusText.ERROR, massage: "Error retrieving ", error: err.massage });
    }
}

exports.getAllReservationsByCustomerName  = async (req, res) => {
    const { customerName } = req.params;

    try {
        const reservations = await Reservation.find({ customerName : customerName });

        if (reservations.length === 0) {
            return res.status(404).json({ message: `No reservations found for this cusromer : ${customerName}` });
        }

        res.status(201).json(reservations);
    } catch (err) {
        res.status(400).json({ status: httpStatusText.ERROR, message: 'Error retrieving reservations', error: err.massage });
    }
};


exports.getAllReservationsForRestaurant = async (req, res) => {
    const { email } = req.user;
    const user = await User.findOne({ email });
    const restaurantName = user.restaurantName;

    try {
        const reservations = await Reservation.find({ resturantName: restaurantName });

        if (reservations.length === 0) {
            return res.status(404).json({ message: `No reservations found for restaurant: ${restaurantName}` });
        }

        res.status(201).json(reservations);
    } catch (err) {
        res.status(400).json({ status: httpStatusText.ERROR, message: 'Error retrieving reservations', error: err.massage });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Reservation not found", data: null });
        }

        const updatedReservation = await Reservation.updateOne({ _id: id }, { $set: { ...req.body } });
        res.status(201).json({ status: httpStatusText.SUCCESS, data: { resturant: updatedReservation } });
    } catch (error) {
        return res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};



exports.deleteReservation = async (req, res) => {

    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Restaurant not found", data: null });
        }
        await Reservation.deleteOne({ _id: req.params.id });
        res.status(201).json({ status: httpStatusText.SUCCESS, message: "Restaurant deleted successfully", data: null });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
}











