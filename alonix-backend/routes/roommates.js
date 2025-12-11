const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RoommateRequest = require('../models/RoommateRequest');
const { authenticate } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Roommates
 *   description: Roommate finding for activities
 */

/**
 * @swagger
 * /api/roommates:
 *   post:
 *     summary: Create roommate request
 *     tags: [Roommates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityId
 *             properties:
 *               activityId:
 *                 type: string
 *               accommodation:
 *                 type: object
 *               preferences:
 *                 type: object
 *               budget:
 *                 type: object
 *     responses:
 *       201:
 *         description: Roommate request created
 */
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

/**
 * @swagger
 * /api/roommates/{activityId}:
 *   get:
 *     summary: Get roommate requests for activity
 *     tags: [Roommates]
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of roommate requests
 */
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
