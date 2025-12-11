# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alonix Backend is an Express.js + Socket.IO + MongoDB API server for a social fitness and activity platform. It provides REST APIs for user management, activity creation/tracking, real-time GPS tracking during activities, club management, bookings, and emergency SOS features.

**Current Status**: Production-ready MVP with all core features implemented. Mobile app integration complete.

**Core Philosophy**: Safety-first real-time tracking platform connecting people for outdoor activities.

## Build & Development Commands

### Starting the Server
```bash
# Development mode (with auto-reload via nodemon)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

### Database Operations
```bash
# Seed database with sample data
node seed-all-data.js

# Seed live activity for testing
node seed-live-activity.js

# Add participant to activity (testing)
node add_participant.js
```

### Testing API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Login (get JWT token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pascal@alonix.com","password":"Test123"}'

# Create activity (requires token)
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Activity","description":"Test","activityType":"running","difficulty":"medium","date":"2025-12-20T06:00:00Z","maxParticipants":10,"meetingPoint":{"address":"Port Louis","coordinates":[57.5012,-20.1609]}}'
```

## Architecture Overview

### Technology Stack
- **Framework**: Express.js 4.x (Node.js)
- **Database**: MongoDB 8.x with Mongoose ODM
- **Real-Time**: Socket.IO 4.x for live GPS tracking
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Payments**: Stripe integration
- **Push Notifications**: Expo Server SDK
- **Security**: bcrypt, express-rate-limit, CORS, input validation

### Server Architecture (`server.js`)

The entry point follows this initialization pattern:

1. **HTTP + WebSocket Server Setup**:
   - Creates HTTP server with Express
   - Initializes Socket.IO on same server
   - Shares `io` instance via `app.set('io', io)` for route access

2. **Middleware Stack** (order matters):
   - CORS configuration (allows mobile app origins)
   - JSON/URLEncoded body parsers
   - Request logging middleware (detailed console logs with emojis)
   - Rate limiting (100 requests per 15 minutes on `/api/*`)

3. **Route Registration**:
   ```javascript
   app.use('/api/auth', authRoutes);
   app.use('/api/users', userRoutes);
   app.use('/api/activities', activityRoutes);
   // ... 13 total route modules
   ```

4. **Socket.IO Handler**: Single module `socket/socketHandler.js` handles all real-time events

5. **Error Handling**: Global error middleware with detailed logging

6. **Database Connection**: MongoDB via Mongoose with connection pooling

7. **Graceful Shutdown**: SIGTERM handler closes HTTP server and DB connections cleanly

### Key Architectural Patterns

**1. Socket.IO + Express Integration**:
- HTTP server and Socket.IO server share the same port (3000)
- Routes can emit socket events via `req.app.get('io').to(room).emit(...)`
- Socket authentication via JWT token verification
- Room-based broadcasting for activity sessions

**2. Mongoose Schema Pattern**:
All models follow this structure:
```javascript
const schema = new mongoose.Schema({
  // Fields with validation
  field: {
    type: String,
    required: [true, 'Error message'],
    enum: ['value1', 'value2'],
    validate: {
      validator: (v) => validation logic,
      message: 'Validation message'
    }
  }
}, {
  timestamps: true, // Adds createdAt, updatedAt
  toJSON: { virtuals: true }, // Include virtual fields in JSON
  toObject: { virtuals: true }
});

// Indexes for performance
schema.index({ field: 1 });
schema.index({ location: '2dsphere' }); // Geospatial queries

// Virtual fields (computed, not stored)
schema.virtual('virtualField').get(function() {
  return computed value;
});

// Instance methods
schema.methods.methodName = async function() {
  // Access document via 'this'
};

// Static methods
schema.statics.staticMethod = async function() {
  // Access model via 'this'
};
```

**3. Route Handler Pattern**:
All routes follow this structure:
```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Model = require('../models/Model');

// Public routes (no auth)
router.post('/public-endpoint', async (req, res, next) => {
  try {
    // Logic
    res.json({ success: true, data });
  } catch (error) {
    next(error); // Passes to error handler
  }
});

// Protected routes (require JWT)
router.get('/protected', protect, async (req, res, next) => {
  try {
    // req.user available (set by protect middleware)
    const data = await Model.find({ userId: req.user.id });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

**4. Socket.IO Event Pattern**:
```javascript
// Client sends event
socket.emit('event-name', { data });

