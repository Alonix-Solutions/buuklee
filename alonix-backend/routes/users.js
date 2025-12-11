const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and social management
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (or 'me' for current user)
 *     responses:
 *       200:
 *         description: User profile data
 *       404:
 *         description: User not found
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.userId : req.params.id;
    const user = await User.findById(userId)
      .populate('followers', 'name profilePhoto')
      .populate('following', 'name profilePhoto')
      .select('-password -pushToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
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
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Not authorized to update this profile
 */
router.put('/:id', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().isLength({ max: 500 }),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    // Check if user is updating their own profile
    const targetId = req.params.id === 'me' ? req.userId : req.params.id;
    if (targetId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own profile'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, bio, phone, location } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    if (location && location.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      };
    }

    const user = await User.findByIdAndUpdate(
      targetId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
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
 *         description: Successfully followed user
 *       400:
 *         description: Already following or invalid request
 */
router.post('/:id/follow', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        error: 'You are already following this user'
      });
    }

    // Add to following list
    currentUser.following.push(targetUserId);
    await currentUser.save();

    // Add to target user's followers
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    res.json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow user'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
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
 *         description: Successfully unfollowed user
 */
router.delete('/:id/follow', authenticate, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId
    );
    await currentUser.save();

    // Remove from target user's followers
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUserId.toString()
    );
    await targetUser.save();

    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unfollow user'
    });
  }
});

/**
 * @swagger
 * /api/users/push-token:
 *   post:
 *     summary: Register device push notification token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pushToken
 *             properties:
 *               pushToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Push token registered
 */
router.post('/push-token', authenticate, [
  body('pushToken').notEmpty().withMessage('Push token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { pushToken } = req.body;

    await User.findByIdAndUpdate(req.userId, {
      $set: { pushToken }
    });

    res.json({
      success: true,
      message: 'Push token registered successfully'
    });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register push token'
    });
  }
});

/**
 * @swagger
 * /api/users/emergency-contacts:
 *   put:
 *     summary: Update emergency contacts
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contacts
 *             properties:
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - phone
 *                   properties:
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *     responses:
 *       200:
 *         description: Emergency contacts updated
 */
router.put('/emergency-contacts', authenticate, [
  body('contacts').isArray().withMessage('Contacts must be an array'),
  body('contacts.*.name').trim().notEmpty().withMessage('Contact name is required'),
  body('contacts.*.phone').trim().notEmpty().withMessage('Contact phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { contacts } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { emergencyContacts: contacts } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Emergency contacts updated successfully',
      emergencyContacts: user.emergencyContacts
    });
  } catch (error) {
    console.error('Update emergency contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency contacts'
    });
  }
});

module.exports = router;
