const Resturat = require('../models/resturantModel');

exports.getAllRestaurants = async (req, res) => {

    const resturants = await Resturat.find();
    res.json({ status: httpStatusText.SUCCESS, data: { resturants } })

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
            return res.status(404).json({ status: httpStatusText.FAIL, data: { resturant: "user not found " } })
        }
        res.json({ status: httpStatusText.SUCCESS, data: { resturant } })
    } catch (error) {
        return res.status(400).json({ status: httpStatusText.ERROR, data: null, message: error.message, code: 400 })

    }
}

exports.updateResturant = async (req, res) => {
    const id = req.params.id
    try {
        const updatedResturant = await Resturat.updateOne({ _id: id }, { $set: { ...req.body } })
        res.status(200).json({ status: httpStatusText.SUCCESS, data: { resturant: updatedResturant } });

    } catch (error) {
        return res.status(400).json({ status: httpStatusText.ERROR, message: error.message })
    }
}

exports.deleteResturant = async (req, res) => {
    const deletedResturant = await Resturat.deleteOne({ _id: req.params.id })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
}