// Server handles event
socket.on('event-name', async (data) => {
  try {
    // Verify authentication
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Process data
    const result = await processData(data);

    // Broadcast to room
    socket.to(roomId).emit('broadcast-event', result);

    // Acknowledge to sender
    socket.emit('event-ack', { success: true });
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
});
```

## Critical Data Models

### Activity Model (`models/Activity.js`)
The core model for fitness activities/challenges:

**Key Fields**:
- `organizerId`: User who created activity (ref to User)
- `activityType`: enum ['running', 'cycling', 'hiking', 'swimming', 'walking', 'other']
- `difficulty`: enum ['easy', 'medium', 'hard', 'extreme']
- `participants`: Array of participant objects with status and payment tracking
- `meetingPoint`: GeoJSON Point with address and coordinates [longitude, latitude]
- `route`: Optional array of GeoJSON Points for predefined route
- `status`: enum ['draft', 'published', 'ongoing', 'completed', 'cancelled']
- `organizerServices`: Transport and accommodation offerings

**Important**:
- `meetingPoint.coordinates` uses GeoJSON format: **[longitude, latitude]** (NOT lat/lng!)
- Has 2dsphere index for geospatial queries (`$near`, `$geoWithin`)
- Virtual field `isFull` computes if `currentParticipants >= maxParticipants`
- Participants array tracks individual join status and payment

**Geospatial Query Example**:
```javascript
// Find activities within 50km of location
const activities = await Activity.find({
  'meetingPoint': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude] // User location
      },
      $maxDistance: 50000 // meters (50km)
    }
  }
});
```

### ActivitySession Model (`models/ActivitySession.js`)
Tracks live GPS tracking sessions:

**Key Fields**:
- `activityId`: Reference to Activity
- `participants`: Array with live location data per participant
  - `currentLocation`: GeoJSON Point (updated in real-time)
  - `stats`: { distance, speed, pace, elevation, heartRate }
  - `routePath`: Array of coordinates showing user's path
- `status`: enum ['active', 'paused', 'completed']
- `startTime`, `endTime`: Session duration
- `groupStats`: Aggregated statistics for all participants

**Real-Time Update Flow**:
1. Socket receives `location-update` event from mobile client
2. Updates `participants[userId].currentLocation` in ActivitySession
3. Broadcasts updated location to all participants in room
4. Calculates group stats (avg speed, leading participant, etc.)

### User Model (`models/User.js`)
**Key Fields**:
- `email`: Unique, required, validated
- `password`: Hashed with bcrypt (never return in API responses!)
- `pushTokens`: Array of Expo push notification tokens
- `stats`: User's cumulative fitness stats
- `emergencyContacts`: Array for SOS feature
- `following`, `followers`: Arrays of User IDs for social features

**Security**:
- Password hashing done via pre-save hook
- `comparePassword` instance method for login
- Never include password in JSON responses (use `.select('-password')`)

### SOSAlert Model (`models/SOSAlert.js`)
Emergency alert system:

**Key Fields**:
- `userId`: Person triggering alert
- `activityId`: Activity where alert triggered
- `location`: GeoJSON Point of emergency
- `status`: enum ['active', 'acknowledged', 'resolved']
- `respondedBy`: Array of users who acknowledged

**Flow**:
1. Mobile app sends `sos-alert` socket event
2. Server creates SOSAlert document
3. Broadcasts `emergency-alert` to all activity participants
4. Sends push notifications to emergency contacts
5. Updates status as responders acknowledge

## Real-Time System (Socket.IO)

### Socket Authentication Flow
```javascript
// 1. Client connects
const socket = io('http://localhost:3000');

// 2. Client authenticates with JWT
socket.emit('authenticate', { token: 'jwt-token-here' });

// 3. Server verifies and stores user info in socket object
socket.userId = decoded.userId;
socket.userName = user.name;

// 4. Server confirms
socket.on('authenticated', (data) => {
  // { userId, userName }
});
```

### Activity Room Pattern
Each live activity has a Socket.IO room named by `activityId`:

```javascript
// Participant joins activity room
socket.emit('join-activity', {
  activityId: '...',
  userId: '...'
});

// Server adds socket to room
socket.join(`activity-${activityId}`);

// Broadcast to all in room
io.to(`activity-${activityId}`).emit('event', data);

// Leave room
socket.emit('leave-activity', { activityId });
socket.leave(`activity-${activityId}`);
```

### Critical Socket Events

**Location Updates**:
```javascript
// Client → Server (every 3-5 seconds during activity)
socket.emit('location-update', {
  activityId: '...',
  userId: '...',
  location: {
    type: 'Point',
    coordinates: [lng, lat]
  },
  stats: {
    distance: 1234, // meters
    speed: 5.2, // m/s
    pace: 320, // seconds per km
    elevation: 100, // meters
    heartRate: 145 // bpm (optional)
  }
});

