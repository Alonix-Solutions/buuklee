const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RoommateRequest = require('../models/RoommateRequest');
const { authenticate } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   POST /api/roommates
// @desc    Create a roommate request
// @access  Private
router.post('/', authenticate, [
    check('activityId', 'Activity ID is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { activityId, accommodation, preferences, budget, description } = req.body;

        // Check if user already has a request for this activity
        let existingRequest = await RoommateRequest.findOne({
            userId: req.userId,
            activityId,
            status: 'active'
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, error: 'You already have an active roommate request for this activity' });
        }

        const request = new RoommateRequest({
            userId: req.userId,
            activityId,
            accommodation,
            preferences,
            budget,
            description
        });

        await request.save();
        await request.populate('userId', 'name profilePhoto age gender');

        res.status(201).json({ success: true, request });
    } catch (err) {
        console.error('Create roommate request error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/roommates/:activityId
// @desc    Get all roommate requests for an activity
// @access  Public
router.get('/:activityId', async (req, res) => {
    try {
        const requests = await RoommateRequest.find({
            activityId: req.params.activityId,
            status: 'active'
        })
            .populate('userId', 'name profilePhoto age gender')
            .sort({ createdAt: -1 });

        res.json({ success: true, requests });
    } catch (err) {
        console.error('Get roommate requests error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
