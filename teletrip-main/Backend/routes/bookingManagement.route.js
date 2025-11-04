const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middlewares/auth.middleware');
const bookingManagementController = require('../controllers/bookingManagement.controller');

router.put('/:bookingId/modify', authenticateAdmin, bookingManagementController.modifyBooking);
router.get('/:bookingId/messages', authenticateAdmin, bookingManagementController.getMessages);
router.post('/:bookingId/messages', authenticateAdmin, bookingManagementController.sendMessage);
router.get('/:bookingId/notes', authenticateAdmin, bookingManagementController.getNotes);
router.post('/:bookingId/notes', authenticateAdmin, bookingManagementController.addNote);
router.put('/:bookingId/notes/:noteId', authenticateAdmin, bookingManagementController.updateNote);
router.delete('/:bookingId/notes/:noteId', authenticateAdmin, bookingManagementController.deleteNote);
router.get('/:bookingId/special-requests', authenticateAdmin, bookingManagementController.getSpecialRequests);
router.put('/:bookingId/special-requests/:requestId', authenticateAdmin, bookingManagementController.updateRequestStatus);
router.get('/:bookingId/timeline', authenticateAdmin, bookingManagementController.getTimeline);

module.exports = router;
