const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * Placeholder routes for file uploads
 * TODO: Implement Cloudinary integration
 */

router.post('/profile-photo', authenticate, async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Image upload coming soon. Use URL for now.'
  });
});

router.post('/activity-photo', authenticate, async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Image upload coming soon. Use URL for now.'
  });
});

module.exports = router;
