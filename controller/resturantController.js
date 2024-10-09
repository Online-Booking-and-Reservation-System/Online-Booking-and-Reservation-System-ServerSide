const Resturat = require('../models/resturantModel');


exports.getAllRestaurants = async (req, res) => {

    try {
        const resturants = await Resturat.find();
        if (!resturants || resturants.length === 0) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "No restaurants found", data: null });
        }
        res.json({ status: httpStatusText.SUCCESS, data: { resturants } });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: "An error occurred", error: error.message });
    }
};

exports.createRestaurant = async (req, res) => {
    try {
        const newResturant = new Resturat(req.body);
        await newResturant.save();
        res.status(201).json({ status: httpStatusText.SUCCESS, data: { resturant: newResturant } });


    } catch (err) {
        res.status(400).send('Error creating new restaurant');
    }
};

exports.getResturant = async (req, res) => {

    try {
        const resturant = await Resturat.findById(req.params.id)
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
        const resturant = await Resturat.findById(id);
        if (!resturant) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Restaurant not found", data: null });
        }

        const updatedResturant = await Resturat.updateOne({ _id: id }, { $set: { ...req.body } });
        res.status(200).json({ status: httpStatusText.SUCCESS, data: { resturant: updatedResturant } });
    } catch (error) {
        return res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
};



exports.deleteResturant = async (req, res) => {
    try {
        const resturant = await Resturat.findById(req.params.id);
        if (!resturant) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: "Restaurant not found", data: null });
        }
        await Resturat.deleteOne({ _id: req.params.id });
        res.status(200).json({ status: httpStatusText.SUCCESS, message: "Restaurant deleted successfully", data: null });
    } catch (error) {
        res.status(400).json({ status: httpStatusText.ERROR, message: error.message });
    }
}




