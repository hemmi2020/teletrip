const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');

router.get('/transfers', locationsController.getTransferLocations);

module.exports = router;
