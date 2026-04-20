const express = require('express');
const router = express.Router();
const { getDestinations, getDestinationBySlug, getFeaturedDestinations, adminGetDestinations, createDestination, updateDestination, reorderDestinations, deleteDestination } = require('../controllers/destinations.controller');
const { authUser } = require('../middlewares/auth.middleware');

// Public
router.get('/', getDestinations);
router.get('/slug/:slug', getDestinationBySlug);
router.get('/featured', getFeaturedDestinations);

// Admin (protected)
router.get('/admin', authUser, adminGetDestinations);
router.post('/', authUser, createDestination);
router.put('/reorder', authUser, reorderDestinations);
router.put('/:id', authUser, updateDestination);
router.delete('/:id', authUser, deleteDestination);

module.exports = router;
