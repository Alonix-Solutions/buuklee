const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Restaurant = require('../models/Restaurant');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Hotel, restaurant, taxi, and vehicle bookings
 */

/**
 * @swagger
 * /api/bookings/hotels:
 *   post:
 *     summary: Book a hotel
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelId
 *               - checkIn
 *               - checkOut
 *               - guests
 *             properties:
 *               hotelId:
 *                 type: string
 *               checkIn:
 *                 type: string
 *                 format: date-time
 *               checkOut:
 *                 type: string
 *                 format: date-time
 *               guests:
 *                 type: integer
 *               roomType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hotel booking created
 */
router.post('/hotels', authenticate, [
  body('hotelId').isMongoId().withMessage('Valid hotel ID required'),
  body('checkIn').isISO8601().toDate().withMessage('Valid check-in date required'),
  body('checkOut').isISO8601().toDate().withMessage('Valid check-out date required'),
  body('guests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
  body('roomType').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { hotelId, checkIn, checkOut, guests, roomType, notes } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found or not available'
      });
    }

    // Calculate price (simplified - can be enhanced)
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const roomPrice = hotel.roomTypes.find(rt => rt.type === roomType)?.price || hotel.priceRange.min;
    const totalAmount = roomPrice * nights * guests;

    const booking = new Booking({
      userId: req.userId,
      type: 'hotel',
      itemId: hotelId,
      itemModel: 'Hotel',
      details: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
        roomType
      },
      payment: {
        amount: totalAmount,
        currency: hotel.priceRange.currency || 'MUR',
        status: 'pending'
      },
      bookingReference: null, // Will be auto-generated
      notes
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Hotel booking created. Please complete payment.',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        hotel: {
          name: hotel.name,
          location: hotel.location
        },
        checkIn: booking.details.checkIn,
        checkOut: booking.details.checkOut,
        guests: booking.details.guests,
        amount: booking.payment.amount,
        currency: booking.payment.currency,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Hotel booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create hotel booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings/restaurants:
 *   post:
 *     summary: Book a restaurant reservation
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - reservationDate
 *               - reservationTime
 *               - partySize
 *             properties:
 *               restaurantId:
 *                 type: string
 *               reservationDate:
 *                 type: string
 *                 format: date-time
 *               reservationTime:
 *                 type: string
 *               partySize:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reservation created
 */
router.post('/restaurants', authenticate, [
  body('restaurantId').isMongoId().withMessage('Valid restaurant ID required'),
  body('reservationDate').isISO8601().toDate().withMessage('Valid reservation date required'),
  body('reservationTime').notEmpty().withMessage('Reservation time required'),
  body('partySize').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
  body('specialRequests').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { restaurantId, reservationDate, reservationTime, partySize, specialRequests } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found or not available'
      });
    }

    // Check capacity
    if (restaurant.capacity > 0 && partySize > restaurant.capacity) {
      return res.status(400).json({
        success: false,
        error: `Party size exceeds restaurant capacity (${restaurant.capacity})`
      });
    }

    const booking = new Booking({
      userId: req.userId,
      type: 'restaurant',
      itemId: restaurantId,
      itemModel: 'Restaurant',
      details: {
        reservationDate: new Date(reservationDate),
        reservationTime,
        partySize,
        specialRequests
      },
      payment: {
        amount: 0, // Restaurant reservations typically don't require upfront payment
        currency: 'MUR',
        status: 'paid'
      },
      status: 'confirmed',
      notes: specialRequests
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Restaurant reservation created',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        restaurant: {
          name: restaurant.name,
          location: restaurant.location,
          whatsappNumber: restaurant.whatsappNumber
        },
        reservationDate: booking.details.reservationDate,
        reservationTime: booking.details.reservationTime,
        partySize: booking.details.partySize,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Restaurant booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create restaurant reservation'
    });
  }
});

/**
 * @swagger
 * /api/bookings/taxis:
 *   post:
 *     summary: Book a taxi/driver
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickupLocation
 *               - dropoffLocation
 *               - pickupTime
 *             properties:
 *               driverId:
 *                 type: string
 *               pickupLocation:
 *                 type: object
 *               dropoffLocation:
 *                 type: object
 *               pickupTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Taxi booked
 */
