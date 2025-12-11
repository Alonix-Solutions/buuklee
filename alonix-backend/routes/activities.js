const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const ActivitySession = require('../models/ActivitySession');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity management and participation
 */

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create a new activity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - activityType
 *               - difficulty
 *               - date
 *               - meetingPoint
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               activityType:
 *                 type: string
 *                 enum: [running, cycling, hiking, swimming, walking, other]
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard, extreme]
 *               date:
 *                 type: string
 *                 format: date-time
 *               maxParticipants:
 *                 type: integer
 *               meetingPoint:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       201:
 *         description: Activity created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('activityType').isIn(['running', 'cycling', 'hiking', 'swimming', 'walking', 'other']).withMessage('Invalid activity type'),
  body('difficulty').isIn(['easy', 'medium', 'hard', 'extreme']).withMessage('Invalid difficulty level'),
  body('date').isISO8601().toDate().withMessage('Invalid date format'),
  body('maxParticipants').isInt({ min: 2 }).withMessage('Must allow at least 2 participants'),
  body('meetingPoint.address').notEmpty().withMessage('Meeting point address is required'),
  body('meetingPoint.coordinates').isArray({ min: 2, max: 2 }).withMessage('Meeting point coordinates required [longitude, latitude]')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const activityData = {
      ...req.body,
      organizerId: req.userId,
      currentParticipants: 1, // Organizer is automatically a participant
      participants: [{
        userId: req.userId,
        status: 'confirmed',
        paymentStatus: 'paid' // Organizer doesn't pay
      }]
    };

    // Validate date is in future
    if (new Date(activityData.date) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Activity date must be in the future'
      });
    }

    const activity = new Activity(activityData);
    await activity.save();

    // Populate organizer details
    await activity.populate('organizerId', 'name email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create activity'
    });
  }
});

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities with filters
 *     tags: [Activities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of activities
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('activityType').optional().isIn(['running', 'cycling', 'hiking', 'swimming', 'walking', 'other']),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'extreme']),
  query('status').optional().isIn(['upcoming', 'live', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (req.query.activityType) {
      query.activityType = req.query.activityType;
    }

    if (req.query.difficulty) {
      if (req.query.difficulty.includes(',')) {
        query.difficulty = { $in: req.query.difficulty.split(',') };
      } else {
        query.difficulty = req.query.difficulty;
      }
    }

    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = 'upcoming'; // Default to upcoming
    }

    if (req.query.dateFrom && req.query.dateTo) {
      query.date = {
        $gte: new Date(req.query.dateFrom),
        $lte: new Date(req.query.dateTo)
      };
    }

    if (req.query.maxEntryFee) {
      query.entryFee = { $lte: parseFloat(req.query.maxEntryFee) };
    }

    // Search by title/description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    query.isPublic = true; // Only show public activities

    const activities = await Activity.find(query)
      .populate('organizerId', 'name profilePhoto stats')
      .sort({ date: 1 }) // Sort by date ascending
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + activities.length < total
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities'
    });
  }
});

/**
 * @swagger
 * /api/activities/nearby:
 *   get:
 *     summary: Find activities near a location
 *     tags: [Activities]
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
 *         description: Radius in km
 *     responses:
 *       200:
 *         description: List of nearby activities
 */
