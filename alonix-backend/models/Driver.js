const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  licenseExpiry: {
    type: Date,
    required: true
  },
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    licensePlate: String,
    color: String,
    seats: { type: Number, default: 4 }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String,
    lastUpdate: Date
  },
  services: [{
    type: String,
    enum: ['personal_driver', 'airport_transfer', 'city_tour', 'long_distance', 'ride_sharing']
  }],
  pricing: {
    baseRate: { type: Number, default: 0 },
    perKm: { type: Number, default: 0 },
    perHour: { type: Number, default: 0 },
    currency: { type: String, default: 'MUR' }
  },
  availability: {
    isAvailable: { type: Boolean, default: false },
    availableFrom: Date,
    availableUntil: Date,
    workingHours: {
      start: String, // e.g., "08:00"
      end: String // e.g., "20:00"
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  totalRides: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
driverSchema.index({ location: '2dsphere' });

driverSchema.index({ 'availability.isAvailable': 1 });
driverSchema.index({ isActive: 1, isVerified: 1 });

module.exports = mongoose.model('Driver', driverSchema);

