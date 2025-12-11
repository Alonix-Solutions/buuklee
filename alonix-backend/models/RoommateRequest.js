const mongoose = require('mongoose');

const roommateRequestSchema = new mongoose.Schema({
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
    accommodation: {
        name: String, // e.g., "Nearby Hotel"
        address: String,
        pricePerNight: Number,
        currency: { type: String, default: 'Rs' }
    },
    preferences: {
        gender: { type: String, enum: ['Any', 'Male', 'Female'], default: 'Any' },
        smoking: { type: Boolean, default: false },
        earlyBird: { type: Boolean, default: false }
    },
    budget: {
        min: Number,
        max: Number
    },
    description: String,
    status: {
        type: String,
        enum: ['active', 'matched', 'cancelled'],
        default: 'active'
    }
}, {
    timestamps: true
});

roommateRequestSchema.index({ activityId: 1, status: 1 });

module.exports = mongoose.model('RoommateRequest', roommateRequestSchema);
