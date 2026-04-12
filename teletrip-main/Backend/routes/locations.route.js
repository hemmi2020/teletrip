const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');

router.get('/transfers', locationsController.getTransferLocations);
router.get('/search', locationsController.searchLocations);
router.get('/address', locationsController.searchAddress);

module.exports = router;
