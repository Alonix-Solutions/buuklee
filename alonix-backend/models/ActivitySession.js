const mongoose = require('mongoose');

const activitySessionSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: String,
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    route: {
      type: {
        type: String,
        enum: ['LineString'],
        default: 'LineString'
      },
      coordinates: {
        type: [[Number]], // [[longitude, latitude]]
        default: []
      }
    },
    stats: {
      distance: { type: Number, default: 0 }, // meters
      duration: { type: Number, default: 0 }, // seconds
      pace: { type: Number, default: 0 }, // seconds per km
      speed: { type: Number, default: 0 }, // m/s
      elevation: { type: Number, default: 0 }, // meters
      heartRate: { type: Number, default: 0 }, // bpm
      calories: { type: Number, default: 0 },
      steps: { type: Number, default: 0 },
      batteryLevel: { type: Number, default: 100 } // percentage
    },
    lastUpdate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'emergency'],
      default: 'active'
    },
    alerts: [{
      type: String,
      severity: String,
      message: String,
      timestamp: Date
    }]
  }],
  groupStats: {
    totalDistance: { type: Number, default: 0 },
    averageSpeed: { type: Number, default: 0 },
    leadingParticipant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trailingParticipant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    spreadDistance: { type: Number, default: 0 } // distance between leader and trailer
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for queries
activitySessionSchema.index({ activityId: 1, status: 1 });
activitySessionSchema.index({ 'participants.userId': 1 });

// Method to update or create participant location inside a live session
// - Ensures a participant record exists for this userId
// - Normalizes incoming location into GeoJSON Point format
// - Safely initializes route and stats on first update
activitySessionSchema.methods.updateParticipantLocation = function (userId, location, stats = {}) {
  // Normalize location: accept either GeoJSON { type, coordinates } or raw [lng, lat]
  let coordinates = [];
  if (Array.isArray(location)) {
    coordinates = location;
  } else if (location && Array.isArray(location.coordinates)) {
    coordinates = location.coordinates;
  } else {
    throw new Error('Invalid location payload');
  }

  let participant = this.participants.find(
    (p) => p.userId.toString() === userId.toString()
  );

  // If participant is not yet in this session, create it
  if (!participant) {
    participant = {
      userId,
      userName: stats.userName || undefined,
      currentLocation: {
        type: 'Point',
        coordinates,
      },
      route: {
        type: 'LineString',
        coordinates: [coordinates],
      },
      stats: {
        distance: 0,
        duration: 0,
        pace: 0,
        speed: 0,
        elevation: 0,
        heartRate: 0,
        calories: 0,
        steps: 0,
        batteryLevel: 100,
        ...stats,
      },
      lastUpdate: new Date(),
      status: 'active',
      alerts: [],
    };

    this.participants.push(participant);
  } else {
    // Ensure route object is initialized
    if (!participant.route) {
      participant.route = {
        type: 'LineString',
        coordinates: [],
      };
    }

    // Update current location
    participant.currentLocation = {
      type: 'Point',
      coordinates,
    };

    // Add to route
    participant.route.coordinates.push(coordinates);

    // Merge stats
    participant.stats = {
      ...participant.stats,
      ...stats,
    };

    participant.lastUpdate = new Date();
  }

  return this.save();
};

// Method to calculate group statistics
activitySessionSchema.methods.calculateGroupStats = function() {
  if (this.participants.length === 0) return;

  const activeParticipants = this.participants.filter(p => p.status === 'active');

  if (activeParticipants.length === 0) return;

  // Calculate totals
  const totalDistance = activeParticipants.reduce((sum, p) => sum + (p.stats.distance || 0), 0);
  const avgSpeed = activeParticipants.reduce((sum, p) => sum + (p.stats.speed || 0), 0) / activeParticipants.length;

  // Find leader and trailer
  const leader = activeParticipants.reduce((max, p) =>
    (p.stats.distance || 0) > (max.stats.distance || 0) ? p : max
  );

  const trailer = activeParticipants.reduce((min, p) =>
    (p.stats.distance || 0) < (min.stats.distance || 0) ? p : min
  );

  this.groupStats = {
    totalDistance,
    averageSpeed: avgSpeed,
    leadingParticipant: leader.userId,
    trailingParticipant: trailer.userId,
    spreadDistance: (leader.stats.distance || 0) - (trailer.stats.distance || 0)
  };

  return this.save();
};

// Method to check for safety alerts
activitySessionSchema.methods.checkSafetyAlerts = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());

  if (!participant) return [];

  const alerts = [];
  const now = new Date();
  const timeSinceUpdate = now - new Date(participant.lastUpdate);

  // No movement for > 5 minutes
  if (participant.status === 'active' && participant.stats.speed === 0 && timeSinceUpdate > 300000) {
    alerts.push({
      type: 'NO_MOVEMENT',
      severity: 'high',
      message: `${participant.userName} hasn't moved in 5+ minutes`,
      timestamp: now
    });
  }

  // Falling significantly behind (> 2km from leader)
  if (this.groupStats.leadingParticipant) {
    const leader = this.participants.find(p =>
      p.userId.toString() === this.groupStats.leadingParticipant.toString()
    );

    if (leader) {
      const distanceBehind = (leader.stats.distance || 0) - (participant.stats.distance || 0);
      if (distanceBehind > 2000) {
        alerts.push({
          type: 'FALLING_BEHIND',
          severity: 'medium',
          message: `${participant.userName} is ${(distanceBehind / 1000).toFixed(1)}km behind the group`,
          timestamp: now
        });
      }
    }
  }

  // Abnormal heart rate
  if (participant.stats.heartRate &&
     (participant.stats.heartRate > 180 || participant.stats.heartRate < 40)) {
    alerts.push({
      type: 'ABNORMAL_HEART_RATE',
      severity: 'high',
      message: `${participant.userName} has abnormal heart rate: ${participant.stats.heartRate} bpm`,
      timestamp: now
    });
  }

  // Low battery
  if (participant.stats.batteryLevel && participant.stats.batteryLevel < 10) {
    alerts.push({
      type: 'LOW_BATTERY',
      severity: 'low',
      message: `${participant.userName}'s phone battery is critically low (${participant.stats.batteryLevel}%)`,
      timestamp: now
    });
  }

  return alerts;
};

module.exports = mongoose.model('ActivitySession', activitySessionSchema);