router.post('/taxis', authenticate, [
  body('driverId').optional().isMongoId(),
  body('pickupLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Pickup coordinates required'),
  body('dropoffLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Dropoff coordinates required'),
  body('pickupTime').isISO8601().toDate().withMessage('Valid pickup time required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { driverId, pickupLocation, dropoffLocation, pickupTime, estimatedDistance, estimatedDuration } = req.body;

    let driver;

    // If driverId provided, use that driver
    if (driverId) {
      driver = await Driver.findById(driverId).populate('userId', 'name phone');
      if (!driver || !driver.isActive || !driver.isVerified) {
        return res.status(404).json({
          success: false,
          error: 'Driver not found or not available'
        });
      }
    } else {
      // Find nearest available driver
      const drivers = await Driver.find({
        'availability.isAvailable': true,
        isActive: true,
        isVerified: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: pickupLocation.coordinates
            },
            $maxDistance: 10000 // 10km radius
          }
        }
      }).limit(1).populate('userId', 'name phone');

      if (drivers.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No available drivers found nearby'
        });
      }

      driver = drivers[0];
    }

    // Calculate price
    const distanceKm = estimatedDistance ? estimatedDistance / 1000 : 5; // Default 5km if not provided
    const durationHours = estimatedDuration ? estimatedDuration / 60 : 0.5; // Default 30min

    const baseRate = driver.pricing.baseRate || 0;
    const distanceCost = (driver.pricing.perKm || 0) * distanceKm;
    const timeCost = (driver.pricing.perHour || 0) * durationHours;
    const totalAmount = baseRate + distanceCost + timeCost;

    const booking = new Booking({
      userId: req.userId,
      type: 'taxi',
      itemId: driver._id,
      itemModel: 'Driver',
      details: {
        pickupLocation: {
          type: 'Point',
          coordinates: pickupLocation.coordinates,
          address: pickupLocation.address || ''
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: dropoffLocation.coordinates,
          address: dropoffLocation.address || ''
        },
        pickupTime: new Date(pickupTime),
        estimatedDuration: estimatedDuration || 30,
        estimatedDistance: estimatedDistance || 5000
      },
      payment: {
        amount: totalAmount,
        currency: driver.pricing.currency || 'MUR',
        status: 'pending'
      },
      status: 'pending'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Taxi booking created',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        driver: {
          name: driver.userId.name,
          phone: driver.userId.phone,
          vehicle: driver.vehicleInfo
        },
        pickupLocation: booking.details.pickupLocation,
        dropoffLocation: booking.details.dropoffLocation,
        pickupTime: booking.details.pickupTime,
        estimatedDistance: booking.details.estimatedDistance,
        estimatedDuration: booking.details.estimatedDuration,
        amount: booking.payment.amount,
        currency: booking.payment.currency,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Taxi booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create taxi booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings/vehicles:
 *   post:
 *     summary: Book a vehicle rental
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - rentalStart
 *               - rentalEnd
 *               - rentalPeriod
 *             properties:
 *               vehicleId:
 *                 type: string
 *               rentalStart:
 *                 type: string
 *                 format: date-time
 *               rentalEnd:
 *                 type: string
 *                 format: date-time
 *               rentalPeriod:
 *                 type: string
 *                 enum: [hourly, daily, weekly, monthly]
 *     responses:
 *       201:
 *         description: Vehicle booked
 */
router.post('/vehicles', authenticate, [
  body('vehicleId').isMongoId().withMessage('Valid vehicle ID required'),
  body('rentalStart').isISO8601().toDate().withMessage('Valid rental start date required'),
  body('rentalEnd').isISO8601().toDate().withMessage('Valid rental end date required'),
  body('rentalPeriod').isIn(['hourly', 'daily', 'weekly', 'monthly']).withMessage('Invalid rental period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { vehicleId, rentalStart, rentalEnd, rentalPeriod } = req.body;

    const vehicle = await Vehicle.findById(vehicleId).populate('ownerId', 'name phone');
    if (!vehicle || !vehicle.isActive || !vehicle.availability.isAvailable) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found or not available'
      });
    }

    // Check availability dates
    const start = new Date(rentalStart);
    const end = new Date(rentalEnd);

    if (vehicle.availability.availableFrom && start < vehicle.availability.availableFrom) {
      return res.status(400).json({
        success: false,
        error: 'Rental start date is before vehicle availability'
      });
    }

    if (vehicle.availability.availableUntil && end > vehicle.availability.availableUntil) {
      return res.status(400).json({
        success: false,
        error: 'Rental end date is after vehicle availability'
      });
    }

    // Calculate price based on period
    const durationMs = end - start;
    let duration;
    let pricePerUnit;

    switch (rentalPeriod) {
      case 'hourly':
        duration = Math.ceil(durationMs / (1000 * 60 * 60));
        pricePerUnit = vehicle.pricing.hourly || 0;
        break;
      case 'daily':
        duration = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        pricePerUnit = vehicle.pricing.daily || 0;
        break;
      case 'weekly':
        duration = Math.ceil(durationMs / (1000 * 60 * 60 * 24 * 7));
        pricePerUnit = vehicle.pricing.weekly || 0;
        break;
      case 'monthly':
        duration = Math.ceil(durationMs / (1000 * 60 * 60 * 24 * 30));
        pricePerUnit = vehicle.pricing.monthly || 0;
        break;
    }

    const totalAmount = pricePerUnit * duration;

    const booking = new Booking({
      userId: req.userId,
      type: 'vehicle',
      itemId: vehicleId,
      itemModel: 'Vehicle',
      details: {
        rentalStart: start,
        rentalEnd: end,
        rentalPeriod
      },
      payment: {
        amount: totalAmount,
        currency: vehicle.pricing.currency || 'MUR',
        status: 'pending'
      },
      status: 'pending'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle rental booking created',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          type: vehicle.type
        },
        rentalStart: booking.details.rentalStart,
        rentalEnd: booking.details.rentalEnd,
        rentalPeriod: booking.details.rentalPeriod,
        duration,
        amount: booking.payment.amount,
        currency: booking.payment.currency,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Vehicle booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create vehicle rental booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings/nearby-taxis:
 *   get:
 *     summary: Find nearby available taxis
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of nearby taxis
 */
router.get('/nearby-taxis', [
  query('longitude').isFloat().withMessage('Valid longitude required'),
  query('latitude').isFloat().withMessage('Valid latitude required'),
  query('radius').optional().isInt({ min: 1, max: 50 }).withMessage('Radius must be 1-50 km')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const longitude = parseFloat(req.query.longitude);
    const latitude = parseFloat(req.query.latitude);
    const radius = parseInt(req.query.radius) || 10; // Default 10km

    const drivers = await Driver.find({
      'availability.isAvailable': true,
      isActive: true,
      isVerified: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert to meters
        }
      }
    })
      .populate('userId', 'name phone profilePhoto')
      .limit(20)
      .lean();

    res.json({
      success: true,
      drivers,
      count: drivers.length
    });
  } catch (error) {
    console.error('Get nearby taxis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find nearby taxis'
    });
  }
});

