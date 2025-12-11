const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivitySession'
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
    address: String
  },
  type: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual'
  },
  reason: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  notifiedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  responses: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    response: String, // "on_way", "contacted", "handled"
    timestamp: Date,
    notes: String
  }],
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: String
}, {
  timestamps: true
});

// Index for queries
sosAlertSchema.index({ activityId: 1, resolved: 1 });
sosAlertSchema.index({ userId: 1, createdAt: -1 });
sosAlertSchema.index({ location: '2dsphere' });

// Method to mark as resolved
sosAlertSchema.methods.resolve = function(resolvedBy, notes) {
  this.resolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  this.resolutionNotes = notes;
  return this.save();
};

// Method to add response
sosAlertSchema.methods.addResponse = function(userId, response, notes) {
  this.responses.push({
    userId,
    response,
    timestamp: new Date(),
    notes
  });
  return this.save();
};

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
