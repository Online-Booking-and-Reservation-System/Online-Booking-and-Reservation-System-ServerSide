const Reservation = require('../models/reservationModel');
const httpStatusText = require('../utils/httpStatusText');

exports.createReservation = async (req, res) => {
    const { customerName, phoneNumber, numberOfGusts, numberOfTables, reservationDate, reservationTime, resturantName } = req.body;

    try {

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

    } catch (error) {
        return res
            .status(400)
            .json(
                {
                    status: httpStatusText.ERROR,
                    message: error.message
                })

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

        if (reservations.length === 0) {
            return res.status(404).json({ message: `No reservations found for restaurant: ${resturantName}` });
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











