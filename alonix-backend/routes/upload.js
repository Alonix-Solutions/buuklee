const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints (placeholder)
 */

/**
 * @swagger
 * /api/upload/profile-photo:
 *   post:
 *     summary: Upload profile photo (Coming soon)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: Not implemented yet
 */
router.post('/profile-photo', authenticate, async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Image upload coming soon. Use URL for now.'
  });
});

/**
 * @swagger
 * /api/upload/activity-photo:
 *   post:
 *     summary: Upload activity photo (Coming soon)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: Not implemented yet
 */
router.post('/activity-photo', authenticate, async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Image upload coming soon. Use URL for now.'
  });
});

module.exports = router;
