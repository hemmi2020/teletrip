const express = require('express');
const router = express.Router();
const { getDestinations, adminGetDestinations, createDestination, updateDestination, deleteDestination } = require('../controllers/destinations.controller');
const { authUser } = require('../middlewares/auth.middleware');

// Public
router.get('/', getDestinations);

// Admin (protected)
router.get('/admin', authUser, adminGetDestinations);
router.post('/', authUser, createDestination);
router.put('/:id', authUser, updateDestination);
router.delete('/:id', authUser, deleteDestination);

module.exports = router;
