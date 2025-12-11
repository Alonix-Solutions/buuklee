const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Club = require('../models/Club');
const ClubEvent = require('../models/ClubEvent');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Clubs
 *   description: Club management and events
 */

/**
 * @swagger
 * /api/clubs:
 *   post:
 *     summary: Create a new club
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               createdFromActivity:
 *                 type: string
 *     responses:
 *       201:
 *         description: Club created
 */
router.post('/', authenticate, [
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Club name must be 3-100 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('createdFromActivity').optional().isMongoId().withMessage('Invalid activity ID'),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Location coordinates required [longitude, latitude]'),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, createdFromActivity, location, isPublic = true, tags } = req.body;

    // If creating from activity, verify it exists and user participated
    if (createdFromActivity) {
      const activity = await Activity.findById(createdFromActivity);
      if (!activity) {
        return res.status(404).json({
          success: false,
          error: 'Activity not found'
        });
      }

      // Check if user was participant or organizer
      const isParticipant = activity.isParticipant(req.userId) ||
        activity.organizerId.toString() === req.userId.toString();

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          error: 'You must have participated in the activity to create a club from it'
        });
      }

      // Only allow creating club from completed activities
      if (activity.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Can only create club from completed activities'
        });
      }
    }

    // Create club
    const clubData = {
      name,
      description,
      creatorId: req.userId,
      createdFromActivity: createdFromActivity || null,
      isPublic,
      tags: tags || []
    };

    if (location && location.coordinates) {
      clubData.location = {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || ''
      };
    }

    const club = new Club(clubData);

    // Add creator as admin member
    await club.addMember(req.userId, 'admin');

    // If created from activity, add all participants as members
    if (createdFromActivity) {
      const activity = await Activity.findById(createdFromActivity)
        .populate('participants.userId');

      for (const participant of activity.participants) {
        if (participant.userId._id.toString() !== req.userId.toString()) {
          try {
            await club.addMember(participant.userId._id, 'member');
          } catch (error) {
            // Skip if already added
          }
        }
      }
    }

    await club.save();
    await club.populate('creatorId', 'name profilePhoto');
    await club.populate('members.userId', 'name profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      club
    });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create club'
    });
  }
});

/**
 * @swagger
 * /api/clubs:
 *   get:
 *     summary: Get all clubs
 *     tags: [Clubs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of clubs
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim()
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

    const query = { status: 'active' };

    // If user is authenticated, show their clubs + public clubs
    // Otherwise, only show public clubs
    if (req.headers.authorization) {
      try {
        const { verifyToken } = require('../utils/jwt');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyToken(token);

        query.$or = [
          { isPublic: true },
          { 'members.userId': decoded.userId }
        ];
      } catch (error) {
        // Invalid token, only show public
        query.isPublic = true;
      }
    } else {
      query.isPublic = true;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const clubs = await Club.find(query)
      .populate('creatorId', 'name profilePhoto')
      .populate('members.userId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Club.countDocuments(query);

    res.json({
      success: true,
      clubs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + clubs.length < total
      }
    });
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clubs'
    });
  }
});

/**
 * @swagger
 * /api/clubs/{id}:
 *   get:
 *     summary: Get club by ID
 *     tags: [Clubs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Club details
 */
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('creatorId', 'name email profilePhoto')
      .populate('members.userId', 'name profilePhoto')
      .populate('createdFromActivity', 'title date');

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      });
    }

    // Check access
    if (!club.isPublic) {
      // Check if user is authenticated and member
      if (!req.headers.authorization) {
        return res.status(403).json({
          success: false,
          error: 'This club is private'
        });
      }

      try {
        const { verifyToken } = require('../utils/jwt');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyToken(token);

        if (!club.isMember(decoded.userId)) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }
      } catch (error) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // Calculate aggregated stats
    const memberIds = club.members.map(m => m.userId._id);

    // Aggregate completed activities for all members
    const memberActivities = await Activity.aggregate([
      {
        $match: {
          status: 'completed',
          'participants.userId': { $in: memberIds }
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          totalActivities: { $sum: 1 }
        }
      }
    ]);

    const aggregatedStats = memberActivities.length > 0 ? memberActivities[0] : { totalDistance: 0, totalActivities: 0 };

    res.json({
      success: true,
      club: {
        ...club.toObject(),
        aggregatedStats
      }
    });
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch club'
    });
  }
});

