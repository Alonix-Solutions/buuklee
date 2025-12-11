const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['hotel', 'restaurant', 'taxi', 'vehicle', 'activity_service']
  },
  // Reference to the booked item (polymorphic)
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemModel'
  },
  itemModel: {
    type: String,
    required: true,
    enum: ['Hotel', 'Restaurant', 'Driver', 'Vehicle', 'Activity']
  },
  details: {
    // Hotel booking details
    checkIn: Date,
    checkOut: Date,
    guests: Number,
    roomType: String,
    
    // Restaurant booking details
    reservationDate: Date,
    reservationTime: String,
    partySize: Number,
    specialRequests: String,
    
    // Taxi/Driver booking details
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number],
      address: String
    },
    dropoffLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number],
      address: String
    },
    pickupTime: Date,
    estimatedDuration: Number, // minutes
    estimatedDistance: Number, // meters
    
    // Vehicle rental details
    rentalStart: Date,
    rentalEnd: Date,
    rentalPeriod: String, // 'hourly', 'daily', 'weekly', 'monthly'
    
    // Activity service details
    serviceType: String, // 'transport', 'accommodation'
    quantity: Number
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'MUR'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    paymentMethod: String,
    paymentIntentId: String, // Stripe payment intent ID
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  cancellationReason: String,
  cancelledAt: Date,
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ type: 1, status: 1 });
bookingSchema.index({ itemId: 1, itemModel: 1 });
// Note: bookingReference index is automatically created by unique: true in schema
bookingSchema.index({ 'payment.status': 1 });

// Generate unique booking reference
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const prefix = this.type.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

