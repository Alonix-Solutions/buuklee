const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// @route   GET /api/restaurants
// @desc    Get all restaurants
// @access  Public
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.find().sort({ rating: -1 });
        res.json({ success: true, count: restaurants.length, data: restaurants });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/restaurants/:id
// @desc    Get single restaurant
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ success: false, error: 'Restaurant not found' });
        }
        res.json({ success: true, data: restaurant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
