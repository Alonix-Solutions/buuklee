const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticate: auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Social posts and feed
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
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
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, type, userId } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { visibility: 'public' };

        if (type) query.type = type;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = userId;
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name profilePhoto')
            .lean();

        const total = await Post.countDocuments(query);

        res.json({
            success: true,
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get personalized feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized feed
 */
router.get('/feed', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const result = await Post.getFeed(req.user.id, { page: parseInt(page), limit: parseInt(limit) });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   GET /api/posts/user/:userId
 * @desc    Get posts by a specific user
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await Post.find({ userId, visibility: 'public' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name profilePhoto')
            .lean();

        const total = await Post.countDocuments({ userId, visibility: 'public' });

        res.json({
            success: true,
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
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
 *         description: Post deleted
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

        const post = await Post.findById(id)
            .populate('userId', 'name profilePhoto')
            .populate('comments.userId', 'name profilePhoto')
            .lean();

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        res.json({ success: true, post });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, type, photos, stats, activityId, location, tags, visibility } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const postData = {
            userId: req.user.id,
            title,
            content,
            type: type || 'general',
            photos: photos || [],
            stats,
            location,
            tags: tags || [],
            visibility: visibility || 'public'
        };

        if (activityId && mongoose.Types.ObjectId.isValid(activityId)) {
            postData.activityId = activityId;
        }

        const post = await Post.create(postData);

        // Populate user info
        await post.populate('userId', 'name profilePhoto');

        res.status(201).json({ success: true, post });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like/unlike a post
 *     tags: [Posts]
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
 *         description: Like toggled
 */
router.post('/:id/like', auth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        const liked = await post.toggleLike(req.user.id);

        res.json({
            success: true,
            liked,
            likesCount: post.likesCount
        });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *   post:
 *     summary: Add a comment
 *     tags: [Posts]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

        const post = await Post.findById(id)
            .populate('comments.userId', 'name profilePhoto')
            .lean();

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // Paginate comments
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const comments = post.comments.slice(startIndex, endIndex);

        res.json({
            success: true,
            comments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: post.comments.length,
                pages: Math.ceil(post.comments.length / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Add a comment to a post
 * @access  Private
 */
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Comment content is required' });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        const comment = {
            userId: req.user.id,
            content: content.trim(),
            createdAt: new Date()
        };

        post.comments.push(comment);
        post.commentsCount += 1;
        await post.save();

        // Get user info for the new comment
        const user = await User.findById(req.user.id).select('name profilePhoto');

        res.status(201).json({
            success: true,
            comment: {
                ...comment,
                userId: user
            }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private (owner only)
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid post ID' });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        // Check ownership
        if (post.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
        }

        await post.deleteOne();

        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