/**
 * @swagger
 * /api/bookings/available-vehicles:
 *   get:
 *     summary: Get available vehicles for rental
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of available vehicles
 */
router.get('/available-vehicles', [
  query('type').optional().isIn(['bike', 'car', 'scooter', 'motorcycle', 'other']),
  query('longitude').optional().isFloat(),
  query('latitude').optional().isFloat(),
  query('radius').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const query = {
      'availability.isAvailable': true,
      isActive: true
    };

    if (req.query.type) {
      query.type = req.query.type;
    }

    // If location provided, find nearby vehicles
    if (req.query.longitude && req.query.latitude) {
      const longitude = parseFloat(req.query.longitude);
      const latitude = parseFloat(req.query.latitude);
      const radius = parseInt(req.query.radius) || 50; // Default 50km

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000
        }
      };
    }

    const vehicles = await Vehicle.find(query)
      .populate('ownerId', 'name profilePhoto')
      .limit(50)
      .lean();

    res.json({
      success: true,
      vehicles,
      count: vehicles.length
    });
  } catch (error) {
    console.error('Get available vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available vehicles'
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
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
 *         description: Booking details
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('itemId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.userId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    });
  }
});

/**
 * @swagger
 * /api/bookings/user/{userId}:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User bookings list
 */
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    // Check if user is requesting their own bookings
    if (req.params.userId !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { type, status } = req.query;
    const query = { userId: req.userId };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('itemId')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.post('/:id/cancel', authenticate, [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if can be cancelled
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancelledAt = new Date();

    // Refund payment if paid
    if (booking.payment.status === 'paid') {
      booking.payment.status = 'refunded';
      // TODO: Process actual refund through payment gateway
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
});

module.exports = router;
