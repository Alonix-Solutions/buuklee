const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Rides
 *   description: Ride sharing and booking
 */

/**
 * @swagger
 * /api/rides:
 *   post:
 *     summary: Create a new ride offer
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - date
 *               - seats
 *               - price
 *             properties:
 *               origin:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *               destination:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               seats:
 *                 type: integer
 *               price:
 *                 type: number
 *               vehicle:
 *                 type: object
 *     responses:
 *       201:
 *         description: Ride created
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, [
    check('origin.address', 'Origin address is required').not().isEmpty(),
    check('destination.address', 'Destination address is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('seats', 'Seats must be a number greater than 0').isInt({ min: 1 }),
    check('price', 'Price is required').isNumeric(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { activityId, origin, destination, date, time, seats, price, currency, vehicle, description } = req.body;

        const ride = new Ride({
            driverId: req.userId,
            activityId,
            origin,
            destination,
            date,
            time,
            seats,
            availableSeats: seats, // Initially all seats are available
            price,
            currency: currency || 'Rs',
            vehicle,
            description
        });

        await ride.save();

        // Populate driver info for response
        await ride.populate('driverId', 'name profilePhoto phone rating');

        res.status(201).json({ success: true, ride });
    } catch (err) {
        console.error('Create ride error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

/**
 * @swagger
 * /api/rides:
 *   get:
 *     summary: Get all rides
 *     tags: [Rides]
 *     parameters:
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of rides
 */
router.get('/', async (req, res) => {
    try {
        const { activityId } = req.query;
        const query = { status: 'active', availableSeats: { $gt: 0 } };

        if (activityId) {
            query.activityId = activityId;
        }

        // Filter out past rides
        query.date = { $gte: new Date() };

        const rides = await Ride.find(query)
            .populate('driverId', 'name profilePhoto phone rating vehicle')
            .sort({ date: 1 });

        res.json({ success: true, rides });
    } catch (err) {
        console.error('Get rides error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

/**
 * @swagger
 * /api/rides/{id}/join:
 *   post:
 *     summary: Join a ride
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined ride
 *       400:
 *         description: Ride full or invalid
 */
router.post('/:id/join', authenticate, async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }

        if (ride.driverId.toString() === req.userId) {
            return res.status(400).json({ success: false, error: 'Cannot join your own ride' });
        }

        if (ride.availableSeats <= 0) {
            return res.status(400).json({ success: false, error: 'Ride is full' });
        }

        // Check if already joined
        const alreadyJoined = ride.passengers.some(p => p.userId.toString() === req.userId);
        if (alreadyJoined) {
            return res.status(400).json({ success: false, error: 'You have already joined this ride' });
        }

        ride.passengers.push({ userId: req.userId });
        ride.availableSeats -= 1;

        if (ride.availableSeats === 0) {
            ride.status = 'full';
        }

        await ride.save();

        res.json({ success: true, ride });
    } catch (err) {
        console.error('Join ride error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
