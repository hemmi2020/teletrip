const Destination = require('../models/destination.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');

// Public: Get all active destinations
const getDestinations = asyncErrorHandler(async (req, res) => {
  const destinations = await Destination.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
  return ApiResponse.success(res, destinations, 'Destinations retrieved');
});

// Admin: Get all destinations (including inactive)
const adminGetDestinations = asyncErrorHandler(async (req, res) => {
  const destinations = await Destination.find().sort({ order: 1, createdAt: -1 }).lean();
  return ApiResponse.success(res, destinations, 'All destinations retrieved');
});

// Admin: Create destination
const createDestination = asyncErrorHandler(async (req, res) => {
  const { name, country, image, tag, description, isActive, order } = req.body;
  if (!name || !country || !image) {
    return ApiResponse.error(res, 'Name, country, and image are required', 400);
  }
  const destination = await Destination.create({ name, country, image, tag, description, isActive, order });
  return ApiResponse.success(res, destination, 'Destination created', 201);
});

// Admin: Update destination
const updateDestination = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const destination = await Destination.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!destination) return ApiResponse.error(res, 'Destination not found', 404);
  return ApiResponse.success(res, destination, 'Destination updated');
});

// Admin: Delete destination
const deleteDestination = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const destination = await Destination.findByIdAndDelete(id);
  if (!destination) return ApiResponse.error(res, 'Destination not found', 404);
  return ApiResponse.success(res, null, 'Destination deleted');
});

module.exports = { getDestinations, adminGetDestinations, createDestination, updateDestination, deleteDestination };