router.get('/nearby', [
  query('longitude').isFloat().withMessage('Valid longitude required'),
  query('latitude').isFloat().withMessage('Valid latitude required'),
  query('radius').optional().isInt({ min: 1, max: 500 }).withMessage('Radius must be 1-500 km')
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
    const radius = parseInt(req.query.radius) || 50; // Default 50km

    const activities = await Activity.find({
      status: 'upcoming',
      isPublic: true,
      'meetingPoint': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert to meters
        }
      }
    })
      .populate('organizerId', 'name profilePhoto')
      .limit(20);

    res.json({
      success: true,
      activities,
      count: activities.length
    });
  } catch (error) {
    console.error('Get nearby activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby activities'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Get activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Activity details
 *       404:
 *         description: Activity not found
 */
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid activity ID format'
      });
    }

    const activity = await Activity.findById(req.params.id)
      .populate('organizerId', 'name email profilePhoto stats')
      .populate('participants.userId', 'name profilePhoto');

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Update activity
 *     tags: [Activities]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity updated
 *       403:
 *         description: Not authorized
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is organizer
    if (activity.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the organizer can update this activity'
      });
    }

    // Prevent updating if activity is live or completed
    if (['live', 'completed'].includes(activity.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update activity that is live or completed'
      });
    }

    const allowedUpdates = ['title', 'description', 'date', 'meetingPoint', 'photos', 'organizerServices'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(activity, updates);
    await activity.save();

    await activity.populate('organizerId', 'name profilePhoto');

    res.json({
      success: true,
      message: 'Activity updated successfully',
      activity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update activity'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Cancel/Delete activity
 *     tags: [Activities]
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
 *         description: Activity cancelled
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is organizer
    if (activity.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the organizer can delete this activity'
      });
    }

    // Mark as cancelled instead of deleting
    activity.status = 'cancelled';
    await activity.save();

    // TODO: Send notifications to all participants

    res.json({
      success: true,
      message: 'Activity cancelled successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel activity'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}/join:
 *   post:
 *     summary: Join an activity
 *     tags: [Activities]
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
 *         description: Successfully joined
 */
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if activity is full
    if (activity.isFull) {
      return res.status(400).json({
        success: false,
        error: 'Activity is full'
      });
    }

    // Check if activity is upcoming
    if (activity.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        error: 'Cannot join activity that is not upcoming'
      });
    }

    // Check if user already joined
    if (activity.isParticipant(req.userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already joined this activity'
      });
    }

    // Add participant
    await activity.addParticipant(req.userId);

    await activity.populate('participants.userId', 'name profilePhoto');

    // TODO: Send notification to organizer

    res.json({
      success: true,
      message: 'Successfully joined activity',
      activity
    });
  } catch (error) {
    console.error('Join activity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to join activity'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}/leave:
 *   post:
 *     summary: Leave an activity
 *     tags: [Activities]
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
 *         description: Successfully left
 */
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is organizer
    if (activity.organizerId.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Organizer cannot leave their own activity. Cancel the activity instead.'
      });
    }

    // Check if user is participant
    if (!activity.isParticipant(req.userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are not a participant of this activity'
      });
    }

    // Remove participant
    await activity.removeParticipant(req.userId);

    // TODO: Process refund if payment was made

    res.json({
      success: true,
      message: 'Successfully left activity'
    });
  } catch (error) {
    console.error('Leave activity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to leave activity'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}/book-service:
 *   post:
 *     summary: Book organizer's service
 *     tags: [Activities]
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
 *               - serviceType
 *             properties:
 *               serviceType:
 *                 type: string
 *                 enum: [transport, accommodation]
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Service booked
 */
router.post('/:id/book-service', authenticate, [
  body('serviceType').isIn(['transport', 'accommodation']).withMessage('Invalid service type'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is participant
    if (!activity.isParticipant(req.userId)) {
      return res.status(400).json({
        success: false,
        error: 'You must join the activity first'
      });
    }

    const { serviceType, quantity = 1 } = req.body;

    await activity.bookOrganizerService(serviceType, quantity);

    res.json({
      success: true,
      message: `Successfully booked ${serviceType}`,
      activity
    });
  } catch (error) {
    console.error('Book service error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to book service'
    });
  }
});

/**
 * @swagger
 * /api/activities/user/{userId}:
 *   get:
 *     summary: Get user's activities
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, organized, joined]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User activities list
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'all', status = 'all' } = req.query;

    let query = {};

    if (type === 'organized') {
      query.organizerId = userId;
    } else if (type === 'joined') {
      query['participants.userId'] = userId;
    } else {
      // Both organized and joined
      query.$or = [
        { organizerId: userId },
        { 'participants.userId': userId }
      ];
    }

    if (status !== 'all') {
      query.status = status;
    }

    const activities = await Activity.find(query)
      .populate('organizerId', 'name profilePhoto')
      .sort({ date: -1 })
      .limit(50);

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user activities'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}/start-session:
 *   post:
 *     summary: Start live tracking session
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Session started
 */
