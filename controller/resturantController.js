const Resturant = require('../models/resturantModel');
const httpStatusText = require('../utils/httpStatusText')

exports.createRestaurant = async (req, res) => {


    try {

        const { restaurantName, fullAddress, description, numberOfTables, sizeTable, openTime, closeTime } = req.body;
        const imgUrl = req.file ? req.file.filename : null;
        console.log(imgUrl);

        const newResturant = new Resturant({

            restaurantName,
            fullAddress,
            description,
            imgUrl,
            numberOfTables,
            sizeTable,
            openTime,
            closeTime
        })

        await newResturant.save();

        res.status(201).json({ status: httpStatusText.SUCCESS, data: { Restaurant: newResturant } });

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
exports.getAllRestaurants = async (req, res) => {

    try {
        const resturants = await Resturant.find();

        // Append the full URL for the image path so the frontend can access it
        const updatedRestaurants = resturants.map(restaurant => ({
            ...restaurant._doc,
            imgUrl: restaurant.imgUrl ? `${req.protocol}://${req.get('host')}/${restaurant.imgUrl}` : null
        }));
        if (!resturants || resturants.length === 0) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "No restaurants found", data: null });
        }
        res.json({ status: httpStatusText.SUCCESS, data: { updatedRestaurants } });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: "An error occurred", error: error.message });
    }
};

exports.getResturant = async (req, res) => {

    try {
        const resturant = await Resturant.findById(req.params.id)
        if (!resturant) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Restaurant not found", data: null });
        }
        res.json({ status: httpStatusText.SUCCESS, data: { resturant } })
    } catch (error) {
        return res.status(400).json({ status: httpStatusText.ERROR, data: null, message: error.message, code: 400 })

    }
}
exports.updateResturant = async (req, res) => {
    const id = req.params.id;
    try {
        const resturant = await Resturant.findById(id);
        if (!resturant) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Restaurant not found", data: null });
        }

        const updatedResturant = await Resturant.updateOne({ _id: id }, { $set: { ...req.body } });
        res.status(200).json({ status: httpStatusText.SUCCESS, data: { resturant: updatedResturant } });
    } catch (error) {
        return res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};



exports.deleteResturant = async (req, res) => {
    try {
        const resturant = await Resturant.findById(req.params.id);
        if (!resturant) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Restaurant not found", data: null });
        }
        await Resturant.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: httpStatusText.SUCCESS, message: "Restaurant deleted successfully", data: null });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
}




