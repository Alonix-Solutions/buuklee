const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const { authenticate: auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: Driver management and availability
 */

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: Get all drivers
 *     tags: [Drivers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of drivers
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, available } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { isActive: true };
        if (available === 'true') {
            query['availability.isAvailable'] = true;
        }

        const drivers = await Driver.find(query)
            .populate('userId', 'name profilePhoto phone')
            .sort({ rating: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Transform for frontend compatibility
        const transformedDrivers = drivers.map(d => ({
            _id: d._id,
            id: d._id,
            name: d.userId?.name || 'Driver',
            profilePhoto: d.userId?.profilePhoto,
            phone: d.userId?.phone,
            rating: d.rating || 0,
            reviewCount: d.reviewCount || 0,
            totalRides: d.totalRides || 0,
            available: d.availability?.isAvailable || false,
            verified: d.isVerified,
            vehicle: {
                make: d.vehicleInfo?.make,
                model: d.vehicleInfo?.model,
                year: d.vehicleInfo?.year,
                licensePlate: d.vehicleInfo?.licensePlate,
                color: d.vehicleInfo?.color,
                seats: d.vehicleInfo?.seats || 4,
                type: 'sedan' // Default type
            },
            location: {
                latitude: d.location?.coordinates?.[1] || 0,
                longitude: d.location?.coordinates?.[0] || 0,
                address: d.location?.address || ''
            },
            pricePerHour: d.pricing?.perHour || 500,
            pricePerDay: (d.pricing?.perHour || 500) * 8,
            services: d.services || []
        }));

        const total = await Driver.countDocuments(query);

        res.json({
            success: true,
            drivers: transformedDrivers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/drivers/available:
 *   get:
 *     summary: Get available drivers
 *     tags: [Drivers]
 *     responses:
 *       200:
 *         description: List of available drivers
 */
router.get('/available', async (req, res) => {
    try {
        const drivers = await Driver.find({
            isActive: true,
            'availability.isAvailable': true
        })
            .populate('userId', 'name profilePhoto phone')
            .sort({ rating: -1 })
            .lean();

        res.json({ success: true, drivers });
    } catch (error) {
        console.error('Get available drivers error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Get driver by ID
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver details
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid driver ID' });
        }

        const driver = await Driver.findById(id)
            .populate('userId', 'name profilePhoto phone email')
            .lean();

        if (!driver) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }

        res.json({ success: true, driver });
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/drivers/{id}/rate:
 *   post:
 *     summary: Rate a driver
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating submitted
 */
router.post('/:id/rate', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid driver ID' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
        }

        const driver = await Driver.findById(id);

        if (!driver) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }

        // Calculate new average rating
        const newReviewCount = driver.reviewCount + 1;
        const newRating = ((driver.rating * driver.reviewCount) + rating) / newReviewCount;

        driver.rating = Math.round(newRating * 10) / 10;
        driver.reviewCount = newReviewCount;
        await driver.save();

        res.json({
            success: true,
            rating: driver.rating,
            reviewCount: driver.reviewCount
        });
    } catch (error) {
        console.error('Rate driver error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