// Server → All Clients in room
socket.on('participant-location', (data) => {
  // { userId, userName, location, stats, timestamp }
});
```

**Emergency Alerts**:
```javascript
// Client triggers SOS
socket.emit('sos-alert', {
  activityId: '...',
  userId: '...',
  location: { type: 'Point', coordinates: [lng, lat] },
  reason: 'Injury' // optional
});

// Server broadcasts to all participants + emergency contacts
socket.on('emergency-alert', (data) => {
  // { alertId, userId, userName, location, reason, timestamp }
  // Show urgent notification to user
});
```

**Safety Monitoring** (Server-initiated):
```javascript
// Server detects participant falling behind or stopped moving
socket.on('safety-alert', (data) => {
  // { userId, userName, alert: 'FALLING_BEHIND' | 'NO_MOVEMENT', location }
});
```

## Authentication & Authorization

### JWT Token Structure
```javascript
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
);
```

### Protect Middleware (`middleware/auth.js`)
All protected routes use this middleware:

```javascript
const { protect } = require('../middleware/auth');

router.get('/protected-route', protect, async (req, res) => {
  // req.user is populated with full User document
  const userId = req.user._id;
});
```

**How it works**:
1. Extracts token from `Authorization: Bearer TOKEN` header
2. Verifies token with JWT secret
3. Finds user in database
4. Attaches user to `req.user`
5. Calls `next()` or returns 401 error

### Role-Based Access (Future Enhancement)
Currently all authenticated users have same permissions. To add roles:

1. Add `role` field to User model:
```javascript
role: {
  type: String,
  enum: ['user', 'organizer', 'admin'],
  default: 'user'
}
```

2. Create role middleware:
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    next();
  };
};

// Usage:
router.delete('/activities/:id', protect, authorize('organizer', 'admin'), deleteActivity);
```

## Database Patterns

### Geospatial Queries
MongoDB's 2dsphere indexes enable location-based queries:

**Find Nearby Activities**:
```javascript
Activity.find({
  'meetingPoint': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 50000 // meters
    }
  },
  status: 'published',
  date: { $gte: new Date() }
});
```

**Find Activities Within Polygon**:
```javascript
Activity.find({
  'meetingPoint': {
    $geoWithin: {
      $geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng1, lat1],
          [lng2, lat2],
          [lng3, lat3],
          [lng1, lat1] // Close polygon
        ]]
      }
    }
  }
});
```

### Aggregation Pipeline Pattern
For complex queries (leaderboards, statistics):

```javascript
const leaderboard = await ActivitySession.aggregate([
  { $match: { activityId: mongoose.Types.ObjectId(activityId) } },
  { $unwind: '$participants' },
  { $sort: { 'participants.stats.distance': -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: 'users',
      localField: 'participants.userId',
      foreignField: '_id',
      as: 'userInfo'
    }
  },
  { $unwind: '$userInfo' },
  {
    $project: {
      userId: '$participants.userId',
      name: '$userInfo.name',
      distance: '$participants.stats.distance',
      time: '$participants.stats.duration',
      rank: { $indexOfArray: ['$_id', '$participants.userId'] }
    }
  }
]);
```

### Population Pattern
Mongoose can populate references automatically:

```javascript
// Basic population
const activity = await Activity.findById(id)
  .populate('organizerId', 'name email profilePhoto')
  .populate('participants.userId', 'name profilePhoto');

// Nested population
const club = await Club.findById(id)
  .populate({
    path: 'members.userId',
    select: 'name email stats',
    populate: {
      path: 'clubs',
      select: 'name'
    }
  });
```

## Environment Configuration

### Required Environment Variables

