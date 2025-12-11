const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['bike', 'car', 'scooter', 'motorcycle', 'other']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  photos: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pricing: {
    hourly: { type: Number, default: 0 },
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    currency: { type: String, default: 'MUR' }
  },
  features: [String], // e.g., ['GPS', 'Helmet Included', 'Insurance']
  specifications: {
    seats: { type: Number, default: 1 },
    transmission: { type: String, enum: ['manual', 'automatic'], default: 'manual' },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'] },
    engineSize: String,
    mileage: Number
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    availableFrom: Date,
    availableUntil: Date
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
vehicleSchema.index({ location: '2dsphere' });
vehicleSchema.index({ ownerId: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ 'availability.isAvailable': 1 });
vehicleSchema.index({ isActive: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);