router.post('/:id/start-session', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is organizer
    if (activity.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the organizer can start the activity session'
      });
    }

    // Check if activity is in correct status
    if (activity.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        error: `Cannot start session for activity with status: ${activity.status}`
      });
    }

    // Check if there's already an active session
    const existingSession = await ActivitySession.findOne({
      activityId: activity._id,
      status: 'active'
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        error: 'An active session already exists for this activity'
      });
    }

    // Get all participants
    const participants = await User.find({
      _id: { $in: activity.participants.map(p => p.userId) }
    });

    // Create session with all participants
    const session = new ActivitySession({
      activityId: activity._id,
      participants: participants.map(p => ({
        userId: p._id,
        userName: p.name,
        currentLocation: {
          type: 'Point',
          coordinates: p.location?.coordinates || [0, 0]
        },
        route: {
          type: 'LineString',
          coordinates: []
        },
        stats: {
          distance: 0,
          duration: 0,
          pace: 0,
          speed: 0,
          elevation: 0,
          heartRate: 0,
          calories: 0,
          steps: 0,
          batteryLevel: 100
        },
        status: 'active'
      })),
      status: 'active'
    });

    await session.save();

    // Update activity status to 'live'
    activity.status = 'live';
    await activity.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(activity._id.toString()).emit('session-started', {
        sessionId: session._id,
        activityId: activity._id,
        startTime: session.startTime,
        participants: session.participants.map(p => ({
          userId: p.userId,
          userName: p.userName
        }))
      });
    }

    res.status(201).json({
      success: true,
      message: 'Activity session started successfully',
      session: {
        id: session._id,
        activityId: activity._id,
        startTime: session.startTime,
        participantCount: session.participants.length,
        status: session.status
      }
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start activity session'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}/end-session:
 *   post:
 *     summary: End live tracking session
 *     tags: [Activities]
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
 *         description: Session ended
 */
router.post('/:id/end-session', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is organizer
    if (activity.organizerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the organizer can end the activity session'
      });
    }

    // Find active session
    const session = await ActivitySession.findOne({
      activityId: activity._id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'No active session found for this activity'
      });
    }

    // Calculate final group stats
    await session.calculateGroupStats();

    // End session
    session.endTime = new Date();
    session.status = 'completed';
    await session.save();

    // Update activity status to 'completed'
    activity.status = 'completed';
    await activity.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(activity._id.toString()).emit('session-ended', {
        sessionId: session._id,
        activityId: activity._id,
        endTime: session.endTime,
        groupStats: session.groupStats
      });
    }

    res.json({
      success: true,
      message: 'Activity session ended successfully',
      session: {
        id: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.endTime - session.startTime,
        groupStats: session.groupStats
      }
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end activity session'
    });
  }
});

/**
 * @swagger
 * /api/activities/{id}/session:
 *   get:
 *     summary: Get active session
 *     tags: [Activities]
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
 *         description: Active session details
 */
router.get('/:id/session', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is participant or organizer
    const isParticipant = activity.isParticipant(req.userId) ||
      activity.organizerId.toString() === req.userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You must be a participant to view the session'
      });
    }

    const session = await ActivitySession.findOne({
      activityId: activity._id,
      status: 'active'
    })
      .populate('participants.userId', 'name profilePhoto')
      .populate('groupStats.leadingParticipant', 'name')
      .populate('groupStats.trailingParticipant', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'No active session found for this activity'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session'
    });
  }
});

/**
 * @route   GET /api/activities/:id/session/participants
 * @desc    Get live participant data for active session
 * @access  Private (Participants only)
 */
router.get('/:id/session/participants', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is participant or organizer
    const isParticipant = activity.isParticipant(req.userId) ||
      activity.organizerId.toString() === req.userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You must be a participant to view participant data'
      });
    }

    const session = await ActivitySession.findOne({
      activityId: activity._id,
      status: 'active'
    })
      .populate('participants.userId', 'name profilePhoto')
      .select('participants groupStats');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'No active session found for this activity'
      });
    }

    res.json({
      success: true,
      participants: session.participants,
      groupStats: session.groupStats
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participant data'
    });
  }
});

/**
 * @route   GET /api/activities/:id/sessions
 * @desc    Get all sessions for an activity (history)
 * @access  Private (Participants only)
 */
router.get('/:id/sessions', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is participant or organizer
    const isParticipant = activity.isParticipant(req.userId) ||
      activity.organizerId.toString() === req.userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You must be a participant to view session history'
      });
    }

    const sessions = await ActivitySession.find({
      activityId: activity._id
    })
      .populate('participants.userId', 'name profilePhoto')
      .populate('groupStats.leadingParticipant', 'name')
      .populate('groupStats.trailingParticipant', 'name')
      .sort({ startTime: -1 });

    res.json({
      success: true,
      sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session history'
    });
  }
});

/**
 * @route   GET /api/activities/:id/sessions/:sessionId
 * @desc    Get specific session details
 * @access  Private (Participants only)
 */
router.get('/:id/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check if user is participant or organizer
    const isParticipant = activity.isParticipant(req.userId) ||
      activity.organizerId.toString() === req.userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You must be a participant to view session details'
      });
    }

    const session = await ActivitySession.findOne({
      _id: req.params.sessionId,
      activityId: activity._id
    })
      .populate('participants.userId', 'name profilePhoto')
      .populate('groupStats.leadingParticipant', 'name')
      .populate('groupStats.trailingParticipant', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session details'
    });
  }
});

module.exports = router;
