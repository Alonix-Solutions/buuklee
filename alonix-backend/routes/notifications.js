const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { Expo } = require('expo-server-sdk');

// Create Expo client
const expo = new Expo();

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('read').optional().isBoolean(),
  query('type').optional()
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

    const query = { userId: req.userId };

    if (req.query.read !== undefined) {
      query.read = req.query.read === 'true';
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      read: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + notifications.length < total
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check ownership
    if (notification.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        } 
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check ownership
    if (notification.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      read: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
});

/**
 * Helper function to send push notification
 */
async function sendPushNotification(userId, notification) {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.pushToken) {
      return { success: false, error: 'User has no push token' };
    }

    // Validate Expo push token
    if (!Expo.isExpoPushToken(user.pushToken)) {
      return { success: false, error: 'Invalid Expo push token' };
    }

    const messages = [{
      to: user.pushToken,
      sound: 'default',
      title: notification.title,
      body: notification.message,
      data: notification.data || {},
      priority: notification.priority === 'urgent' ? 'high' : 'default'
    }];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    return { success: true, tickets };
  } catch (error) {
    console.error('Send push notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * @route   POST /api/notifications/preferences
 * @desc    Update notification preferences (placeholder - can be extended)
 * @access  Private
 */
router.post('/preferences', authenticate, async (req, res) => {
  // This is a placeholder - can be extended with User model preferences
  res.json({
    success: true,
    message: 'Notification preferences updated',
    preferences: req.body
  });
});

// Export helper function for use in other routes
// Export helper function for use in other routes
router.sendPushNotification = sendPushNotification;

module.exports = router;
