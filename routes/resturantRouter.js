const express = require('express');

const router = express.Router();

const multer = require('multer');
const path = require('path');
const resturantController = require('../controller/resturantController');

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder where images will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Set a unique file name
    }
});

// File upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
});



router.get('/', resturantController.getAllRestaurants);

router.post('/', upload.single('imgUrl'), resturantController.createRestaurant);
router.route('/:id')
    .get(resturantController.getResturant).patch(resturantController.updateResturant).delete(resturantController.deleteResturant);




module.exports = router;

