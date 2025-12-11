const express = require('express');
const router = express.Router();
const { query, body, validationResult } = require('express-validator');
const Hotel = require('../models/Hotel');
const Restaurant = require('../models/Restaurant');
const { generateWhatsAppLink, generateBookingMessage, generateInquiryMessage } = require('../utils/whatsapp');

/**
 * @route   GET /api/whatsapp/hotel/:hotelId
 * @desc    Get WhatsApp link for hotel
 * @access  Public
 */
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);

    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    const { inquiryType = 'general', bookingData } = req.query;
    
    let message = '';
    if (bookingData) {
      try {
        const booking = JSON.parse(bookingData);
        message = generateBookingMessage(booking, 'hotel');
      } catch (error) {
        message = generateInquiryMessage(hotel.name, inquiryType);
      }
    } else {
      message = generateInquiryMessage(hotel.name, inquiryType);
    }

    const whatsappLink = generateWhatsAppLink(hotel.whatsappNumber, message);

    res.json({
      success: true,
      whatsappLink,
      hotel: {
        name: hotel.name,
        phone: hotel.whatsappNumber
      },
      message
    });
  } catch (error) {
    console.error('Get hotel WhatsApp link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate WhatsApp link'
    });
  }
});

/**
 * @route   GET /api/whatsapp/restaurant/:restaurantId
 * @desc    Get WhatsApp link for restaurant
 * @access  Public
 */
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    const { inquiryType = 'general', bookingData } = req.query;
    
    let message = '';
    if (bookingData) {
      try {
        const booking = JSON.parse(bookingData);
        message = generateBookingMessage(booking, 'restaurant');
      } catch (error) {
        message = generateInquiryMessage(restaurant.name, inquiryType);
      }
    } else {
      message = generateInquiryMessage(restaurant.name, inquiryType);
    }

    const whatsappLink = generateWhatsAppLink(restaurant.whatsappNumber, message);

    res.json({
      success: true,
      whatsappLink,
      restaurant: {
        name: restaurant.name,
        phone: restaurant.whatsappNumber
      },
      message
    });
  } catch (error) {
    console.error('Get restaurant WhatsApp link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate WhatsApp link'
    });
  }
});

/**
 * @route   POST /api/whatsapp/generate-link
 * @desc    Generate WhatsApp link with custom message
 * @access  Public
 */
router.post('/generate-link', [
  body('phoneNumber').notEmpty().withMessage('Phone number required'),
  body('message').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { phoneNumber, message = '' } = req.body;
    const whatsappLink = generateWhatsAppLink(phoneNumber, message);

    res.json({
      success: true,
      whatsappLink,
      phoneNumber,
      message
    });
  } catch (error) {
    console.error('Generate WhatsApp link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate WhatsApp link'
    });
  }
});

module.exports = router;

