const MarkupRule = require('../models/markupRule.model');
const AdminActivity = require('../models/adminactivity.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const MarkupEngine = require('../services/markupEngine.service');

// GET all markup rules
const getMarkupRules = asyncErrorHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.ruleType && req.query.ruleType !== 'all') {
    query.ruleType = req.query.ruleType;
  }
  if (req.query.isActive !== undefined && req.query.isActive !== 'all') {
    query.isActive = req.query.isActive === 'true';
  }
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { targetDestination: searchRegex }
    ];
  }

  const [rules, total] = await Promise.all([
    MarkupRule.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MarkupRule.countDocuments(query)
  ]);

  return ApiResponse.success(res, {
    rules,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  }, 'Markup rules retrieved successfully');
});

// POST create markup rule
const createMarkupRule = asyncErrorHandler(async (req, res) => {
  const {
    name,
    description,
    ruleType,
    targetDestination,
    targetHotelId,
    targetStarRating,
    calculationType,
    markupValue,
    currency,
    priority,
    isActive
  } = req.body;

  if (!name || markupValue === undefined) {
    return ApiResponse.badRequest(res, 'Name and markup value are required');
  }

  const rule = await MarkupRule.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    ruleType: ruleType || 'global',
    targetDestination: targetDestination ? targetDestination.trim() : undefined,
    targetHotelId: targetHotelId ? targetHotelId.trim() : undefined,
    targetStarRating: targetStarRating ? Number(targetStarRating) : undefined,
    calculationType: calculationType || 'percentage',
    markupValue: Number(markupValue),
    currency: (currency || 'USD').toUpperCase(),
    priority: Number(priority) || 0,
    isActive: isActive !== false,
    createdBy: req.user?._id || req.user?.id
  });

  // Log activity
  try {
    await AdminActivity.create({
      admin: req.user?._id || req.user?.id,
      action: 'markup_created',
      target: 'markup',
      targetId: rule._id,
      details: { name: rule.name, ruleType: rule.ruleType, markupValue: rule.markupValue },
      metadata: { newValues: rule.toObject(), reason: 'Created new pricing markup rule' }
    });
  } catch (err) {
    console.error('[Markup] Activity log error:', err.message);
  }

  MarkupEngine.invalidateCache();
  return ApiResponse.created(res, rule, 'Markup rule created successfully');
});

// PUT update markup rule
const updateMarkupRule = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await MarkupRule.findById(id);
  if (!existing) {
    return ApiResponse.notFound(res, 'Markup rule not found');
  }

  const oldValues = existing.toObject();
  const updatable = [
    'name', 'description', 'ruleType', 'targetDestination',
    'targetHotelId', 'targetStarRating', 'calculationType',
    'markupValue', 'currency', 'priority', 'isActive'
  ];

  updatable.forEach(field => {
    if (req.body[field] !== undefined) {
      existing[field] = req.body[field];
    }
  });
  existing.updatedBy = req.user?._id || req.user?.id;
  await existing.save();

  // Log activity
  try {
    await AdminActivity.create({
      admin: req.user?._id || req.user?.id,
      action: 'markup_updated',
      target: 'markup',
      targetId: existing._id,
      metadata: { oldValues, newValues: existing.toObject(), reason: 'Updated pricing markup rule' }
    });
  } catch (err) {
    console.error('[Markup] Activity log error:', err.message);
  }

  MarkupEngine.invalidateCache();
  return ApiResponse.success(res, existing, 'Markup rule updated successfully');
});

// DELETE markup rule
const deleteMarkupRule = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const rule = await MarkupRule.findByIdAndDelete(id);
  if (!rule) {
    return ApiResponse.notFound(res, 'Markup rule not found');
  }

  try {
    await AdminActivity.create({
      admin: req.user?._id || req.user?.id,
      action: 'markup_deleted',
      target: 'markup',
      targetId: rule._id,
      metadata: { oldValues: rule.toObject(), reason: 'Deleted markup rule' }
    });
  } catch (err) {
    console.error('[Markup] Activity log error:', err.message);
  }

  MarkupEngine.invalidateCache();
  return ApiResponse.success(res, { deletedId: id }, 'Markup rule deleted successfully');
});

// PATCH toggle markup rule active state
const toggleMarkupRule = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const rule = await MarkupRule.findById(id);
  if (!rule) {
    return ApiResponse.notFound(res, 'Markup rule not found');
  }

  rule.isActive = !rule.isActive;
  rule.updatedBy = req.user?._id || req.user?.id;
  await rule.save();

  MarkupEngine.invalidateCache();
  return ApiResponse.success(res, rule, `Markup rule ${rule.isActive ? 'activated' : 'deactivated'}`);
});

module.exports = {
  getMarkupRules,
  createMarkupRule,
  updateMarkupRule,
  deleteMarkupRule,
  toggleMarkupRule
};