**Critical** (app won't start without these):
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/alonix
JWT_SECRET=your-secret-at-least-32-characters-long
PORT=3000
NODE_ENV=development
```

**Optional** (features degrade gracefully):
```env
# Image uploads (falls back to local storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Payments (returns error if not configured)
STRIPE_SECRET_KEY=sk_test_...

# Push notifications (SOS alerts won't send)
EXPO_ACCESS_TOKEN=your-expo-token

# SMS alerts (optional fallback for SOS)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# CORS
FRONTEND_URL=http://localhost:8081

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment-Specific Behavior

**Development** (`NODE_ENV=development`):
- Detailed error stack traces in responses
- Verbose console logging
- CORS allows all origins

**Production** (`NODE_ENV=production`):
- Minimal error messages (security)
- Condensed logging
- Strict CORS policy
- Rate limiting enforced

## Error Handling

### Error Response Format
All errors follow this structure:
```json
{
  "success": false,
  "error": "Human-readable error message",
  "stack": "Stack trace (only in development)"
}
```

### Creating Custom Errors in Routes
```javascript
// Throw error with status code
const error = new Error('Activity not found');
error.statusCode = 404;
throw error;

// Or use next()
if (!activity) {
  const error = new Error('Activity not found');
  error.statusCode = 404;
  return next(error);
}
```

### Mongoose Validation Errors
Automatically caught and formatted:
```javascript
// Validation error example
{
  "success": false,
  "error": "Activity validation failed: title: Title must be at least 3 characters"
}
```

## Testing Patterns

### Manual API Testing
```bash
# 1. Get authentication token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pascal@alonix.com","password":"Test123"}' \
  | jq -r '.token')

# 2. Use token in subsequent requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/activities

# 3. Test activity creation
curl -X POST http://localhost:3000/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @activity-payload.json
```

### Socket.IO Testing (Browser Console)
```javascript
// Connect
const socket = io('http://localhost:3000');

// Authenticate
socket.emit('authenticate', { token: 'YOUR_JWT_TOKEN' });

socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);

  // Join activity
  socket.emit('join-activity', {
    activityId: 'ACTIVITY_ID',
    userId: data.userId
  });

  // Send location update
  setInterval(() => {
    socket.emit('location-update', {
      activityId: 'ACTIVITY_ID',
      userId: data.userId,
      location: {
        type: 'Point',
        coordinates: [57.5 + Math.random() * 0.1, -20.16 + Math.random() * 0.1]
      },
      stats: {
        distance: Math.floor(Math.random() * 1000),
        speed: Math.random() * 10,
        pace: 300 + Math.random() * 100
      }
    });
  }, 5000);
});

// Listen for broadcasts
socket.on('participant-location', (data) => {
  console.log('Location update:', data);
});

socket.on('emergency-alert', (data) => {
  console.warn('SOS ALERT:', data);
});
```

## Common Issues & Solutions

### MongoDB Connection Fails
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions**:
1. Check MongoDB is running: `mongod --version`
2. Verify `MONGODB_URI` in `.env`
3. For MongoDB Atlas, check:
   - IP whitelist includes your IP
   - Username/password correct
   - Database name in connection string

### Port 3000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill //F //PID <PID>

# Linux/macOS
lsof -i :3000
kill -9 <PID>
```

### JWT Verification Failed
```
JsonWebTokenError: invalid signature
```

**Causes**:
- `JWT_SECRET` changed (invalidates all existing tokens)
- Token from different environment (dev vs prod)
- Token expired (`JWT_EXPIRES_IN`)

**Solution**: Re-login to get fresh token

### Socket Connection but No Events
**Check**:
1. Socket authenticated? Listen for `'authenticated'` event
2. Correct room name? Must match `activity-${activityId}` format
3. CORS issues? Check browser console for errors
4. Server logs show events? Enable verbose logging

### GeoJSON Coordinate Order Error
**Problem**: Map shows wrong location or MongoDB query fails.

**Cause**: GeoJSON uses **[longitude, latitude]** order, opposite of Google Maps.

**Solution**:
```javascript
// WRONG (Google Maps order)
coordinates: [latitude, longitude]

// CORRECT (GeoJSON order)
coordinates: [longitude, latitude]
```

## Production Deployment Checklist

**Environment**:
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ characters, random)
- [ ] Configure `MONGODB_URI` for production database
- [ ] Set `FRONTEND_URL` to actual domain
- [ ] Enable rate limiting (already configured)

**Security**:
- [ ] MongoDB has strong password
- [ ] Database network access restricted to server IP
- [ ] CORS configured for specific origins only
- [ ] HTTPS enabled (use reverse proxy like Nginx)
- [ ] Environment variables in secure vault (not .env file)

**Monitoring**:
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Database backup schedule configured
- [ ] Health check monitoring (`/health` endpoint)
- [ ] Socket.IO connection monitoring

**Performance**:
- [ ] MongoDB indexes optimized (check with `.explain()`)
- [ ] Enable MongoDB connection pooling
- [ ] Consider Redis for session storage
- [ ] Load balancing if needed (PM2 cluster mode)

## Test Data

**Test User**:
- Email: `pascal@alonix.com`
- Password: `Test123`
- User ID: `6937126b3c7728040ced3476`

**Seeding Database**:
```bash
# Full seed (users, activities, clubs, posts)
node seed-all-data.js

# Just create live activity for testing real-time features
node seed-live-activity.js
```

## Related Documentation

- `README.md` - Quick start guide and API overview
- `TESTING.md` - Comprehensive testing guide
- `IMPLEMENTATION_SUMMARY.md` - Feature implementation status
- `BACKEND_EVALUATION.md` - Architecture evaluation
- `MONGODB_SETUP.md` - MongoDB Atlas setup guide
- `../alonix-mobile/CLAUDE.md` - Mobile app documentation