/**
 * @swagger
 * /api/clubs/{id}/join:
 *   post:
 *     summary: Join a club
 *     tags: [Clubs]
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
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      });
    }

    if (club.isMember(req.userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this club'
      });
    }

    await club.addMember(req.userId, 'member');
    await club.populate('members.userId', 'name profilePhoto');

    res.json({
      success: true,
      message: 'Successfully joined club',
      club
    });
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to join club'
    });
  }
});

/**
 * @swagger
 * /api/clubs/{id}/leave:
 *   post:
 *     summary: Leave a club
 *     tags: [Clubs]
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
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      });
    }

    if (!club.isMember(req.userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are not a member of this club'
      });
    }

    await club.removeMember(req.userId);

    res.json({
      success: true,
      message: 'Successfully left club'
    });
  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to leave club'
    });
  }
});

/**
 * @swagger
 * /api/clubs/{id}/events:
 *   post:
 *     summary: Create a club event
 *     tags: [Clubs]
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
 *               - title
 *               - date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: object
 *     responses:
 *       201:
 *         description: Event created
 *   get:
 *     summary: Get club events
 *     tags: [Clubs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events
 */
router.post('/:id/events', authenticate, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('date').isISO8601().toDate().withMessage('Invalid date format'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates required'),
  body('activityType').optional().isIn(['running', 'cycling', 'hiking', 'swimming', 'walking', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      });
    }

    if (!club.isMember(req.userId)) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to create events'
      });
    }

    const eventData = {
      clubId: club._id,
      organizerId: req.userId,
      ...req.body,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates,
        address: req.body.location.address || ''
      }
    };

    const event = new ClubEvent(eventData);
    await event.save();

    // Update club stats
    club.stats.totalActivities += 1;
    await club.save();

    // Auto-confirm organizer
    await event.confirmAvailability(req.userId, 'confirmed');

    await event.populate('organizerId', 'name profilePhoto');
    await event.populate('clubId', 'name');

    // TODO: Send push notifications to all club members

    res.status(201).json({
      success: true,
      message: 'Club event created successfully',
      event
    });
  } catch (error) {
    console.error('Create club event error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create club event'
    });
  }
});

/**
 * @route   GET /api/clubs/:id/events
 * @desc    Get all events for a club
 * @access  Public (if club is public) or Private (if member)
 */
router.get('/:id/events', [
  query('status').optional().isIn(['upcoming', 'live', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      });
    }

    // Check access
    if (!club.isPublic) {
      if (!req.headers.authorization) {
        return res.status(403).json({
          success: false,
          error: 'This club is private'
        });
      }

      try {
        const { verifyToken } = require('../utils/jwt');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyToken(token);

        if (!club.isMember(decoded.userId)) {
          return res.status(403).json({
            success: false,
            error: 'Access denied'
          });
        }
      } catch (error) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    const query = { clubId: club._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const events = await ClubEvent.find(query)
      .populate('organizerId', 'name profilePhoto')
      .populate('confirmedMembers.userId', 'name profilePhoto')
      .sort({ date: 1 })
      .lean();

    res.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Get club events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch club events'
    });
  }
});

/**
 * @swagger
 * /api/clubs/{id}/events/{eventId}/confirm:
 *   post:
 *     summary: Confirm availability for event
 *     tags: [Clubs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: eventId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, maybe, declined]
 *     responses:
 *       200:
 *         description: Availability confirmed
 */
router.post('/:id/events/:eventId/confirm', authenticate, [
  body('status').isIn(['confirmed', 'maybe', 'declined']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'Club not found'
      });
    }

    if (!club.isMember(req.userId)) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to confirm availability'
      });
    }

    const event = await ClubEvent.findOne({
      _id: req.params.eventId,
      clubId: club._id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    await event.confirmAvailability(req.userId, req.body.status);
    await event.populate('confirmedMembers.userId', 'name profilePhoto');

    res.json({
      success: true,
      message: 'Availability confirmed',
      event
    });
  } catch (error) {
    console.error('Confirm availability error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm availability'
    });
  }
});

/**
 * @route   GET /api/clubs/user/:userId
 * @desc    Get user's clubs
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const clubs = await Club.find({
      'members.userId': req.params.userId,
      'members.status': 'active',
      status: 'active'
    })
      .populate('creatorId', 'name profilePhoto')
      .populate('members.userId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      clubs,
      count: clubs.length
    });
  } catch (error) {
    console.error('Get user clubs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user clubs'
    });
  }
});

module.exports = router;
