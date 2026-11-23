const Coupon = require('../models/coupon.model');
const AdminActivity = require('../models/adminactivity.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');

// GET all coupons (admin)
const getCoupons = asyncErrorHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status === 'active') {
    query.isActive = true;
    query.validUntil = { $gte: new Date() };
  } else if (req.query.status === 'expired') {
    query.validUntil = { $lt: new Date() };
  } else if (req.query.status === 'inactive') {
    query.isActive = false;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { code: searchRegex },
      { description: searchRegex }
    ];
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(query)
  ]);

  return ApiResponse.success(res, {
    coupons,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  }, 'Coupons retrieved successfully');
});

// POST create coupon (admin)
const createCoupon = asyncErrorHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minBookingAmount,
    maxDiscountAmount,
    currency,
    validFrom,
    validUntil,
    usageLimit,
    applicableDestinations
  } = req.body;

  if (!code || !discountValue || !validUntil) {
    return ApiResponse.badRequest(res, 'Code, discount value, and expiration date are required');
  }

  const cleanCode = code.trim().toUpperCase();
  const existing = await Coupon.findOne({ code: cleanCode });
  if (existing) {
    return ApiResponse.badRequest(res, `Coupon code '${cleanCode}' already exists`);
  }

  const coupon = await Coupon.create({
    code: cleanCode,
    description: description ? description.trim() : '',
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minBookingAmount: Number(minBookingAmount) || 0,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
    currency: (currency || 'USD').toUpperCase(),
    validFrom: validFrom ? new Date(validFrom) : new Date(),
    validUntil: new Date(validUntil),
    usageLimit: Number(usageLimit) || 100,
    applicableDestinations: Array.isArray(applicableDestinations) ? applicableDestinations : [],
    createdBy: req.user?._id || req.user?.id
  });

  try {
    await AdminActivity.create({
      admin: req.user?._id || req.user?.id,
      action: 'coupon_created',
      target: 'coupon',
      targetId: coupon._id,
      details: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      metadata: { newValues: coupon.toObject(), reason: 'Created new discount promo coupon' }
    });
  } catch (err) {
    console.error('[Coupon] Activity log error:', err.message);
  }

  return ApiResponse.created(res, coupon, 'Coupon created successfully');
});

// PUT update coupon (admin)
const updateCoupon = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await Coupon.findById(id);
  if (!existing) {
    return ApiResponse.notFound(res, 'Coupon not found');
  }

  const oldValues = existing.toObject();
  const updatable = [
    'description', 'discountType', 'discountValue', 'minBookingAmount',
    'maxDiscountAmount', 'currency', 'validFrom', 'validUntil',
    'usageLimit', 'applicableDestinations', 'isActive'
  ];

  updatable.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'validUntil' || field === 'validFrom') {
        existing[field] = new Date(req.body[field]);
      } else {
        existing[field] = req.body[field];
      }
    }
  });

  await existing.save();

  try {
    await AdminActivity.create({
      admin: req.user?._id || req.user?.id,
      action: 'coupon_updated',
      target: 'coupon',
      targetId: existing._id,
      metadata: { oldValues, newValues: existing.toObject(), reason: 'Updated promo coupon' }
    });
  } catch (err) {
    console.error('[Coupon] Activity log error:', err.message);
  }

  return ApiResponse.success(res, existing, 'Coupon updated successfully');
});

// DELETE coupon (admin)
const deleteCoupon = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    return ApiResponse.notFound(res, 'Coupon not found');
  }

  try {
    await AdminActivity.create({
      admin: req.user?._id || req.user?.id,
      action: 'coupon_deleted',
      target: 'coupon',
      targetId: coupon._id,
      metadata: { oldValues: coupon.toObject(), reason: 'Deleted promo coupon' }
    });
  } catch (err) {
    console.error('[Coupon] Activity log error:', err.message);
  }

  return ApiResponse.success(res, { deletedId: id }, 'Coupon deleted successfully');
});

// PATCH toggle coupon active state (admin)
const toggleCoupon = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    return ApiResponse.notFound(res, 'Coupon not found');
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return ApiResponse.success(res, coupon, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`);
});

// POST validate coupon (Storefront Checkout validation)
const validateCoupon = asyncErrorHandler(async (req, res) => {
  const { code, bookingAmount, destination } = req.body;

  if (!code) {
    return ApiResponse.badRequest(res, 'Coupon code is required');
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon) {
    return ApiResponse.badRequest(res, 'Invalid coupon code');
  }

  if (!coupon.isActive) {
    return ApiResponse.badRequest(res, 'This coupon is no longer active');
  }

  const now = new Date();
  if (coupon.validFrom && now < new Date(coupon.validFrom)) {
    return ApiResponse.badRequest(res, 'This coupon is not yet valid');
  }

  if (coupon.validUntil && now > new Date(coupon.validUntil)) {
    return ApiResponse.badRequest(res, 'This coupon has expired');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return ApiResponse.badRequest(res, 'This coupon has reached its maximum usage limit');
  }

  const amount = Number(bookingAmount) || 0;
  if (coupon.minBookingAmount && amount < coupon.minBookingAmount) {
    return ApiResponse.badRequest(res, `Minimum booking amount of ${coupon.currency} ${coupon.minBookingAmount} required for this coupon`);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    // fixed amount
    discountAmount = Math.min(coupon.discountValue, amount);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;
  const finalAmount = Math.max(0, Math.round((amount - discountAmount) * 100) / 100);

  return ApiResponse.success(res, {
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    originalAmount: amount,
    finalAmount,
    currency: coupon.currency
  }, 'Coupon applied successfully!');
});

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  validateCoupon
};
