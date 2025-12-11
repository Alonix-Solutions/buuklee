const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Stripe payment processing
 */

/**
 * @swagger
 * /api/payments/create-intent:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - amount
 *             properties:
 *               bookingId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post('/create-intent', authenticate, [
  body('bookingId').isMongoId().withMessage('Valid booking ID required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
  body('currency').optional().isIn(['MUR', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookingId, amount, currency = 'MUR' } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if already paid
    if (booking.payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Booking already paid'
      });
    }

    // Convert MUR to cents (Stripe uses smallest currency unit)
    // Note: MUR doesn't have cents, so we use the amount directly
    const amountInSmallestUnit = currency === 'MUR' ? Math.round(amount) : Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.userId.toString(),
        bookingType: booking.type
      },
      description: `Payment for ${booking.type} booking - ${booking.bookingReference}`
    });

    // Update booking with payment intent ID
    booking.payment.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent'
    });
  }
});

/**
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     summary: Confirm payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *               - bookingId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post('/confirm', authenticate, [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID required'),
  body('bookingId').isMongoId().withMessage('Valid booking ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { paymentIntentId, bookingId } = req.body;

    // Verify booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (booking.payment.paymentIntentId !== paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID mismatch'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking payment status
      booking.payment.status = 'paid';
      booking.payment.paidAt = new Date();
      booking.status = 'confirmed';
      await booking.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        booking: {
          id: booking._id,
          bookingReference: booking.bookingReference,
          status: booking.status,
          payment: booking.payment
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: `Payment not completed. Status: ${paymentIntent.status}`
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm payment'
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook handler for payment events
 * @access  Public (Stripe webhook)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;

      // Find booking by payment intent ID
      const booking = await Booking.findOne({
        'payment.paymentIntentId': paymentIntent.id
      });

      if (booking) {
        booking.payment.status = 'paid';
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();

        // TODO: Send notification to user
        console.log(`Payment succeeded for booking ${booking.bookingReference}`);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;

      const failedBooking = await Booking.findOne({
        'payment.paymentIntentId': failedPayment.id
      });

      if (failedBooking) {
        booking.payment.status = 'failed';
        await booking.save();

        // TODO: Send notification to user
        console.log(`Payment failed for booking ${failedBooking.bookingReference}`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * @swagger
 * /api/payments/refund:
 *   post:
 *     summary: Process refund
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */
router.post('/refund', authenticate, [
  body('bookingId').isMongoId().withMessage('Valid booking ID required'),
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

    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check ownership or admin access
    if (booking.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (booking.payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot refund unpaid booking'
      });
    }

    if (!booking.payment.paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'No payment intent found for refund'
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.payment.paymentIntentId,
      reason: reason || 'requested_by_customer'
    });

    // Update booking
    booking.payment.status = 'refunded';
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Refunded';
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status
      },
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process refund'
    });
  }
});

module.exports = router;

