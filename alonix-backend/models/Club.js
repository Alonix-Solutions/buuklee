const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    minlength: [3, 'Club name must be at least 3 characters'],
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  createdFromActivity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    default: null
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  photo: {
    type: String,
    default: null
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
    address: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  stats: {
    totalActivities: { type: Number, default: 0 },
    totalMembers: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 }, // meters
    totalElevation: { type: Number, default: 0 }, // meters
    totalTime: { type: Number, default: 0 } // seconds
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
clubSchema.index({ creatorId: 1 });
clubSchema.index({ 'members.userId': 1 });
clubSchema.index({ location: '2dsphere' });
clubSchema.index({ status: 1, isPublic: 1 });

// Virtual for member count
clubSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.filter(m => m.status === 'active').length : 0;
});

// Method to check if user is member
clubSchema.methods.isMember = function(userId) {
  return this.members.some(m => 
    m.userId.toString() === userId.toString() && m.status === 'active'
  );
};

// Method to check if user is admin
clubSchema.methods.isAdmin = function(userId) {
  return this.members.some(m => 
    m.userId.toString() === userId.toString() && 
    m.role === 'admin' && 
    m.status === 'active'
  );
};

// Method to add member
clubSchema.methods.addMember = async function(userId, role = 'member') {
  if (this.isMember(userId)) {
    throw new Error('User is already a member');
  }

  this.members.push({
    userId,
    role,
    joinedAt: new Date(),
    status: 'active'
  });

  this.stats.totalMembers = this.members.filter(m => m.status === 'active').length;
  return this.save();
};

// Method to remove member
clubSchema.methods.removeMember = async function(userId) {
  const memberIndex = this.members.findIndex(
    m => m.userId.toString() === userId.toString()
  );

  if (memberIndex === -1) {
    throw new Error('User is not a member');
  }

  // Don't allow removing the creator
  if (this.members[memberIndex].userId.toString() === this.creatorId.toString()) {
    throw new Error('Cannot remove the club creator');
  }

  this.members[memberIndex].status = 'inactive';
  this.stats.totalMembers = this.members.filter(m => m.status === 'active').length;
  return this.save();
};

// Method to update member role
clubSchema.methods.updateMemberRole = async function(userId, newRole) {
  const member = this.members.find(
    m => m.userId.toString() === userId.toString() && m.status === 'active'
  );

  if (!member) {
    throw new Error('Member not found');
  }

  member.role = newRole;
  return this.save();
};

module.exports = mongoose.model('Club', clubSchema);

