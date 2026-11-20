const express = require('express');
const router = express.Router();
const { getDestinations, getDestinationBySlug, getFeaturedDestinations, adminGetDestinations, createDestination, updateDestination, reorderDestinations, deleteDestination } = require('../controllers/destinations.controller');
const { authUser, requireAdmin } = require('../middlewares/auth.middleware');

// Public
router.get('/', getDestinations);
router.get('/slug/:slug', getDestinationBySlug);
router.get('/featured', getFeaturedDestinations);

// Admin (strictly protected with RBAC)
router.get('/admin', ...requireAdmin, adminGetDestinations);
router.post('/', ...requireAdmin, createDestination);
router.put('/reorder', ...requireAdmin, reorderDestinations);
router.put('/:id', ...requireAdmin, updateDestination);
router.delete('/:id', ...requireAdmin, deleteDestination);

module.exports = router;
