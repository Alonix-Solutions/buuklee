const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
        required: false
    },
    origin: {
        address: { type: String, required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    destination: {
        address: { type: String, required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, // HH:mm
        required: true
    },
    seats: {
        type: Number,
        required: true,
        min: 1
    },
    availableSeats: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'Rs'
    },
    vehicle: {
        make: String,
        model: String,
        licensePlate: String,
        color: String
    },
    passengers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
        bookedAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['active', 'full', 'completed', 'cancelled'],
        default: 'active'
    },
    description: String
}, {
    timestamps: true
});

rideSchema.index({ origin: '2dsphere' });
rideSchema.index({ destination: '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);
