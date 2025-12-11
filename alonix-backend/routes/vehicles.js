const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const { authenticate: auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle rentals and availability
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of vehicles
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
 * @swagger
 * /api/vehicles/available:
 *   get:
 *     summary: Get available vehicles
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of available vehicles
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
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle details
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
 * @swagger
 * /api/vehicles/{id}/book:
 *   post:
 *     summary: Book a vehicle
 *     tags: [Vehicles]
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
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Vehicle booked
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
