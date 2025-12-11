const mongoose = require('mongoose');

const clubEventSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: Date,
  endTime: Date,
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
  maxParticipants: {
    type: Number,
    default: null // null means no limit
  },
  confirmedMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    confirmedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'maybe', 'declined'],
      default: 'confirmed'
    }
  }],
  activityType: {
    type: String,
    enum: ['running', 'cycling', 'hiking', 'swimming', 'walking', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  linkedActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
clubEventSchema.index({ clubId: 1, date: 1 });
clubEventSchema.index({ organizerId: 1 });
clubEventSchema.index({ status: 1, date: 1 });
clubEventSchema.index({ location: '2dsphere' });

// Virtual for confirmed count
clubEventSchema.virtual('confirmedCount').get(function() {
  return this.confirmedMembers ? 
    this.confirmedMembers.filter(m => m.status === 'confirmed').length : 0;
});

// Method to check if user confirmed
clubEventSchema.methods.isConfirmed = function(userId) {
  return this.confirmedMembers.some(m => 
    m.userId.toString() === userId.toString() && m.status === 'confirmed'
  );
};

// Method to confirm availability
clubEventSchema.methods.confirmAvailability = async function(userId, status = 'confirmed') {
  if (!['confirmed', 'maybe', 'declined'].includes(status)) {
    throw new Error('Invalid confirmation status');
  }

  const existingIndex = this.confirmedMembers.findIndex(
    m => m.userId.toString() === userId.toString()
  );

  if (existingIndex !== -1) {
    this.confirmedMembers[existingIndex].status = status;
    this.confirmedMembers[existingIndex].confirmedAt = new Date();
  } else {
    this.confirmedMembers.push({
      userId,
      status,
      confirmedAt: new Date()
    });
  }

  return this.save();
};

// Method to remove confirmation
clubEventSchema.methods.removeConfirmation = async function(userId) {
  const index = this.confirmedMembers.findIndex(
    m => m.userId.toString() === userId.toString()
  );

  if (index !== -1) {
    this.confirmedMembers.splice(index, 1);
    return this.save();
  }
};

module.exports = mongoose.model('ClubEvent', clubEventSchema);

