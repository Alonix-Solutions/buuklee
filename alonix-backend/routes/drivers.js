const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const { authenticate: auth } = require('../middleware/auth');

/**
 * @route   GET /api/drivers
 * @desc    Get all drivers with optional filters
 * @access  Public
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
 * @route   GET /api/drivers/available
 * @desc    Get available drivers
 * @access  Public
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
 * @route   GET /api/drivers/:id
 * @desc    Get driver by ID
 * @access  Public
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
 * @route   POST /api/drivers/:id/rate
 * @desc    Rate a driver
 * @access  Private
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
