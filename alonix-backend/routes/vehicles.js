const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const { authenticate: auth } = require('../middleware/auth');

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles with optional filters
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, type, available } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { isActive: true };
        if (type) query.type = type;
        if (available === 'true') {
            query['availability.isAvailable'] = true;
        }

        const vehicles = await Vehicle.find(query)
            .populate('ownerId', 'name profilePhoto phone')
            .sort({ rating: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Transform for frontend compatibility
        const transformedVehicles = vehicles.map(v => ({
            _id: v._id,
            id: v._id,
            make: v.make,
            model: v.model,
            year: v.year,
            car_type: v.type,
            type: v.type,
            name: `${v.make} ${v.model}`,
            description: v.description,
            photos: v.photos || [],
            images: v.photos || [],
            image: v.photos?.[0] || null,
            rating: v.rating || 0,
            reviewCount: v.reviewCount || 0,
            available: v.availability?.isAvailable || false,
            location: {
                latitude: v.location?.coordinates?.[1] || 0,
                longitude: v.location?.coordinates?.[0] || 0,
                address: v.location?.address || ''
            },
            features: v.features || [],
            specifications: v.specifications || {},
            seats: v.specifications?.seats || 4,
            transmission: v.specifications?.transmission || 'manual',
            fuelType: v.specifications?.fuelType,
            price: v.pricing?.daily || 0,
            pricePerHour: v.pricing?.hourly || 0,
            pricePerDay: v.pricing?.daily || 0,
            pricePerWeek: v.pricing?.weekly || 0,
            currency: v.pricing?.currency || 'MUR',
            listings: [
                { period: 'hourly', price: v.pricing?.hourly || 0 },
                { period: 'daily', price: v.pricing?.daily || 0 },
                { period: 'weekly', price: v.pricing?.weekly || 0 }
            ],
            owner: v.ownerId
        }));

        const total = await Vehicle.countDocuments(query);

        res.json({
            success: true,
            vehicles: transformedVehicles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   GET /api/vehicles/available
 * @desc    Get available vehicles
 * @access  Public
 */
router.get('/available', async (req, res) => {
    try {
        const vehicles = await Vehicle.find({
            isActive: true,
            'availability.isAvailable': true
        })
            .populate('ownerId', 'name profilePhoto phone')
            .sort({ rating: -1 })
            .lean();

        res.json({ success: true, vehicles });
    } catch (error) {
        console.error('Get available vehicles error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get vehicle by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid vehicle ID' });
        }

        const vehicle = await Vehicle.findById(id)
            .populate('ownerId', 'name profilePhoto phone email')
            .lean();

        if (!vehicle) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }

        res.json({ success: true, vehicle });
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   POST /api/vehicles/:id/book
 * @desc    Book a vehicle
 * @access  Private
 */
router.post('/:id/book', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, pickupLocation, dropoffLocation } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid vehicle ID' });
        }

        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }

        if (!vehicle.availability?.isAvailable) {
            return res.status(400).json({ success: false, error: 'Vehicle is not available' });
        }

        // Mark as unavailable during booking period
        vehicle.availability.isAvailable = false;
        await vehicle.save();

        res.json({
            success: true,
            message: 'Vehicle booked successfully',
            booking: {
                vehicleId: id,
                userId: req.user.id,
                startDate,
                endDate,
                pickupLocation,
                dropoffLocation
            }
        });
    } catch (error) {
        console.error('Book vehicle error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
