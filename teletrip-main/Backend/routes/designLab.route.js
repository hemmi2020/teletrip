const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const DesignLabFeedback = require('../models/designLabFeedback.model');

const FEEDBACK_FILE = path.join(__dirname, '..', 'data', 'design_lab_feedback.json');

// Ensure data folder and feedback file exist
function ensureFeedbackFile() {
    const dir = path.dirname(FEEDBACK_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(FEEDBACK_FILE)) {
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
}

/**
 * GET /api/design-lab/feedback
 * Fetch all submitted feedback (MongoDB primary, JSON file fallback)
 */
router.get('/feedback', async (req, res) => {
    try {
        let dbFeedback = [];
        try {
            dbFeedback = await DesignLabFeedback.find().sort({ createdAt: -1 }).lean();
        } catch (dbErr) {
            console.warn('[DesignLab] MongoDB fetch failed, falling back to disk:', dbErr.message);
        }

        if (dbFeedback && dbFeedback.length > 0) {
            return res.json({
                success: true,
                source: 'mongodb',
                count: dbFeedback.length,
                feedback: dbFeedback
            });
        }

        // Fallback to disk file
        ensureFeedbackFile();
        const content = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
        const feedback = JSON.parse(content || '[]');
        return res.json({
            success: true,
            source: 'disk',
            count: feedback.length,
            feedback
        });
    } catch (err) {
        console.error('[DesignLab] Error reading feedback:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to read feedback',
            error: err.message
        });
    }
});

/**
 * POST /api/design-lab/feedback
 * Submit new client/user feedback from Design Lab (MongoDB + JSON fallback)
 */
router.post('/feedback', async (req, res) => {
    try {
        ensureFeedbackFile();
        const {
            clientName = 'Anonymous Client',
            clientEmail = '',
            preferredVariant = 'Not Specified',
            rating = 5,
            overallDirection = '',
            comments = [],
            markdown = '',
            targetName = 'HotelSearchExperience'
        } = req.body || {};

        const entryId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newEntry = {
            id: entryId,
            timestamp: new Date().toISOString(),
            clientName: String(clientName).trim() || 'Anonymous Client',
            clientEmail: String(clientEmail).trim(),
            preferredVariant,
            rating: Number(rating) || 5,
            overallDirection: String(overallDirection).trim(),
            commentsCount: (comments || []).length,
            comments: Array.isArray(comments) ? comments : [],
            markdown: String(markdown || ''),
            targetName,
            clientMeta: {
                ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'] || 'unknown'
            }
        };

        // 1. Persist to MongoDB
        try {
            await DesignLabFeedback.create(newEntry);
            console.log(`[DesignLab] Saved feedback ${entryId} to MongoDB`);
        } catch (dbErr) {
            console.warn('[DesignLab] MongoDB save failed, falling back to disk only:', dbErr.message);
        }

        // 2. Persist to local JSON file for backup
        try {
            const existingRaw = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
            const list = JSON.parse(existingRaw || '[]');
            list.unshift(newEntry); // newest first
            if (list.length > 100) list.length = 100;
            fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(list, null, 2), 'utf-8');
        } catch (fsErr) {
            console.warn('[DesignLab] Local disk file write failed:', fsErr.message);
        }

        console.log(`[DesignLab] Recorded new feedback from "${newEntry.clientName}" (${newEntry.preferredVariant}, ${newEntry.commentsCount} notes)`);

        return res.status(201).json({
            success: true,
            message: 'Feedback successfully recorded for Antigravity & the TeleTrip team!',
            feedbackId: newEntry.id
        });
    } catch (err) {
        console.error('[DesignLab] Error saving feedback:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to save feedback',
            error: err.message
        });
    }
});

module.exports = router;

