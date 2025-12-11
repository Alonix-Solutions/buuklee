const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        maxlength: [2000, 'Content cannot exceed 2000 characters']
    },
    type: {
        type: String,
        enum: ['activity', 'achievement', 'general', 'photo'],
        default: 'general'
    },
    photos: [{
        type: String // URLs to photos
    }],
    // Activity-related stats (for activity posts)
    stats: {
        distance: Number, // in meters
        time: Number, // in seconds
        elevation: Number, // in meters
        pace: Number, // min/km
        calories: Number
    },
    // Reference to activity if this is an activity post
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    },
    // Social engagement
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    commentsCount: {
        type: Number,
        default: 0
    },
    // Visibility
    visibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
    },
    // Location where post was made
    location: {
        address: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    tags: [String]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });

// Virtual for user info
postSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Method to check if user has liked this post
postSchema.methods.isLikedBy = function (userId) {
    return this.likes.some(like => like.toString() === userId.toString());
};

// Method to toggle like
postSchema.methods.toggleLike = async function (userId) {
    const isLiked = this.isLikedBy(userId);

    if (isLiked) {
        this.likes = this.likes.filter(like => like.toString() !== userId.toString());
        this.likesCount = Math.max(0, this.likesCount - 1);
    } else {
        this.likes.push(userId);
        this.likesCount += 1;
    }

    await this.save();
    return !isLiked; // Return new liked state
};

// Static method to get feed for a user
postSchema.statics.getFeed = async function (userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // For now, get all public posts - in future, filter by friends
    const posts = await this.find({ visibility: 'public' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name profilePhoto')
        .lean();

    const total = await this.countDocuments({ visibility: 'public' });

    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

module.exports = mongoose.model('Post', postSchema);
