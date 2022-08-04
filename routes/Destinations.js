const express = require('express');
const router = express.Router();
const Destinations = require('../controllers/Destinations');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateDestination } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(Destinations.index))
    .post(isLoggedIn, upload.array('image'), validateDestination, catchAsync(Destinations.createDestination))


router.get('/new', isLoggedIn, Destinations.renderNewForm)

router.route('/:id')
    .get(catchAsync(Destinations.showDestination))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateDestination, catchAsync(Destinations.updateDestination))
    .delete(isLoggedIn, isAuthor, catchAsync(Destinations.deleteDestination));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(Destinations.renderEditForm))



module.exports = router;