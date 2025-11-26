const express = require('express');
const router = express.Router();
const citiesController = require('../controllers/cities.controller');

// Search cities endpoint
router.get('/search', citiesController.searchCities);

// Alternative: Teleport API endpoint
router.get('/search-teleport', citiesController.searchCitiesTeleport);

module.exports = router;
