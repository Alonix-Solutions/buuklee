const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate: auth } = require('../middleware/auth');

// Simple in-memory review store (in production, use a Review model)
let reviews = [];

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { entityType, entityId, page = 1, limit = 20 } = req.query;

        let filteredReviews = [...reviews];

        if (entityType) {
            filteredReviews = filteredReviews.filter(r => r.entityType === entityType);
        }
        if (entityId && mongoose.Types.ObjectId.isValid(entityId)) {
            filteredReviews = filteredReviews.filter(r => r.entityId === entityId);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedReviews = filteredReviews.slice(skip, skip + parseInt(limit));

        res.json({
            success: true,
            reviews: paginatedReviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredReviews.length,
                pages: Math.ceil(filteredReviews.length / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   GET /api/reviews/:type/:id
 * @desc    Get reviews for a specific entity
 * @access  Public
 */
router.get('/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid entity ID' });
        }

        const entityReviews = reviews.filter(r => r.entityType === type && r.entityId === id);

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedReviews = entityReviews.slice(skip, skip + parseInt(limit));

        // Calculate average rating
        const avgRating = entityReviews.length > 0
            ? entityReviews.reduce((sum, r) => sum + r.rating, 0) / entityReviews.length
            : 0;

        res.json({
            success: true,
            reviews: paginatedReviews,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: entityReviews.length,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: entityReviews.length,
                pages: Math.ceil(entityReviews.length / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get entity reviews error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews by a user
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        const userReviews = reviews.filter(r => r.userId === userId);

        res.json({
            success: true,
            reviews: userReviews
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   POST /api/reviews
 * @desc    Create a review
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
    try {
        const { entityType, entityId, rating, title, content } = req.body;

        if (!entityType || !entityId || !rating) {
            return res.status(400).json({ success: false, error: 'entityType, entityId, and rating are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(entityId)) {
            return res.status(400).json({ success: false, error: 'Invalid entity ID' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
        }

        const review = {
            _id: new mongoose.Types.ObjectId().toString(),
            userId: req.user.id,
            userName: req.user.name,
            userPhoto: req.user.profilePhoto,
            entityType,
            entityId,
            rating,
            title: title || '',
            content: content || '',
            createdAt: new Date().toISOString()
        };

        reviews.push(review);

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   GET /api/reviews/:id
 * @desc    Get a single review
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const review = reviews.find(r => r._id === id);

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        res.json({ success: true, review });
    } catch (error) {
        console.error('Get review error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
