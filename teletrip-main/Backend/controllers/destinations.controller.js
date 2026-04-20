const mongoose = require('mongoose');
const Destination = require('../models/destination.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const { generateSlug } = require('../utils/slug.util');

// Public: Get all active destinations
const getDestinations = asyncErrorHandler(async (req, res) => {
  const destinations = await Destination.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
  return ApiResponse.success(res, destinations, 'Destinations retrieved');
});

// Public: Get a single destination by slug
const getDestinationBySlug = asyncErrorHandler(async (req, res) => {
  const { slug } = req.params;
  const destination = await Destination.findOne({ slug }).lean();
  if (!destination) {
    return ApiResponse.error(res, 'Destination not found', 404);
  }
  return ApiResponse.success(res, destination, 'Destination retrieved');
});

// Public: Get featured destinations (isFeatured: true, isActive: true)
const getFeaturedDestinations = asyncErrorHandler(async (req, res) => {
  const destinations = await Destination.find({ isFeatured: true, isActive: true }).sort({ order: 1 }).lean();
  return ApiResponse.success(res, destinations, 'Featured destinations retrieved');
});

// Admin: Get all destinations (including inactive)
const adminGetDestinations = asyncErrorHandler(async (req, res) => {
  const destinations = await Destination.find().sort({ order: 1, createdAt: -1 }).lean();
  return ApiResponse.success(res, destinations, 'All destinations retrieved');
});

// Admin: Create destination
const createDestination = asyncErrorHandler(async (req, res) => {
  const {
    name, country, image, tag, description, isActive, order,
    heroImage, gallery, longDescription, highlights, seo,
    isFeatured, continent
  } = req.body;

  if (!name || !country || !image) {
    return ApiResponse.error(res, 'Name, country, and image are required', 400);
  }

  // Auto-generate slug from name + country
  const slug = generateSlug(name, country);

  // Check for slug uniqueness
  const existingDestination = await Destination.findOne({ slug }).lean();
  if (existingDestination) {
    return ApiResponse.error(res, 'A destination with this slug already exists', 409);
  }

  const destination = await Destination.create({
    name, country, image, tag, description, isActive, order,
    slug, heroImage, gallery, longDescription, highlights, seo,
    isFeatured, continent
  });

  return ApiResponse.success(res, destination, 'Destination created', 201);
});

// Admin: Update destination
const updateDestination = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ApiResponse.error(res, 'Invalid destination ID', 400);
  }

  const existingDestination = await Destination.findById(id);
  if (!existingDestination) {
    return ApiResponse.error(res, 'Destination not found', 404);
  }

  const updateData = { ...req.body };

  // Regenerate slug if name or country changed
  const nameChanged = updateData.name && updateData.name !== existingDestination.name;
  const countryChanged = updateData.country && updateData.country !== existingDestination.country;

  if (nameChanged || countryChanged) {
    const newName = updateData.name || existingDestination.name;
    const newCountry = updateData.country || existingDestination.country;
    const newSlug = generateSlug(newName, newCountry);

    // Check slug uniqueness (exclude current document)
    const duplicateSlug = await Destination.findOne({ slug: newSlug, _id: { $ne: id } }).lean();
    if (duplicateSlug) {
      return ApiResponse.error(res, 'A destination with this slug already exists', 409);
    }

    updateData.slug = newSlug;
  }

  const destination = await Destination.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  return ApiResponse.success(res, destination, 'Destination updated');
});

// Admin: Reorder destinations (bulk update order values)
const reorderDestinations = asyncErrorHandler(async (req, res) => {
  const { orders } = req.body;

  if (!Array.isArray(orders) || orders.length === 0) {
    return ApiResponse.error(res, 'Orders array is required', 400);
  }

  const bulkOps = orders.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order } }
    }
  }));

  await Destination.bulkWrite(bulkOps);
  return ApiResponse.success(res, null, 'Destinations reordered');
});

// Admin: Delete destination
const deleteDestination = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return ApiResponse.error(res, 'Invalid destination ID', 400);
  }

  const destination = await Destination.findByIdAndDelete(id);
  if (!destination) return ApiResponse.error(res, 'Destination not found', 404);
  return ApiResponse.success(res, null, 'Destination deleted');
});

module.exports = {
  getDestinations,
  getDestinationBySlug,
  getFeaturedDestinations,
  adminGetDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  reorderDestinations
};
