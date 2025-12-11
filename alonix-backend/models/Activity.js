const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ['running', 'cycling', 'hiking', 'swimming', 'walking', 'other']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard', 'extreme']
  },
  date: {
    type: Date,
    required: [true, 'Activity date is required']
  },
  startTime: Date,
  endTime: Date,
  distance: {
    type: Number, // in meters
    min: [0, 'Distance must be positive']
  },
  elevation: {
    type: Number, // in meters
    default: 0
  },
  entryFee: {
    type: Number,
    default: 0,
    min: [0, 'Entry fee must be positive']
  },
  currency: {
    type: String,
    default: 'MUR',
    enum: ['MUR', 'USD', 'EUR', 'GBP']
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: [2, 'Must allow at least 2 participants']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    }
  }],
  meetingPoint: {
    address: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  route: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]] // [[longitude, latitude]]
    }
  },
  photos: [String],
  organizerServices: {
    transport: {
      available: { type: Boolean, default: false },
      type: String, // e.g., "Car - 5 seater"
      contributionFee: { type: Number, default: 0 },
      currency: { type: String, default: 'MUR' },
      maxSeats: { type: Number, default: 0 },
      bookedSeats: { type: Number, default: 0 },
      pickupLocation: String,
      pickupTime: Date
    },
    accommodation: {
      available: { type: Boolean, default: false },
      type: String, // e.g., "Camping tent"
      contributionFee: { type: Number, default: 0 },
      currency: { type: String, default: 'MUR' },
      maxSlots: { type: Number, default: 0 },
      bookedSlots: { type: Number, default: 0 },
      location: String
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  weatherConditions: {
    temperature: Number,
    condition: String,
    wind: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
activitySchema.index({ date: 1, status: 1 });
activitySchema.index({ activityType: 1, difficulty: 1 });
activitySchema.index({ 'meetingPoint': '2dsphere' });
activitySchema.index({ organizerId: 1 });
activitySchema.index({ status: 1, date: 1 });

// Virtual for checking if activity is full
activitySchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual for available seats
activitySchema.virtual('availableSeats').get(function() {
  return Math.max(0, this.maxParticipants - this.currentParticipants);
});

// Method to check if user is participant
activitySchema.methods.isParticipant = function(userId) {
  console.log('\n🔍 Checking isParticipant:');
  console.log('├─ Looking for userId:', userId.toString());
  console.log('├─ Organizer ID:', this.organizerId?.toString() || 'N/A');
  console.log('├─ Participants:', this.participants.map((p, i) => {
    const pid = p.userId?._id || p.userId;
    return `\n  │  [${i}] ${pid?.toString()} ${p.status ? `(${p.status})` : ''}`;
  }).join(''));

  // Organizer is always considered a participant
  const organizerId = this.organizerId?._id || this.organizerId;
  if (organizerId && organizerId.toString() === userId.toString()) {
    console.log('└─ ✅ Match found: User is organizer\n');
    return true;
  }

  const isParticipant = this.participants.some(p => {
    // Handle both populated (object) and unpopulated (string) userId
    const participantId = p.userId?._id || p.userId;
    return participantId && participantId.toString() === userId.toString();
  });

  console.log(`└─ ${isParticipant ? '✅' : '❌'} ${isParticipant ? 'Match found in participants' : 'No match found'}\n`);
  return isParticipant;
};

// Method to add participant
activitySchema.methods.addParticipant = async function(userId, paymentStatus = 'pending') {
  if (this.isFull) {
    throw new Error('Activity is full');
  }

  if (this.isParticipant(userId)) {
    throw new Error('User is already a participant');
  }

  this.participants.push({
    userId,
    status: 'confirmed',
    paymentStatus
  });

  this.currentParticipants += 1;
  return this.save();
};

// Method to remove participant
activitySchema.methods.removeParticipant = async function(userId) {
  const participantIndex = this.participants.findIndex(
    p => p.userId.toString() === userId.toString()
  );

  if (participantIndex === -1) {
    throw new Error('User is not a participant');
  }

  this.participants.splice(participantIndex, 1);
  this.currentParticipants = Math.max(0, this.currentParticipants - 1);
  return this.save();
};

// Method to book organizer service
activitySchema.methods.bookOrganizerService = async function(serviceType, quantity = 1) {
  if (!['transport', 'accommodation'].includes(serviceType)) {
    throw new Error('Invalid service type');
  }

  const service = this.organizerServices[serviceType];

  if (!service.available) {
    throw new Error(`${serviceType} not available`);
  }

  const maxCapacity = serviceType === 'transport' ? service.maxSeats : service.maxSlots;
  const currentBookings = serviceType === 'transport' ? service.bookedSeats : service.bookedSlots;

  if (currentBookings + quantity > maxCapacity) {
    throw new Error(`${serviceType} fully booked`);
  }

  if (serviceType === 'transport') {
    service.bookedSeats += quantity;
  } else {
    service.bookedSlots += quantity;
  }

  return this.save();
};

// Static method to find nearby activities
activitySchema.statics.findNearby = function(longitude, latitude, maxDistanceKm = 50) {
  return this.find({
    status: 'upcoming',
    'meetingPoint': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000 // Convert to meters
      }
    }
  });
};

module.exports = mongoose.model('Activity', activitySchema);
