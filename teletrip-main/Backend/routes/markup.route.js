const express = require('express');
const router = express.Router();
const markupController = require('../controllers/markup.controller');
const { authUser, requireRole } = require('../middlewares/auth.middleware');

const requireAdmin = [authUser, requireRole(['admin', 'super_admin'])];

// Admin routes
router.get('/', ...requireAdmin, markupController.getMarkupRules);
router.post('/', ...requireAdmin, markupController.createMarkupRule);
router.put('/:id', ...requireAdmin, markupController.updateMarkupRule);
router.delete('/:id', ...requireAdmin, markupController.deleteMarkupRule);
router.patch('/:id/toggle', ...requireAdmin, markupController.toggleMarkupRule);

module.exports = router;
