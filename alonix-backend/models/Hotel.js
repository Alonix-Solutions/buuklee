const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
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
    address: {
      type: String,
      required: true
    },
    city: String,
    country: String
  },
  photos: [String],
  amenities: [String], // e.g., ['WiFi', 'Pool', 'Gym', 'Restaurant']
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
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'MUR' }
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  contactPhone: String,
  contactEmail: String,
  website: String,
  checkInTime: String, // e.g., "14:00"
  checkOutTime: String, // e.g., "11:00"
  roomTypes: [{
    type: String, // e.g., "Single", "Double", "Suite"
    price: Number,
    currency: String,
    available: { type: Number, default: 0 }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ name: 1 });
hotelSchema.index({ isActive: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);

