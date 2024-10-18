const express = require('express');

const router = express.Router();

const multer = require('multer');
const path = require('path');
const resturantController = require('../controller/resturantController');
const verifyToken = require('../middlware/verifyToken')
const allowedTo = require('../middlware/allowedTo')

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



router.get('/', verifyToken ,allowedTo('user','admin' , 'manager')  , resturantController.getAllRestaurants);
router.get('/', resturantController.getAllRestaurants);

router.post('/', verifyToken, allowedTo('admin', 'manager'), upload.single('imgUrl'), resturantController.createRestaurant);
router.route('/:id')
    .get(verifyToken, allowedTo('admin', 'manager'), resturantController.getResturant)
    .patch(verifyToken, allowedTo('admin', 'manager'), resturantController.updateResturant)
    .delete(verifyToken, allowedTo('admin', 'manager'), resturantController.deleteResturant);




module.exports = router;


