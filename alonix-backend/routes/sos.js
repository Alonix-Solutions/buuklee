const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SOSAlert = require('../models/SOSAlert');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: SOS
 *   description: Emergency SOS alerts and responses
 */

/**
 * @swagger
 * /api/sos/alert:
 *   post:
 *     summary: Trigger SOS emergency alert
 *     tags: [SOS]
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
 *               - location
 *             properties:
 *               activityId:
 *                 type: string
 *               location:
 *                 type: object
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: SOS alert sent
 */
router.post('/alert', authenticate, [
  body('activityId').notEmpty().withMessage('Activity ID is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates required'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { activityId, sessionId, location, reason } = req.body;
    const userId = req.userId;

    // Verify user is participant
    const activity = await Activity.findById(activityId).populate('participants.userId');

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    if (!activity.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You must be a participant to trigger SOS'
      });
    }

    // Create SOS alert
    const alert = new SOSAlert({
      userId,
      activityId,
      sessionId,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      },
      type: 'manual',
      reason: reason || 'Emergency SOS triggered',
      severity: 'critical'
    });

    await alert.save();

    // Get user info
    const user = await User.findById(userId);

    // Collect all participant IDs for notification
    const participantIds = activity.participants
      .map(p => p.userId._id.toString())
      .filter(id => id !== userId.toString());

    alert.notifiedUsers = participantIds;
    await alert.save();

    // Emit WebSocket event to all participants
    const io = req.app.get('io');
    if (io) {
      io.to(activityId.toString()).emit('emergency-alert', {
        alertId: alert._id,
        userId,
        userName: user.name,
        location: location.coordinates,
        reason: alert.reason,
        timestamp: new Date()
      });
    }

    // TODO: Send push notifications to all participants
    // TODO: Send SMS to user's emergency contacts

    res.status(201).json({
      success: true,
      message: 'SOS alert sent successfully',
      alert: {
        id: alert._id,
        location: alert.location,
        notifiedUsers: alert.notifiedUsers.length
      }
    });
  } catch (error) {
    console.error('SOS alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send SOS alert'
    });
  }
});

/**
 * @swagger
 * /api/sos/active:
 *   get:
 *     summary: Get active SOS alerts
 *     tags: [SOS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active alerts
 */
router.get('/active', authenticate, async (req, res) => {
  try {
    // Find activities user is participating in
    const activities = await Activity.find({
      $or: [
        { organizerId: req.userId },
        { 'participants.userId': req.userId }
      ],
      status: { $in: ['upcoming', 'live'] }
    }).select('_id');

    const activityIds = activities.map(a => a._id);

    // Find active alerts for these activities
    const alerts = await SOSAlert.find({
      activityId: { $in: activityIds },
      resolved: false
    })
      .populate('userId', 'name profilePhoto phone')
      .populate('activityId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Get active alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active alerts'
    });
  }
});

/**
 * @swagger
 * /api/sos/{id}/respond:
 *   post:
 *     summary: Respond to SOS alert
 *     tags: [SOS]
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
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [on_way, contacted, handled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response recorded
 */
router.post('/:id/respond', authenticate, [
  body('response').isIn(['on_way', 'contacted', 'handled']).withMessage('Invalid response type'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const alert = await SOSAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    if (alert.resolved) {
      return res.status(400).json({
        success: false,
        error: 'Alert already resolved'
      });
    }

    const { response, notes } = req.body;

    await alert.addResponse(req.userId, response, notes);

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(alert.activityId.toString()).emit('alert-response', {
        alertId: alert._id,
        responderId: req.userId,
        response,
        notes
      });
    }

    res.json({
      success: true,
      message: 'Response recorded',
      alert
    });
  } catch (error) {
    console.error('Respond to alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to respond to alert'
    });
  }
});

/**
 * @swagger
 * /api/sos/{id}/resolve:
 *   post:
 *     summary: Mark SOS alert as resolved
 *     tags: [SOS]
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
 *         description: Alert resolved
 */
router.post('/:id/resolve', authenticate, [
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const alert = await SOSAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    if (alert.resolved) {
      return res.status(400).json({
        success: false,
        error: 'Alert already resolved'
      });
    }

    // Only the person who triggered the alert or activity organizer can resolve
    const activity = await Activity.findById(alert.activityId);
    const canResolve = alert.userId.toString() === req.userId.toString() ||
      activity.organizerId.toString() === req.userId.toString();

    if (!canResolve) {
      return res.status(403).json({
        success: false,
        error: 'Only the alert creator or activity organizer can resolve this alert'
      });
    }

    await alert.resolve(req.userId, req.body.notes);

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(alert.activityId.toString()).emit('alert-resolved', {
        alertId: alert._id,
        resolvedBy: req.userId
      });
    }

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert'
    });
  }
});

/**
 * @swagger
 * /api/sos/activity/{activityId}:
 *   get:
 *     summary: Get all SOS alerts for an activity
 *     tags: [SOS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/activity/:activityId', authenticate, async (req, res) => {
  try {
    const { activityId } = req.params;

    // Verify user is participant or organizer
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    const isParticipant = activity.isParticipant(req.userId) ||
      activity.organizerId.toString() === req.userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const alerts = await SOSAlert.find({ activityId })
      .populate('userId', 'name profilePhoto')
      .populate('responses.userId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Get activity alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

module.exports = router;
