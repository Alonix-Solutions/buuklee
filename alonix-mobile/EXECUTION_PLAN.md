# ALONIX PHASE 1 - FUNCTIONAL PROTOTYPE EXECUTION PLAN

**Goal**: Transform the current UI prototype into a fully functional Phase 1 application with real backend integration, working GPS tracking, and operational safety features.

**Current Status**: 37% Functionally Complete
**Target Status**: 100% Phase 1 MVP
**Estimated Timeline**: 6-8 Weeks
**Last Updated**: December 8, 2025

---

## EXECUTIVE SUMMARY

The Alonix mobile app has excellent UI/UX with 43 screens but needs backend integration and feature completion. This plan focuses on building a functional MVP that allows real users to:

1. Create and discover activities
2. Join activities and track GPS in real-time
3. Share costs for transport/accommodation
4. Monitor participant safety during activities
5. Form clubs from successful activities

---

## PHASE BREAKDOWN

### Phase 1: Foundation & Backend Setup (Week 1-2)
- Set up backend infrastructure
- Implement authentication
- Create core API endpoints
- Database schema design

### Phase 2: Core Activity Features (Week 2-4)
- Activity creation with backend persistence
- Real-time GPS tracking sync
- Activity discovery and filtering
- Join/leave activity flows

### Phase 3: Cost Sharing & Payments (Week 4-5)
- Payment gateway integration
- Cost splitting logic
- Booking system completion
- Transaction history

### Phase 4: Safety & Real-Time (Week 5-6)
- Emergency SOS system
- Health monitoring integration
- Real-time participant tracking
- Safety notifications

### Phase 5: Social & Clubs (Week 6-7)
- Activity feed with real data
- Club formation automation
- Social interactions
- Push notifications

### Phase 6: Testing & Polish (Week 7-8)
- End-to-end testing
- Bug fixes
- Performance optimization
- User acceptance testing

---

## DETAILED STEP-BY-STEP PLAN

---

## WEEK 1: BACKEND FOUNDATION

### Step 1.1: Backend Technology Selection & Setup (Day 1-2)

**Objective**: Choose and set up backend infrastructure

**Options**:
1. **Firebase** (Fastest for MVP)
   - Pros: Real-time database, authentication built-in, hosting included
   - Cons: Vendor lock-in, can get expensive
   - Best for: Quick prototype, mobile-first

2. **Node.js + Express + MongoDB** (Recommended)
   - Pros: JavaScript everywhere, scalable, flexible
   - Cons: More setup required
   - Best for: Long-term scalability

3. **Django + PostgreSQL**
   - Pros: Robust, admin panel, ORM
   - Cons: Python, different from frontend
   - Best for: Complex business logic

**Decision Matrix**:
```
Feature          | Firebase | Node.js | Django
-----------------|----------|---------|--------
Setup Time       | 1 day    | 2-3 days| 3-4 days
Real-time        | Built-in | Socket.io| Channels
Scalability      | High     | Very High| High
Cost (MVP)       | Low      | Low     | Low
Mobile SDK       | Excellent| Good    | Good
**Recommendation**| ⭐⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐⭐
```

**Action Items**:
- [ ] Choose backend stack (Recommended: Node.js + Express + MongoDB + Socket.io)
- [ ] Set up development environment
- [ ] Initialize Git repository for backend
- [ ] Set up MongoDB Atlas (or local MongoDB)
- [ ] Create initial Express server
- [ ] Set up environment variables (.env)
- [ ] Configure CORS for mobile app
- [ ] Set up error handling middleware
- [ ] Create basic health check endpoint

**Deliverables**:
- Backend server running on localhost
- Database connection established
- Basic `/api/health` endpoint responding
- Environment configuration complete

---

### Step 1.2: Database Schema Design (Day 2-3)

**Objective**: Design complete database schema for Phase 1

**Core Collections/Tables**:

```javascript
// users
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  name: String,
  phone: String,
  profilePhoto: String (URL),
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  bio: String,
  stats: {
    challengesCompleted: Number,
    totalDistance: Number,
    totalElevation: Number,
    totalTime: Number
  },
  achievements: [ObjectId],
  followers: [ObjectId],
  following: [ObjectId],
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  createdAt: Date,
  updatedAt: Date
}

// activities (challenges)
{
  _id: ObjectId,
  title: String,
  description: String,
  organizerId: ObjectId,
  activityType: String (running, cycling, hiking, swimming),
  difficulty: String (easy, medium, hard, extreme),
  date: Date,
  startTime: Date,
  endTime: Date,
  distance: Number,
  elevation: Number,
  entryFee: Number,
  currency: String,
  maxParticipants: Number,
  currentParticipants: Number,
  participants: [{
    userId: ObjectId,
    joinedAt: Date,
    status: String (pending, confirmed, completed, cancelled)
  }],
  meetingPoint: {
    address: String,
    type: "Point",
    coordinates: [longitude, latitude]
  },
  route: {
    type: "LineString",
    coordinates: [[longitude, latitude]]
  },
  photos: [String],
  organizerServices: {
    transport: {
      available: Boolean,
      type: String,
      contributionFee: Number,
      maxSeats: Number
    },
    accommodation: {
      available: Boolean,
      type: String,
      contributionFee: Number,
      maxSlots: Number
    }
  },
  status: String (upcoming, live, completed, cancelled),
  createdAt: Date,
  updatedAt: Date
}

// activity_sessions (live tracking)
{
  _id: ObjectId,
  activityId: ObjectId,
  startTime: Date,
  endTime: Date,
  participants: [{
    userId: ObjectId,
    currentLocation: {
      type: "Point",
      coordinates: [longitude, latitude]
    },
    route: {
      type: "LineString",
      coordinates: [[longitude, latitude]]
    },
    stats: {
      distance: Number,
      duration: Number,
      pace: Number,
      elevation: Number,
      heartRate: Number,
      lastUpdate: Date
    },
    status: String (active, paused, completed, emergency)
  }],
  status: String (active, completed)
}

// clubs
{
  _id: ObjectId,
  name: String,
  description: String,
  type: String,
  logo: String,
  coverPhoto: String,
  createdFromActivity: ObjectId,
  founderId: ObjectId,
  members: [{
    userId: ObjectId,
    role: String (admin, moderator, member),
    joinedAt: Date
  }],
  location: String,
  stats: {
    totalActivities: Number,
    totalDistance: Number,
    totalMembers: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// bookings
{
  _id: ObjectId,
  userId: ObjectId,
  activityId: ObjectId,
  bookingType: String (transport, accommodation, activity),
  serviceDetails: Object,
  amount: Number,
  currency: String,
  paymentStatus: String (pending, paid, refunded, failed),
  paymentMethod: String,
  transactionId: String,
  bookingReference: String,
  status: String (pending, confirmed, cancelled, completed),
  createdAt: Date,
  updatedAt: Date
}

// notifications
{
  _id: ObjectId,
  userId: ObjectId,
  type: String (activity_invite, booking_confirmed, emergency_alert, club_event, etc.),
  title: String,
  message: String,
  data: Object,
  read: Boolean,
  createdAt: Date
}

// sos_alerts
{
  _id: ObjectId,
  userId: ObjectId,
  activityId: ObjectId,
  sessionId: ObjectId,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  type: String (manual, automatic),
  reason: String,
  notifiedUsers: [ObjectId],
  resolvedAt: Date,
  createdAt: Date
}
```

**Action Items**:
- [ ] Create MongoDB schemas/models
- [ ] Add indexes for performance (user email, activity date, location)
- [ ] Set up geospatial indexes for location queries
- [ ] Create database migrations/seed scripts
- [ ] Test schema with sample data
- [ ] Document schema relationships

**Deliverables**:
- Complete Mongoose models (or equivalent)
- Database indexes configured
- Sample data seeded
- Schema documentation

---

### Step 1.3: Authentication System (Day 3-4)

**Objective**: Implement secure user authentication

**Requirements**:
- Email/password registration
- Login with JWT tokens
- Token refresh mechanism
- Password reset flow
- Profile management

**Implementation Steps**:

1. **Install Dependencies**:
```bash
npm install bcrypt jsonwebtoken nodemailer express-validator
```

2. **Create Auth Endpoints**:
```javascript
// Backend endpoints to implement
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
PUT  /api/auth/profile
```

3. **Mobile App Integration**:
```javascript
// Update src/context/AuthContext.js
// Replace mock authentication with real API calls
// Store JWT token in AsyncStorage
// Add token refresh logic
// Add automatic logout on 401
```

**Security Checklist**:
- [ ] Password hashing with bcrypt (10+ rounds)
- [ ] JWT with 24hr expiry
- [ ] Refresh tokens with 30-day expiry
- [ ] HTTPS only in production
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all fields
- [ ] SQL injection prevention
- [ ] XSS prevention

**Action Items**:
- [ ] Implement user registration endpoint
- [ ] Implement login endpoint with JWT
- [ ] Create JWT middleware for protected routes
- [ ] Implement token refresh endpoint
- [ ] Set up email service (SendGrid/Nodemailer)
- [ ] Implement password reset flow
- [ ] Update mobile AuthContext to use real API
- [ ] Test login/logout flow end-to-end
- [ ] Add error handling for network failures

**Deliverables**:
- Working registration and login
- JWT token authentication
- Mobile app can register and login
- Profile retrieval and update working

---

### Step 1.4: Image Upload Service (Day 4-5)

**Objective**: Enable users to upload profile photos and activity images

**Options**:
1. **Cloudinary** (Recommended)
   - Free tier: 25GB storage, 25GB bandwidth
   - Image transformations built-in
   - CDN included

2. **AWS S3**
   - More control
   - Requires more setup
   - Cheaper at scale

3. **Firebase Storage**
   - Easy if using Firebase
   - Good mobile SDK

**Implementation**:

1. **Backend Setup**:
```bash
npm install cloudinary multer
```

2. **Create Upload Endpoints**:
```javascript
POST /api/upload/profile-photo
POST /api/upload/activity-photo
POST /api/upload/club-photo
```

3. **Mobile Integration**:
```javascript
// Update src/services/imageService.js
// Replace mock upload with real API call
// Add progress tracking
// Add error handling
```

**Action Items**:
- [ ] Set up Cloudinary account
- [ ] Configure upload middleware (Multer)
- [ ] Create upload endpoints
- [ ] Add file type validation
- [ ] Add file size limits (5MB max)
- [ ] Implement image compression
- [ ] Update mobile imageService.js
- [ ] Test photo upload from mobile
- [ ] Add loading states in UI

**Deliverables**:
- Profile photo upload working
- Activity photo upload working
- Images stored in cloud
- CDN URLs returned

---

## WEEK 2: CORE ACTIVITY FEATURES - PART 1

### Step 2.1: Activity Creation API (Day 5-7)

**Objective**: Allow users to create activities and save to database

**Backend Implementation**:

```javascript
// Activity endpoints
POST   /api/activities          // Create activity
GET    /api/activities          // List activities (with filters)
GET    /api/activities/:id      // Get activity details
PUT    /api/activities/:id      // Update activity (organizer only)
DELETE /api/activities/:id      // Delete activity (organizer only)
POST   /api/activities/:id/join // Join activity
POST   /api/activities/:id/leave // Leave activity
GET    /api/activities/my       // User's activities
GET    /api/activities/nearby   // Nearby activities
```

**Validation Requirements**:
- Title: 3-100 characters
- Date: Must be in future
- Max participants: 2-1000
- Entry fee: 0-10000
- Location: Valid coordinates
- Activity type: Enum (running, cycling, hiking, swimming)
- Difficulty: Enum (easy, medium, hard, extreme)

**Business Logic**:
```javascript
// When user joins activity:
- Check if activity is full
- Check if already joined
- Deduct entry fee if applicable
- Send confirmation notification
- Update participant count

// When user creates activity:
- Validate all fields
- Upload photos to cloud
- Save to database
- Generate shareable link
- Send notification to followers
```

**Mobile Integration**:
```javascript
// Update CreateChallengeScreen.js
// Replace local save with API call
// Add loading states
// Handle success/error
// Navigate to activity detail on success
```

**Action Items**:
- [ ] Implement activity CRUD endpoints
- [ ] Add activity validation middleware
- [ ] Implement join/leave logic
- [ ] Add participant count updates
- [ ] Implement activity filters (date, location, type)
- [ ] Add pagination for activity list
- [ ] Update CreateChallengeScreen to use API
- [ ] Add form submission error handling
- [ ] Test activity creation end-to-end
- [ ] Test join/leave flows

**Deliverables**:
- Users can create activities from mobile
- Activities saved to database
- Activities visible in explore screen
- Join/leave functionality working

---

### Step 2.2: Activity Discovery & Filtering (Day 7-9)

**Objective**: Enable users to discover and filter activities

**Backend Features**:

```javascript
// Advanced filtering endpoint
GET /api/activities?
  type=cycling&
  difficulty=easy,medium&
  dateFrom=2025-01-01&
  dateTo=2025-01-31&
  lat=-20.16&
  lng=57.50&
  radius=50&
  minParticipants=5&
  maxEntryFee=500&
  page=1&
  limit=20
```

**Search Features**:
- Text search (title, description)
- Activity type filter
- Difficulty filter
- Date range filter
- Location radius filter (geospatial)
- Entry fee range
- Participant count
- Organizer filter

**Mobile Implementation**:

```javascript
// Update ExploreScreen.js
// Replace mockData with API calls
// Add filter UI
// Add search bar
// Add pagination
// Add pull-to-refresh
// Add loading states
```

**Action Items**:
- [ ] Implement activity search endpoint
- [ ] Add geospatial queries (find nearby activities)
- [ ] Implement filter logic in backend
- [ ] Add pagination and sorting
- [ ] Update ExploreScreen with real data
- [ ] Add filter modal UI
- [ ] Implement search functionality
- [ ] Add location-based discovery
- [ ] Test filtering combinations
- [ ] Add empty states

**Deliverables**:
- Activity discovery working with real data
- Filters functional (type, difficulty, date, location)
- Search working
- Pagination working
- Location-based discovery

---

### Step 2.3: Activity Detail Enhancement (Day 9-10)

**Objective**: Complete activity detail screen with real data and interactions

**Features to Implement**:

1. **Participant Management**:
```javascript
GET /api/activities/:id/participants  // Get participant list
GET /api/activities/:id/organizer     // Get organizer details
POST /api/activities/:id/invite       // Invite friend to activity
```

2. **Activity Stats**:
```javascript
GET /api/activities/:id/stats         // Get activity statistics
// Returns: current participants, gender ratio, avg age, etc.
```

3. **Route Visualization**:
```javascript
// If organizer uploaded route
GET /api/activities/:id/route         // Get route coordinates
// Display on map in ChallengeDetailScreen
```

**Mobile Integration**:

```javascript
// Update ChallengeDetailScreen.js
// Fetch activity from API using route params
// Display real participant list
// Implement join button with API call
// Show loading states
// Add error handling
// Implement share activity
```

**Action Items**:
- [ ] Implement participant list endpoint
- [ ] Add activity stats endpoint
- [ ] Update ChallengeDetailScreen with API
- [ ] Implement join button logic
- [ ] Add participant list display
- [ ] Show organizer details
- [ ] Add share functionality
- [ ] Implement route visualization
- [ ] Add loading and error states
- [ ] Test join flow end-to-end

**Deliverables**:
- Activity details load from API
- Join button functional
- Participant list displayed
- Route shown on map
- Share functionality working

---

## WEEK 3: REAL-TIME GPS TRACKING

### Step 3.1: WebSocket Setup for Real-Time Features (Day 10-12)

**Objective**: Enable real-time communication between server and mobile clients

**Technology**: Socket.io

**Backend Setup**:

```bash
npm install socket.io socket.io-redis
```

**Socket.io Events to Implement**:

```javascript
// Connection
socket.on('authenticate', (token) => { /* Verify JWT */ });

// Activity session
socket.on('join-activity', (activityId, userId) => { /* Join room */ });
socket.on('leave-activity', (activityId, userId) => { /* Leave room */ });

// Location updates
socket.on('location-update', (data) => {
  // data: { activityId, userId, location, stats }
  // Broadcast to all participants in activity room
  socket.to(activityId).emit('participant-location', data);
});

// Safety alerts
socket.on('sos-alert', (data) => {
  // Broadcast emergency to all participants
  socket.to(activityId).emit('emergency-alert', data);
});

// Chat messages
socket.on('send-message', (data) => {
  socket.to(activityId).emit('new-message', data);
});
```

**Mobile Integration**:

```bash
npm install socket.io-client
```

```javascript
// Create src/services/socketService.js
import io from 'socket.io-client';

class SocketService {
  connect(token) {
    this.socket = io('http://your-backend-url', {
      auth: { token }
    });
  }

  joinActivity(activityId, userId) {
    this.socket.emit('join-activity', { activityId, userId });
  }

  sendLocationUpdate(activityId, userId, location, stats) {
    this.socket.emit('location-update', {
      activityId,
      userId,
      location,
      stats
    });
  }

  onParticipantLocation(callback) {
    this.socket.on('participant-location', callback);
  }

  sendSOSAlert(activityId, userId, location) {
    this.socket.emit('sos-alert', {
      activityId,
      userId,
      location,
      timestamp: new Date()
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();
```

**Action Items**:
- [ ] Set up Socket.io server
- [ ] Implement authentication for WebSocket
- [ ] Create activity rooms
- [ ] Implement location update events
- [ ] Create socketService.js in mobile app
- [ ] Test WebSocket connection
- [ ] Add reconnection logic
- [ ] Implement heartbeat mechanism
- [ ] Add error handling
- [ ] Test with multiple clients

**Deliverables**:
- WebSocket server running
- Mobile app can connect
- Real-time events working
- Room-based messaging functional

---

### Step 3.2: Live Activity Tracking Implementation (Day 12-14)

**Objective**: Enable real-time GPS tracking with multiple participants

**Backend Components**:

1. **Activity Session Management**:
```javascript
POST /api/activities/:id/start-session  // Organizer starts activity
POST /api/activities/:id/end-session    // Organizer ends activity
GET  /api/activities/:id/session        // Get active session
GET  /api/activities/:id/session/participants // Get live participant data
```

2. **Location Update Handler**:
```javascript
// In socket event handler
socket.on('location-update', async (data) => {
  const { activityId, userId, location, stats } = data;

  // Update session participant data in database
  await ActivitySession.updateOne(
    {
      activityId,
      'participants.userId': userId
    },
    {
      $push: { 'participants.$.route.coordinates': location.coordinates },
      $set: {
        'participants.$.currentLocation': location,
        'participants.$.stats': stats,
        'participants.$.lastUpdate': new Date()
      }
    }
  );

  // Broadcast to all participants
  socket.to(activityId).emit('participant-location', {
    userId,
    location,
    stats,
    timestamp: new Date()
  });

  // Check for safety alerts
  checkSafetyAlerts(activityId, userId, stats);
});
```

**Mobile Integration**:

```javascript
// Update LiveTrackingScreen.js

import socketService from '../services/socketService';
import { gpsService } from '../services/gpsService';

const LiveTrackingScreen = ({ route }) => {
  const { activityId } = route.params;
  const [participants, setParticipants] = useState([]);
  const [myStats, setMyStats] = useState({});

  useEffect(() => {
    // Connect to WebSocket
    socketService.connect(authToken);
    socketService.joinActivity(activityId, userId);

    // Listen for other participants' locations
    socketService.onParticipantLocation((data) => {
      setParticipants(prev => {
        const index = prev.findIndex(p => p.userId === data.userId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [...prev, data];
      });
    });

    // Start GPS tracking
    const locationSubscription = gpsService.watchLocation(
      async (location) => {
        // Calculate stats
        const stats = await gpsService.calculateStats(location);
        setMyStats(stats);

        // Send to server
        socketService.sendLocationUpdate(
          activityId,
          userId,
          location,
          stats
        );
      },
      { accuracy: 5, interval: 3000 } // Update every 3 seconds
    );

    return () => {
      locationSubscription.remove();
      socketService.disconnect();
    };
  }, []);

  return (
    <View>
      <MapView>
        {/* Render all participant markers */}
        {participants.map(p => (
          <Marker
            key={p.userId}
            coordinate={p.location.coordinates}
            title={p.userName}
            description={`${p.stats.distance}km - ${p.stats.pace}/km`}
          />
        ))}
      </MapView>

      {/* Leaderboard */}
      <FlatList
        data={participants.sort((a, b) => b.stats.distance - a.stats.distance)}
        renderItem={renderParticipant}
      />
    </View>
  );
};
```

**Performance Optimizations**:
- Send location updates every 3-5 seconds (not every GPS update)
- Throttle map re-renders
- Use markers instead of polylines for participants (render polylines on-demand)
- Compress location data before sending

**Action Items**:
- [ ] Implement session start/end endpoints
- [ ] Create WebSocket location update handler
- [ ] Update ActivitySession model with locations
- [ ] Integrate socketService in LiveTrackingScreen
- [ ] Update participant markers in real-time
- [ ] Add leaderboard with live ranking
- [ ] Implement location throttling (3-5 sec intervals)
- [ ] Add reconnection handling
- [ ] Test with multiple devices simultaneously
- [ ] Optimize map rendering performance

**Deliverables**:
- Live tracking with multiple participants working
- Real-time location updates visible
- Leaderboard updating in real-time
- Stats calculating correctly
- Map showing all participants

---

### Step 3.3: Activity Session History (Day 14-15)

**Objective**: Save and display completed activity sessions

**Backend Features**:

```javascript
GET /api/activities/:id/sessions        // All sessions for an activity
GET /api/activities/:id/sessions/:sessionId // Specific session details
GET /api/users/:id/activities          // User's activity history
GET /api/users/:id/statistics          // User's aggregate stats
```

**Data to Store**:
- Complete route for each participant
- Time-series stats (distance, pace at each point)
- Photos taken during activity
- Final rankings
- Achievements earned
- Session summary (total distance, duration, participants)

**Mobile Integration**:

```javascript
// Update ActivityDetailScreen.js
// Show completed activity with map replay
// Display all participants' routes
// Show final statistics and rankings
// Show photos from activity
```

**Features to Add**:
1. **Route Replay**: Animate participants' movement on map
2. **Stats Comparison**: Compare your stats vs others
3. **Export Activity**: Share as image/PDF
4. **Activity Feed**: Post to social feed

**Action Items**:
- [ ] Implement session history endpoints
- [ ] Save complete routes and stats
- [ ] Create ActivityDetailScreen for completed activities
- [ ] Add route visualization with all participants
- [ ] Implement route replay animation
- [ ] Add stats comparison features
- [ ] Create activity export functionality
- [ ] Add share to social media
- [ ] Test with real activity data

**Deliverables**:
- Completed activities saved with full data
- Activity history accessible
- Route replay working
- Stats comparison available
- Export and share functional

---

## WEEK 4: COST SHARING & PAYMENTS

### Step 4.1: Payment Gateway Integration (Day 15-17)

**Objective**: Integrate real payment processing

**Payment Methods to Support**:
1. Credit/Debit Cards (via Stripe)
2. M-Pesa (Mauritius mobile money)
3. Bank Transfer (for large amounts)

**Recommended Provider**: Stripe (supports cards + alternative payment methods)

**Setup Steps**:

1. **Create Stripe Account**:
- Sign up at stripe.com
- Get API keys (test mode first)
- Set up webhook endpoint

2. **Install Dependencies**:
```bash
# Backend
npm install stripe

# Mobile
npm install @stripe/stripe-react-native
```

3. **Backend Implementation**:

```javascript
// Payment endpoints
POST /api/payments/create-intent       // Create payment intent
POST /api/payments/confirm            // Confirm payment
POST /api/payments/refund             // Process refund
GET  /api/payments/history            // User's payment history
POST /api/webhooks/stripe             // Stripe webhook handler

// Example: Create payment intent
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/payments/create-intent', async (req, res) => {
  const { amount, currency, bookingId } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Stripe uses cents
    currency: currency || 'usd',
    metadata: { bookingId }
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});
```

4. **Mobile Integration**:

```javascript
// Update PaymentScreen.js
import { StripeProvider, CardField, useStripe } from '@stripe/stripe-react-native';

const PaymentScreen = ({ route }) => {
  const { amount, bookingDetails } = route.params;
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // Get payment intent from backend
    const { clientSecret } = await fetch('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency: 'MUR',
        bookingId: bookingDetails.id
      })
    }).then(r => r.json());

    // Confirm payment with Stripe
    const { error, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card'
    });

    if (error) {
      Alert.alert('Payment failed', error.message);
    } else if (paymentIntent) {
      // Payment successful
      await confirmBooking(bookingDetails.id, paymentIntent.id);
      navigation.navigate('BookingConfirmation', { bookingId });
    }

    setLoading(false);
  };

  return (
    <StripeProvider publishableKey="pk_test_...">
      <View>
        <CardField
          postalCodeEnabled={false}
          style={{ height: 50 }}
        />
        <Button
          title={`Pay ${amount} MUR`}
          onPress={handlePayment}
          loading={loading}
        />
      </View>
    </StripeProvider>
  );
};
```

**M-Pesa Integration** (Alternative):
```javascript
// For Mauritius M-Pesa
// Use MauBank API or third-party provider
// Implement similar flow with phone number instead of card
```

**Security Checklist**:
- [ ] Never store card details
- [ ] Use Stripe.js/SDK for card handling
- [ ] Validate amounts on backend
- [ ] Implement idempotency keys
- [ ] Set up webhook signature verification
- [ ] Use HTTPS only
- [ ] Log all transactions
- [ ] Implement fraud detection

**Action Items**:
- [ ] Set up Stripe account
- [ ] Install Stripe SDK on mobile
- [ ] Implement payment intent creation
- [ ] Create payment confirmation flow
- [ ] Update PaymentScreen with Stripe UI
- [ ] Implement webhook handler
- [ ] Add payment status tracking
- [ ] Test with Stripe test cards
- [ ] Implement refund logic
- [ ] Add payment history display

**Deliverables**:
- Real payment processing working
- Credit card payments functional
- Payment confirmation working
- Refunds functional
- Payment history accessible

---

### Step 4.2: Booking System Completion (Day 17-19)

**Objective**: Complete end-to-end booking flow for transport and accommodation

**Backend Endpoints**:

```javascript
// Booking management
POST   /api/bookings                    // Create booking
GET    /api/bookings/:id                // Get booking details
PUT    /api/bookings/:id/cancel         // Cancel booking
GET    /api/bookings/user/:userId       // User's bookings
POST   /api/bookings/:id/confirm-payment // Link payment to booking

// Transport bookings
GET    /api/activities/:id/transport    // Get transport options for activity
POST   /api/transport/request           // Request transport slot
POST   /api/transport/:id/confirm       // Confirm transport booking

// Accommodation bookings
GET    /api/activities/:id/accommodation // Get accommodation options
POST   /api/accommodation/request       // Request accommodation slot
```

**Booking Flow**:

1. **User Joins Activity** → Optionally add transport/accommodation
2. **Select Options** → Choose from organizer services or external options
3. **Calculate Cost** → Show cost breakdown (activity fee + transport + accommodation)
4. **Payment** → Process payment for all services
5. **Confirmation** → Send booking confirmation with details
6. **Reminder** → Send reminders before activity date

**Mobile Implementation**:

```javascript
// Enhanced RideSharingScreen.js
const RideSharingScreen = ({ route }) => {
  const { activityId } = route.params;
  const [transportOptions, setTransportOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    loadTransportOptions();
  }, []);

  const loadTransportOptions = async () => {
    const response = await fetch(`/api/activities/${activityId}/transport`);
    const data = await response.json();
    setTransportOptions(data);
  };

  const handleBookTransport = async (option) => {
    // Navigate to payment with booking details
    navigation.navigate('Payment', {
      bookingType: 'transport',
      amount: option.contributionFee,
      details: {
        activityId,
        transportId: option.id,
        seats: 1
      }
    });
  };

  return (
    <View>
      <FlatList
        data={transportOptions}
        renderItem={({ item }) => (
          <TransportCard
            option={item}
            onBook={() => handleBookTransport(item)}
          />
        )}
      />
    </View>
  );
};
```

**Cost Splitting Logic**:

```javascript
// Backend: Calculate cost split
const calculateCostSplit = (totalCost, participants, paymentStatuses) => {
  const numParticipants = participants.length;
  const costPerPerson = totalCost / numParticipants;

  // Check who has paid
  const paidParticipants = participants.filter(p =>
    paymentStatuses[p.userId] === 'paid'
  );

  const unpaidParticipants = participants.filter(p =>
    !paymentStatuses[p.userId] || paymentStatuses[p.userId] !== 'paid'
  );

  return {
    totalCost,
    costPerPerson,
    paidCount: paidParticipants.length,
    unpaidCount: unpaidParticipants.length,
    participants: participants.map(p => ({
      userId: p.userId,
      name: p.name,
      amountDue: costPerPerson,
      status: paymentStatuses[p.userId] || 'pending'
    }))
  };
};
```

**Action Items**:
- [ ] Implement booking CRUD endpoints
- [ ] Create transport booking flow
- [ ] Create accommodation booking flow
- [ ] Implement cost splitting logic
- [ ] Update RideSharingScreen with real data
- [ ] Integrate payment with booking
- [ ] Add booking confirmation screen
- [ ] Implement cancellation logic
- [ ] Add refund processing
- [ ] Send booking confirmation notifications
- [ ] Test full booking flow

**Deliverables**:
- Complete booking system functional
- Transport booking working
- Accommodation booking working
- Cost splitting calculated
- Payment linked to bookings
- Confirmations sent

---

### Step 4.3: Organizer Services & Cost Contribution (Day 19-20)

**Objective**: Allow activity organizers to offer their own services with contribution fees

**Features**:

1. **When Creating Activity**: Organizer can toggle services
2. **Service Definition**: Specify type, capacity, contribution fee
3. **Participant Selection**: Participants choose which services to use
4. **Payment Collection**: Collect contribution fees during booking
5. **Service Management**: Organizer can see who opted in

**Backend Implementation**:

```javascript
// In activity creation
POST /api/activities
{
  ...activityDetails,
  organizerServices: {
    transport: {
      available: true,
      type: "Car - 5 seater",
      contributionFee: 500,
      currency: "MUR",
      maxSeats: 4, // Organizer takes 1 seat
      bookedSeats: 0,
      pickupLocation: "Port Louis",
      pickupTime: "2025-01-15T06:00:00Z"
    },
    accommodation: {
      available: true,
      type: "Camping tent",
      contributionFee: 200,
      currency: "MUR",
      maxSlots: 6,
      bookedSlots: 0,
      location: "Le Morne Beach"
    }
  }
}

// When participant books service
POST /api/activities/:id/book-organizer-service
{
  serviceType: "transport", // or "accommodation"
  quantity: 1
}
```

**Mobile UI Enhancement**:

```javascript
// In CreateChallengeScreen.js - Add service toggles
const [provideTransport, setProvideTransport] = useState(false);
const [provideAccommodation, setProvideAccommodation] = useState(false);

// Service input section
{provideTransport && (
  <View style={styles.serviceSection}>
    <Text>Transport Details</Text>
    <TextInput
      placeholder="Vehicle type (e.g., Car - 5 seater)"
      value={transportType}
      onChangeText={setTransportType}
    />
    <TextInput
      placeholder="Contribution fee per person"
      keyboardType="numeric"
      value={transportFee}
      onChangeText={setTransportFee}
    />
    <TextInput
      placeholder="Available seats"
      keyboardType="numeric"
      value={transportSeats}
      onChangeText={setTransportSeats}
    />
  </View>
)}

// In ChallengeDetailScreen.js - Show organizer services
{activity.organizerServices?.transport?.available && (
  <TouchableOpacity
    style={styles.serviceCard}
    onPress={() => handleBookService('transport')}
  >
    <Text>Transport: {activity.organizerServices.transport.type}</Text>
    <Text>Contribution: {activity.organizerServices.transport.contributionFee} MUR</Text>
    <Text>Available: {activity.organizerServices.transport.maxSeats - activity.organizerServices.transport.bookedSeats} seats</Text>
  </TouchableOpacity>
)}
```

**Action Items**:
- [ ] Update activity schema with organizerServices
- [ ] Add service toggle in CreateChallengeScreen
- [ ] Implement service booking endpoint
- [ ] Update ChallengeDetailScreen to show services
- [ ] Add service booking to payment flow
- [ ] Track service bookings and availability
- [ ] Show organizer who booked their services
- [ ] Implement service cancellation
- [ ] Add service cost to total booking amount
- [ ] Test organizer service flow end-to-end

**Deliverables**:
- Organizers can offer transport/accommodation
- Participants can book organizer services
- Contribution fees calculated correctly
- Service capacity tracked
- Payment includes service costs

---

## WEEK 5: SAFETY FEATURES

### Step 5.1: Emergency SOS System (Day 20-22)

**Objective**: Implement functional emergency alert system

**Requirements**:
- SOS button accessible during live activities
- Alert sent to all participants instantly
- Alert sent to emergency contacts
- Location shared with responders
- Emergency services contact info displayed

**Backend Implementation**:

```javascript
// SOS endpoints
POST /api/sos/alert              // Trigger SOS alert
GET  /api/sos/active             // Get active alerts
POST /api/sos/:id/respond        // Respond to alert
POST /api/sos/:id/resolve        // Mark alert as resolved

// SOS alert handler
app.post('/api/sos/alert', authenticateToken, async (req, res) => {
  const { activityId, sessionId, location, reason } = req.body;
  const userId = req.user.id;

  // Create SOS alert
  const alert = await SOSAlert.create({
    userId,
    activityId,
    sessionId,
    location: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude]
    },
    reason: reason || 'Emergency',
    type: 'manual',
    createdAt: new Date()
  });

  // Get activity participants
  const activity = await Activity.findById(activityId).populate('participants.userId');
  const user = await User.findById(userId);

  // Notify all participants via WebSocket
  io.to(activityId).emit('emergency-alert', {
    alertId: alert._id,
    userId,
    userName: user.name,
    location,
    reason,
    timestamp: new Date()
  });

  // Send push notifications to all participants
  const participantTokens = activity.participants.map(p => p.userId.pushToken);
  await sendPushNotification(participantTokens, {
    title: '🚨 EMERGENCY ALERT',
    body: `${user.name} has triggered an SOS alert!`,
    data: { type: 'emergency', alertId: alert._id }
  });

  // Notify user's emergency contacts
  if (user.emergencyContacts && user.emergencyContacts.length > 0) {
    await sendEmergencySMS(user.emergencyContacts, {
      userName: user.name,
      activity: activity.title,
      location: `https://maps.google.com/?q=${location.latitude},${location.longitude}`,
      timestamp: new Date()
    });
  }

  res.json({ success: true, alert });
});
```

**Mobile Implementation**:

```javascript
// Update LiveTrackingScreen.js with SOS button
import socketService from '../services/socketService';

const LiveTrackingScreen = () => {
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  useEffect(() => {
    // Listen for emergency alerts
    socketService.onEmergencyAlert((alert) => {
      setEmergencyAlerts(prev => [...prev, alert]);

      // Show immediate alert dialog
      Alert.alert(
        '🚨 EMERGENCY ALERT',
        `${alert.userName} needs help!\n\nLocation: View on map`,
        [
          { text: 'View Location', onPress: () => focusOnAlert(alert) },
          { text: 'Call', onPress: () => callParticipant(alert.userId) },
          { text: 'OK' }
        ]
      );

      // Play alert sound
      playAlertSound();
    });
  }, []);

  const handleSOSPress = () => {
    Alert.alert(
      'Emergency SOS',
      'This will alert all participants and your emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            const location = await gpsService.getCurrentLocation();

            // Send SOS via socket
            socketService.sendSOSAlert(activityId, userId, location);

            // Also call backend
            await fetch('/api/sos/alert', {
              method: 'POST',
              body: JSON.stringify({
                activityId,
                sessionId,
                location,
                reason: 'Manual SOS trigger'
              })
            });

            Alert.alert('SOS Sent', 'Help is on the way!');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <MapView>
        {/* Emergency alert markers */}
        {emergencyAlerts.map(alert => (
          <Marker
            key={alert.alertId}
            coordinate={alert.location}
            pinColor="red"
            title="🚨 EMERGENCY"
            description={alert.userName}
          />
        ))}
      </MapView>

      {/* SOS Button - always visible */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={handleSOSPress}
      >
        <Text style={styles.sosText}>🚨 SOS</Text>
      </TouchableOpacity>

      {/* Active alerts banner */}
      {emergencyAlerts.length > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            ⚠️ {emergencyAlerts.length} active emergency alert(s)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sosButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF0000',
    padding: 15,
  },
  alertText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
```

**SMS Service for Emergency Contacts**:

```javascript
// Backend - using Twilio or similar
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const sendEmergencySMS = async (contacts, data) => {
  const message = `
🚨 EMERGENCY ALERT

${data.userName} has triggered an emergency alert during activity: ${data.activity}

Location: ${data.location}
Time: ${data.timestamp.toLocaleString()}

Please check on them immediately.
  `.trim();

  for (const contact of contacts) {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: contact.phone
    });
  }
};
```

**Action Items**:
- [ ] Implement SOS alert endpoints
- [ ] Set up SMS service (Twilio)
- [ ] Create emergency alert handler
- [ ] Add SOS button to LiveTrackingScreen
- [ ] Implement WebSocket emergency events
- [ ] Add emergency alert markers on map
- [ ] Create alert notification UI
- [ ] Implement respond/resolve functionality
- [ ] Add emergency contacts to user profile
- [ ] Test SOS flow end-to-end
- [ ] Add alert sound/vibration

**Deliverables**:
- SOS button functional during activities
- Alerts sent to all participants instantly
- Emergency contacts notified via SMS
- Alert location visible on map
- Respond/resolve functionality working

---

### Step 5.2: Health Monitoring & Safety Checks (Day 22-24)

**Objective**: Monitor participant health and detect distress signals

**Health Metrics to Track**:
1. Movement status (moving, paused, stopped)
2. Distance from group (falling behind detection)
3. Heart rate (if available via Bluetooth devices)
4. Check-in status (periodic safety check-ins)
5. Battery level (low battery warning)

**Backend Implementation**:

```javascript
// Safety monitoring service
const checkSafetyAlerts = async (activityId, userId, stats, location) => {
  const session = await ActivitySession.findOne({ activityId, status: 'active' });
  const participant = session.participants.find(p => p.userId.toString() === userId);

  const alerts = [];

  // No movement for > 5 minutes
  const lastUpdate = new Date(participant.lastUpdate);
  const timeSinceUpdate = Date.now() - lastUpdate.getTime();
  if (stats.speed === 0 && timeSinceUpdate > 300000) {
    alerts.push({
      type: 'NO_MOVEMENT',
      severity: 'high',
      message: `${participant.userName} hasn't moved in 5+ minutes`
    });
  }

  // Falling significantly behind (> 2km from leader)
  const leader = session.participants.reduce((max, p) =>
    p.stats.distance > max.stats.distance ? p : max
  );
  const distanceBehind = leader.stats.distance - participant.stats.distance;
  if (distanceBehind > 2000) {
    alerts.push({
      type: 'FALLING_BEHIND',
      severity: 'medium',
      message: `${participant.userName} is 2km+ behind the group`
    });
  }

  // Abnormal heart rate (if available)
  if (stats.heartRate && (stats.heartRate > 180 || stats.heartRate < 40)) {
    alerts.push({
      type: 'ABNORMAL_HEART_RATE',
      severity: 'high',
      message: `${participant.userName} has abnormal heart rate: ${stats.heartRate} bpm`
    });
  }

  // Low battery
  if (stats.batteryLevel && stats.batteryLevel < 10) {
    alerts.push({
      type: 'LOW_BATTERY',
      severity: 'low',
      message: `${participant.userName}'s phone battery is critically low (${stats.batteryLevel}%)`
    });
  }

  // Send alerts if any
  if (alerts.length > 0) {
    for (const alert of alerts) {
      // Notify organizer
      io.to(`user-${session.organizerId}`).emit('safety-alert', {
        userId,
        userName: participant.userName,
        alert,
        location
      });

      // Log in database
      await SafetyAlert.create({
        activityId,
        sessionId: session._id,
        userId,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        location,
        resolved: false
      });
    }
  }
};
```

**Mobile Implementation - Health Monitoring**:

```javascript
// Create src/services/healthService.js
import { Pedometer } from 'expo-sensors';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';

class HealthService {
  async getHealthMetrics() {
    const metrics = {
      timestamp: new Date(),
      steps: 0,
      batteryLevel: 100,
      deviceInfo: null
    };

    // Get step count
    const isAvailable = await Pedometer.isAvailableAsync();
    if (isAvailable) {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(start, end);
      metrics.steps = result.steps;
    }

    // Get battery level
    metrics.batteryLevel = await Battery.getBatteryLevelAsync() * 100;

    // Get device info
    metrics.deviceInfo = {
      brand: Device.brand,
      modelName: Device.modelName,
      osVersion: Device.osVersion
    };

    return metrics;
  }

  // Bluetooth heart rate monitor integration (if available)
  async connectHeartRateMonitor() {
    // Implement Bluetooth connection to fitness wearables
    // This requires additional setup and device-specific protocols
    // Example: Connect to Apple Watch, Fitbit, Garmin, etc.
  }

  async getHeartRate() {
    // Return heart rate from connected device
    // For MVP, return null (not available)
    return null;
  }
}

export default new HealthService();
```

**Safety Check-In Feature**:

```javascript
// Periodic safety check-ins during activity
useEffect(() => {
  if (!isActivityActive) return;

  const checkInInterval = setInterval(() => {
    Alert.alert(
      'Safety Check-In',
      'Are you okay?',
      [
        {
          text: "I'm OK ✓",
          onPress: () => sendCheckIn('ok')
        },
        {
          text: 'Need Help',
          onPress: () => handleSOSPress(),
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  }, 15 * 60 * 1000); // Every 15 minutes

  return () => clearInterval(checkInInterval);
}, [isActivityActive]);

const sendCheckIn = async (status) => {
  await fetch('/api/activities/check-in', {
    method: 'POST',
    body: JSON.stringify({
      activityId,
      userId,
      status,
      timestamp: new Date()
    })
  });
};
```

**UI Enhancements**:

```javascript
// In LiveTrackingScreen.js - Add health indicators
const renderParticipant = ({ item }) => (
  <View style={styles.participantCard}>
    <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
    <View style={styles.participantInfo}>
      <Text>{item.userName}</Text>
      <Text>{item.stats.distance}km - {item.stats.pace}/km</Text>

      {/* Health status indicator */}
      <View style={styles.healthIndicator}>
        <View style={[
          styles.statusDot,
          { backgroundColor: getHealthStatusColor(item) }
        ]} />
        <Text style={styles.healthText}>{getHealthStatus(item)}</Text>
      </View>

      {/* Battery level */}
      {item.stats.batteryLevel < 20 && (
        <Text style={styles.warning}>
          🔋 {item.stats.batteryLevel}%
        </Text>
      )}
    </View>
  </View>
);

const getHealthStatusColor = (participant) => {
  // Check for alerts
  if (participant.alerts?.some(a => a.severity === 'high')) return '#FF0000';
  if (participant.alerts?.some(a => a.severity === 'medium')) return '#FFA500';
  return '#00FF00';
};

const getHealthStatus = (participant) => {
  if (participant.alerts?.length > 0) return 'Needs Attention';
  if (participant.speed === 0) return 'Paused';
  return 'OK';
};
```

**Action Items**:
- [ ] Implement safety monitoring logic
- [ ] Create healthService.js with metrics collection
- [ ] Add battery level tracking
- [ ] Implement falling behind detection
- [ ] Add safety check-in feature
- [ ] Create safety alert endpoints
- [ ] Update LiveTrackingScreen with health indicators
- [ ] Add organizer safety dashboard
- [ ] Implement alert notifications
- [ ] Test safety monitoring with real activity

**Deliverables**:
- Health metrics tracked during activities
- Safety alerts generated automatically
- Check-in system functional
- Health status visible on participant list
- Organizer receives safety alerts

---

## WEEK 6: SOCIAL FEATURES & CLUBS

### Step 6.1: Activity Feed with Real Data (Day 24-26)

**Objective**: Create social activity feed with real user activities

**Backend Implementation**:

```javascript
// Activity feed endpoints
GET /api/feed                        // User's personalized feed
GET /api/feed/user/:userId          // Specific user's activities
POST /api/activities/:id/post       // Post activity to feed
POST /api/feed/:postId/like         // Like a post
POST /api/feed/:postId/comment      // Comment on post
GET /api/feed/:postId/comments      // Get comments
DELETE /api/feed/:postId/comment/:commentId // Delete comment

// Feed generation logic
app.get('/api/feed', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Get user's following list
  const user = await User.findById(userId);
  const followingIds = user.following || [];

  // Get activities from user + following
  const posts = await ActivityPost.find({
    userId: { $in: [userId, ...followingIds] }
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'name profilePhoto')
    .populate('activityId')
    .populate('likes', 'name profilePhoto')
    .lean();

  // Add engagement info
  const postsWithEngagement = posts.map(post => ({
    ...post,
    isLiked: post.likes.some(l => l._id.toString() === userId),
    likeCount: post.likes.length,
    commentCount: post.comments.length
  }));

  res.json({
    posts: postsWithEngagement,
    page,
    hasMore: posts.length === limit
  });
});
```

**Mobile Implementation**:

```javascript
// Update ActivityScreen.js to show real feed
import { useAuth } from '../context/AuthContext';

const ActivityScreen = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/feed?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();

      setFeed(prev => page === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetch(`/api/feed/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Update local state
      setFeed(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      await fetch(`/api/feed/${postId}/comment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });

      // Reload post comments
      loadComments(postId);
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadFeed();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={feed}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => handleLike(item._id)}
            onComment={(comment) => handleComment(item._id, comment)}
            onProfilePress={() => navigation.navigate('UserProfile', { userId: item.userId._id })}
          />
        )}
        keyExtractor={item => item._id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={loading && page === 1}
        onRefresh={() => {
          setPage(1);
          loadFeed();
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>No activities yet. Follow friends to see their activities!</Text>
          </View>
        }
      />
    </View>
  );
};
```

**Action Items**:
- [ ] Implement feed generation endpoints
- [ ] Create activity post endpoints
- [ ] Implement like/comment functionality
- [ ] Update ActivityScreen with real feed
- [ ] Create PostCard component with engagement
- [ ] Implement pull-to-refresh
- [ ] Add infinite scroll pagination
- [ ] Create post activity after completion
- [ ] Test feed with multiple users
- [ ] Add loading and error states

**Deliverables**:
- Activity feed showing real activities
- Like/comment functionality working
- Feed updates in real-time
- Pagination working
- Empty states implemented

---

### Step 6.2: Club Formation Automation (Day 26-28)

**Objective**: Automatically suggest and create clubs from repeated activities

**Club Formation Logic**:

```javascript
// Backend - Detect club formation opportunities
const suggestClubFormation = async (activityId) => {
  const activity = await Activity.findById(activityId)
    .populate('participants.userId')
    .populate('organizerId');

  // Check if organizer has done similar activities before
  const similarActivities = await Activity.find({
    organizerId: activity.organizerId,
    activityType: activity.activityType,
    status: 'completed',
    'participants.userId': {
      $in: activity.participants.map(p => p.userId._id)
    }
  }).countDocuments();

  // If organizer has done 3+ similar activities with same participants
  if (similarActivities >= 3) {
    // Check if club already exists
    const existingClub = await Club.findOne({
      founderId: activity.organizerId,
      type: activity.activityType
    });

    if (!existingClub) {
      // Suggest club creation to organizer
      await Notification.create({
        userId: activity.organizerId,
        type: 'club_suggestion',
        title: 'Create a Club?',
        message: `You've organized ${similarActivities} ${activity.activityType} activities! Want to create a club?`,
        data: {
          activityType: activity.activityType,
          participantCount: activity.participants.length,
          suggestedName: `${activity.organizerId.name}'s ${activity.activityType} Club`
        }
      });

      return true;
    }
  }

  return false;
};

// Club creation endpoint
POST /api/clubs/create
{
  name: String,
  description: String,
  type: String,
  logo: String,
  coverPhoto: String,
  initialMembers: [userId], // From completed activity
  location: String,
  isPublic: Boolean
}
```

**Mobile Implementation**:

```javascript
// Show club creation suggestion after activity completion
useEffect(() => {
  if (activityCompleted) {
    checkClubSuggestion();
  }
}, [activityCompleted]);

const checkClubSuggestion = async () => {
  const response = await fetch(`/api/activities/${activityId}/club-suggestion`);
  const data = await response.json();

  if (data.shouldSuggest) {
    Alert.alert(
      '🎉 Create a Club!',
      `You've organized ${data.activityCount} ${data.activityType} activities! Want to create a club with your regular participants?`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Create Club',
          onPress: () => navigation.navigate('CreateClub', {
            suggestedName: data.suggestedName,
            type: data.activityType,
            members: data.participants
          })
        }
      ]
    );
  }
};

// CreateClubScreen.js
const CreateClubScreen = ({ route }) => {
  const { suggestedName, type, members } = route.params || {};
  const [clubName, setClubName] = useState(suggestedName || '');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  const handleCreateClub = async () => {
    // Upload logo if selected
    let logoUrl = null;
    if (logo) {
      const formData = new FormData();
      formData.append('file', {
        uri: logo.uri,
        type: 'image/jpeg',
        name: 'club-logo.jpg'
      });

      const uploadResponse = await fetch('/api/upload/club-photo', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadResponse.json();
      logoUrl = uploadData.url;
    }

    // Create club
    const response = await fetch('/api/clubs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: clubName,
        description,
        type,
        logo: logoUrl,
        initialMembers: members,
        isPublic
      })
    });

    const club = await response.json();

    // Navigate to club detail
    navigation.replace('ClubDetail', { clubId: club._id });
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="Club Name"
        value={clubName}
        onChangeText={setClubName}
      />
      <TextInput
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity onPress={selectLogo}>
        {logo ? (
          <Image source={{ uri: logo.uri }} style={styles.logo} />
        ) : (
          <Text>Select Club Logo</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchRow}>
        <Text>Public Club</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      <Text style={styles.label}>Initial Members ({members?.length || 0})</Text>
      {/* Show member list */}

      <Button
        title="Create Club"
        onPress={handleCreateClub}
        disabled={!clubName}
      />
    </ScrollView>
  );
};
```

**Club Features to Implement**:

1. **Club Events**: Create activities specifically for club members
2. **Club Feed**: Activity feed filtered to club members
3. **Club Roles**: Admin, moderator, member roles
4. **Member Management**: Invite, remove, promote members
5. **Club Stats**: Aggregate stats for all club activities

**Action Items**:
- [ ] Implement club creation endpoint
- [ ] Create club suggestion logic
- [ ] Implement club CRUD operations
- [ ] Create CreateClubScreen
- [ ] Update ClubDetailScreen with real data
- [ ] Implement club member management
- [ ] Add club join/leave functionality
- [ ] Create club event creation
- [ ] Implement club notifications
- [ ] Test club formation flow

**Deliverables**:
- Clubs can be created from activities
- Club suggestion system working
- Members added automatically
- Club management functional
- Club notifications working

---

### Step 6.3: Push Notifications System (Day 28-30)

**Objective**: Implement comprehensive push notification system

**Setup**:

```bash
# Backend
npm install expo-server-sdk

# Mobile - already installed (expo-notifications)
```

**Backend Implementation**:

```javascript
// Notification service
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const sendPushNotification = async (pushTokens, notification) => {
  // Filter valid tokens
  const messages = pushTokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data,
      priority: notification.priority || 'default',
      badge: notification.badge
    }));

  // Send in chunks
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Failed to send notification chunk:', error);
    }
  }

  return tickets;
};

// Notification types and triggers
const notificationTypes = {
  ACTIVITY_INVITE: {
    title: 'New Activity Invitation',
    template: (data) => `${data.organizerName} invited you to ${data.activityTitle}`
  },
  ACTIVITY_STARTING: {
    title: 'Activity Starting Soon',
    template: (data) => `${data.activityTitle} starts in ${data.minutesUntil} minutes!`
  },
  PARTICIPANT_JOINED: {
    title: 'New Participant',
    template: (data) => `${data.userName} joined ${data.activityTitle}`
  },
  EMERGENCY_ALERT: {
    title: '🚨 EMERGENCY ALERT',
    template: (data) => `${data.userName} triggered an emergency alert!`,
    priority: 'high',
    sound: 'emergency.wav'
  },
  CLUB_EVENT: {
    title: 'Club Event Created',
    template: (data) => `New event in ${data.clubName}: ${data.eventTitle}`
  },
  BOOKING_CONFIRMED: {
    title: 'Booking Confirmed',
    template: (data) => `Your booking for ${data.activityTitle} is confirmed`
  },
  PAYMENT_RECEIVED: {
    title: 'Payment Received',
    template: (data) => `Received ${data.amount} ${data.currency} from ${data.userName}`
  }
};

// Send notification helper
const sendNotification = async (userId, type, data) => {
  const user = await User.findById(userId);
  if (!user || !user.pushToken) return;

  const notificationConfig = notificationTypes[type];
  const body = notificationConfig.template(data);

  // Save to database
  await Notification.create({
    userId,
    type,
    title: notificationConfig.title,
    message: body,
    data,
    read: false
  });

  // Send push notification
  await sendPushNotification([user.pushToken], {
    title: notificationConfig.title,
    body,
    data: { type, ...data },
    priority: notificationConfig.priority,
    sound: notificationConfig.sound
  });
};
```

**Mobile Implementation**:

```javascript
// Update src/services/notificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token');
      return null;
    }

    // Get token
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Send token to backend
    await fetch('/api/users/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pushToken: token })
    });

    return token;
  }

  setupNotificationListeners(navigation) {
    // Handle notification when app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Show in-app notification banner
      this.showInAppNotification(notification);
    });

    // Handle notification tap
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      // Navigate based on notification type
      this.handleNotificationNavigation(navigation, data);
    });
  }

  handleNotificationNavigation(navigation, data) {
    switch (data.type) {
      case 'ACTIVITY_INVITE':
        navigation.navigate('ChallengeDetail', { id: data.activityId });
        break;
      case 'EMERGENCY_ALERT':
        navigation.navigate('LiveTracking', { activityId: data.activityId });
        break;
      case 'CLUB_EVENT':
        navigation.navigate('ClubDetail', { clubId: data.clubId });
        break;
      case 'BOOKING_CONFIRMED':
        navigation.navigate('MyBookings');
        break;
      default:
        navigation.navigate('Notifications');
    }
  }

  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();
```

**Update App.js to initialize notifications**:

```javascript
import notificationService from './src/services/notificationService';

export default function App() {
  const navigationRef = useRef();

  useEffect(() => {
    // Register for push notifications
    notificationService.registerForPushNotifications();

    // Set up listeners
    notificationService.setupNotificationListeners(navigationRef.current);

    return () => {
      notificationService.removeListeners();
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationsProvider>
        <MessagesProvider>
          <BookingProvider>
            <SocialProvider>
              <NavigationContainer ref={navigationRef}>
                <AppNavigator />
              </NavigationContainer>
            </SocialProvider>
          </BookingProvider>
        </MessagesProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
```

**Action Items**:
- [ ] Set up Expo push notification service
- [ ] Implement notification sending on backend
- [ ] Register device push tokens
- [ ] Update notificationService.js
- [ ] Implement deep linking for notifications
- [ ] Add notification templates for all types
- [ ] Test notifications on physical devices
- [ ] Implement notification preferences
- [ ] Add notification badges
- [ ] Test notification navigation

**Deliverables**:
- Push notifications working on devices
- All notification types implemented
- Deep linking functional
- Notification preferences working
- Badge counts updating

---

## WEEK 7: TESTING & POLISH

### Step 7.1: End-to-End Testing (Day 30-32)

**Objective**: Comprehensive testing of all critical user flows

**Test Scenarios**:

1. **User Registration & Login**:
- [ ] New user can register with email/password
- [ ] User receives verification email
- [ ] User can log in with credentials
- [ ] JWT token stored correctly
- [ ] Token refresh works
- [ ] Password reset flow works

2. **Activity Creation**:
- [ ] User can create activity with all details
- [ ] Photos upload successfully
- [ ] Activity appears in explore screen
- [ ] Organizer services saved correctly
- [ ] Validation errors display properly

3. **Activity Discovery**:
- [ ] Activities load from API
- [ ] Filters work (type, difficulty, date, location)
- [ ] Search returns relevant results
- [ ] Pagination works
- [ ] Empty states show correctly

4. **Join Activity & Booking**:
- [ ] User can join activity
- [ ] Participant count updates
- [ ] Can select organizer services
- [ ] Payment flow completes
- [ ] Booking confirmation received
- [ ] Notification sent

5. **Live Tracking**:
- [ ] GPS tracking starts correctly
- [ ] Location updates sent to server
- [ ] Other participants visible on map
- [ ] Leaderboard updates in real-time
- [ ] Stats calculate correctly

6. **Safety Features**:
- [ ] SOS button triggers alert
- [ ] All participants notified
- [ ] Emergency contacts receive SMS
- [ ] Safety check-ins work
- [ ] Health monitoring detects issues

7. **Social Features**:
- [ ] Activity feed loads
- [ ] Can like/comment on posts
- [ ] Following users works
- [ ] User profiles display correctly

8. **Club Formation**:
- [ ] Club suggestion appears after 3rd activity
- [ ] Can create club
- [ ] Members added automatically
- [ ] Club notifications sent

**Testing Tools**:

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

**Example Test**:

```javascript
// __tests__/ActivityCreation.test.js
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateChallengeScreen from '../src/screens/CreateChallengeScreen';

describe('Activity Creation', () => {
  it('should create activity successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<CreateChallengeScreen />);

    // Fill form
    fireEvent.changeText(getByPlaceholderText('Activity Title'), 'Test Hike');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test description');

    // Submit
    fireEvent.press(getByText('Create Activity'));

    // Wait for API call
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('ChallengeDetail', expect.any(Object));
    });
  });
});
```

**Action Items**:
- [ ] Write unit tests for critical services
- [ ] Write integration tests for API endpoints
- [ ] Write E2E tests for user flows
- [ ] Test on multiple devices (iOS/Android)
- [ ] Test with poor network conditions
- [ ] Test offline functionality
- [ ] Test with multiple concurrent users
- [ ] Performance testing for live tracking
- [ ] Load testing for backend
- [ ] Security testing (penetration testing)

---

### Step 7.2: Bug Fixes & Error Handling (Day 32-34)

**Common Issues to Address**:

1. **Network Errors**:
```javascript
// Implement retry logic
const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

2. **Loading States**:
```javascript
// Ensure all screens have proper loading states
{loading ? (
  <ActivityIndicator size="large" color={COLORS.primary} />
) : error ? (
  <ErrorView message={error} onRetry={loadData} />
) : data.length === 0 ? (
  <EmptyState message="No activities found" />
) : (
  <FlatList data={data} ... />
)}
```

3. **Input Validation**:
```javascript
// Add comprehensive validation
const validateActivityForm = (data) => {
  const errors = {};

  if (!data.title || data.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (new Date(data.date) < new Date()) {
    errors.date = 'Date must be in the future';
  }

  if (data.maxParticipants < 2) {
    errors.maxParticipants = 'Must allow at least 2 participants';
  }

  return errors;
};
```

4. **Error Boundaries**:
```javascript
// Add error boundary to catch React errors
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text>Something went wrong</Text>
          <Button title="Restart" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }
    return this.props.children;
  }
}
```

**Action Items**:
- [ ] Add error handling to all API calls
- [ ] Implement retry logic for failed requests
- [ ] Add loading states to all screens
- [ ] Add error boundaries
- [ ] Implement proper form validation
- [ ] Add user-friendly error messages
- [ ] Implement offline mode handling
- [ ] Add crash reporting (Sentry)
- [ ] Fix memory leaks
- [ ] Optimize image loading

---

### Step 7.3: Performance Optimization (Day 34-36)

**Mobile App Optimizations**:

1. **Image Optimization**:
```javascript
// Use optimized image component
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

2. **List Optimization**:
```javascript
// Optimize FlatList rendering
<FlatList
  data={activities}
  renderItem={renderItem}
  keyExtractor={item => item._id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
/>
```

3. **Memoization**:
```javascript
// Memoize expensive computations
const sortedParticipants = useMemo(() => {
  return participants.sort((a, b) => b.stats.distance - a.stats.distance);
}, [participants]);

// Memoize callbacks
const handlePress = useCallback(() => {
  navigation.navigate('Detail', { id });
}, [id, navigation]);
```

4. **Debouncing**:
```javascript
// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((query) => {
    searchActivities(query);
  }, 500),
  []
);
```

**Backend Optimizations**:

1. **Database Indexing**:
```javascript
// Add indexes for common queries
ActivitySchema.index({ date: 1, status: 1 });
ActivitySchema.index({ activityType: 1, difficulty: 1 });
ActivitySchema.index({ location: '2dsphere' });
UserSchema.index({ email: 1 }, { unique: true });
```

2. **Query Optimization**:
```javascript
// Use lean() for read-only queries
const activities = await Activity.find({ status: 'upcoming' })
  .select('title date activityType participants')
  .lean();

// Use projection to limit fields
const user = await User.findById(userId, 'name email profilePhoto');
```

3. **Caching**:
```javascript
// Implement Redis caching
const redis = require('redis');
const client = redis.createClient();

const getCachedActivities = async (key) => {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);

  const activities = await Activity.find({ status: 'upcoming' });
  await client.setex(key, 300, JSON.stringify(activities)); // Cache for 5 min
  return activities;
};
```

4. **Rate Limiting**:
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**Action Items**:
- [ ] Optimize image loading and caching
- [ ] Implement list virtualization
- [ ] Add memoization to expensive operations
- [ ] Debounce user inputs
- [ ] Add database indexes
- [ ] Implement caching layer
- [ ] Add rate limiting
- [ ] Optimize bundle size
- [ ] Reduce app size (remove unused dependencies)
- [ ] Test performance on low-end devices

---

## WEEK 8: DEPLOYMENT & FINAL POLISH

### Step 8.1: Backend Deployment (Day 36-38)

**Hosting Options**:

1. **Heroku** (Easiest)
2. **AWS EC2** (More control)
3. **DigitalOcean** (Good balance)
4. **Railway** (Modern, easy)

**Recommended: Railway or Heroku for MVP**

**Deployment Steps (Railway)**:

1. **Prepare Backend**:
```bash
# Add Procfile
web: node server.js

# Add start script to package.json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

2. **Environment Variables**:
```
NODE_ENV=production
DATABASE_URL=mongodb://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_live_...
CLOUDINARY_URL=cloudinary://...
TWILIO_SID=...
TWILIO_TOKEN=...
```

3. **Deploy**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to project
railway link

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=mongodb://...
```

4. **Set Up MongoDB Atlas**:
- Create cluster at mongodb.com/cloud/atlas
- Whitelist all IPs (0.0.0.0/0) for production
- Get connection string
- Add to environment variables

5. **Configure Domain**:
```bash
# Add custom domain
railway domain add api.alonix.app
```

**Action Items**:
- [ ] Choose hosting provider
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Deploy backend to production
- [ ] Set up custom domain
- [ ] Configure SSL certificate
- [ ] Set up monitoring (UptimeRobot)
- [ ] Configure logging (Papertrail)
- [ ] Set up backups
- [ ] Test production API

---

### Step 8.2: Mobile App Build & Submission (Day 38-40)

**iOS Preparation**:

1. **Apple Developer Account**:
- Sign up at developer.apple.com ($99/year)
- Create App ID
- Create provisioning profiles

2. **App Store Assets**:
- App icon (1024x1024)
- Screenshots (all required sizes)
- App description
- Keywords
- Privacy policy URL
- Support URL

3. **Build Configuration**:
```json
// app.json
{
  "expo": {
    "name": "Alonix",
    "slug": "alonix-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.alonix.mobile",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to track activities and show nearby events",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "We need your location to track activities even when the app is in the background",
        "NSCameraUsageDescription": "We need camera access to take activity photos",
        "NSPhotoLibraryUsageDescription": "We need photo library access to upload activity photos"
      }
    }
  }
}
```

**Android Preparation**:

1. **Google Play Console**:
- Sign up at play.google.com/console ($25 one-time)
- Create app
- Fill store listing

2. **App Store Assets**:
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (phone, tablet, 7-inch tablet)
- App description
- Privacy policy URL

3. **Build Configuration**:
```json
// app.json
{
  "expo": {
    "android": {
      "package": "com.alonix.mobile",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4F46E5"
      }
    }
  }
}
```

**Build Process with EAS**:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

**Action Items**:
- [ ] Create Apple Developer account
- [ ] Create Google Play Console account
- [ ] Prepare app assets (icon, screenshots, descriptions)
- [ ] Configure app.json for production
- [ ] Build iOS app with EAS
- [ ] Build Android app with EAS
- [ ] Test builds on devices
- [ ] Submit iOS app for review
- [ ] Submit Android app for review
- [ ] Monitor review status

---

### Step 8.3: Final Testing & Launch (Day 40-42)

**Pre-Launch Checklist**:

**Functionality**:
- [ ] All core features working
- [ ] No critical bugs
- [ ] Payment processing tested
- [ ] Push notifications working
- [ ] GPS tracking accurate
- [ ] Emergency features functional

**Performance**:
- [ ] App launches in < 3 seconds
- [ ] Smooth scrolling (60fps)
- [ ] Images load quickly
- [ ] No memory leaks
- [ ] Battery usage acceptable

**User Experience**:
- [ ] Onboarding flow complete
- [ ] Empty states implemented
- [ ] Loading states everywhere
- [ ] Error messages user-friendly
- [ ] Offline mode graceful

**Legal & Compliance**:
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] GDPR compliance (if applicable)
- [ ] Data deletion process
- [ ] Cookie policy

**Marketing Materials**:
- [ ] App website created
- [ ] Demo video created
- [ ] Press kit prepared
- [ ] Social media accounts set up
- [ ] Launch announcement prepared

**Beta Testing**:

1. **TestFlight (iOS)**:
```bash
# Add beta testers in App Store Connect
# Distribute build via TestFlight
eas build --platform ios --profile preview
```

2. **Google Play Internal Testing (Android)**:
- Upload APK to internal testing track
- Add testers by email
- Send invitation link

3. **Feedback Collection**:
- Use in-app feedback form
- Monitor crash reports
- Track user behavior analytics
- Conduct user interviews

**Launch Day**:

1. **Morning**:
- [ ] Final production check
- [ ] Monitor server status
- [ ] Prepare support team

2. **Launch**:
- [ ] Release app from staged rollout
- [ ] Post launch announcement
- [ ] Share on social media
- [ ] Email early subscribers
- [ ] Submit to product directories

3. **Post-Launch Monitoring**:
- [ ] Monitor crash reports
- [ ] Watch server metrics
- [ ] Respond to user reviews
- [ ] Track download numbers
- [ ] Monitor support requests

**Action Items**:
- [ ] Complete pre-launch checklist
- [ ] Set up beta testing
- [ ] Collect and address beta feedback
- [ ] Create marketing materials
- [ ] Prepare support documentation
- [ ] Set up analytics (Mixpanel, Amplitude)
- [ ] Set up crash reporting (Sentry)
- [ ] Launch to production
- [ ] Monitor initial user feedback
- [ ] Plan first update

---

## SUMMARY & TIMELINE

### Week-by-Week Breakdown:

**Week 1**: Backend Foundation
- Backend setup & database design
- Authentication system
- Image upload service

**Week 2**: Core Activity Features
- Activity creation API
- Activity discovery & filtering
- Activity detail enhancement

**Week 3**: Real-Time GPS Tracking
- WebSocket setup
- Live activity tracking
- Activity session history

**Week 4**: Cost Sharing & Payments
- Payment gateway integration
- Booking system completion
- Organizer services & contribution fees

**Week 5**: Safety Features
- Emergency SOS system
- Health monitoring & safety checks

**Week 6**: Social Features & Clubs
- Activity feed with real data
- Club formation automation
- Push notifications system

**Week 7**: Testing & Polish
- End-to-end testing
- Bug fixes & error handling
- Performance optimization

**Week 8**: Deployment & Launch
- Backend deployment
- Mobile app build & submission
- Final testing & launch

---

## MAINTENANCE & NEXT STEPS

### Post-Launch (Week 9+):

**Immediate (First Month)**:
- Monitor and fix critical bugs
- Respond to user feedback
- Optimize based on usage patterns
- Add missing features from user requests

**Short-Term (Months 2-3)**:
- Implement Phase 2 features (WhatsApp bot booking)
- Add more payment methods
- Improve matching algorithms
- Enhanced analytics dashboard

**Medium-Term (Months 4-6)**:
- Vehicle rental integration
- Advanced gamification
- Social media integration
- Marketing campaigns

**Long-Term (6+ months)**:
- International expansion
- AI-powered recommendations
- Wearable device integration
- B2B features for tour operators

---

## SUCCESS METRICS

Track these KPIs post-launch:

**User Acquisition**:
- Daily active users (DAU)
- Monthly active users (MAU)
- Download numbers
- User retention (Day 1, Day 7, Day 30)

**Engagement**:
- Activities created per day
- Activities joined per day
- Average session duration
- GPS tracking usage rate

**Revenue** (if applicable):
- Transaction volume
- Average booking value
- Payment success rate
- Revenue per user

**Safety**:
- SOS alerts triggered
- Response time to emergencies
- Safety incidents reported
- User satisfaction with safety features

**Technical**:
- App crash rate (< 1%)
- API response time (< 500ms)
- GPS accuracy
- Server uptime (> 99.9%)

---

## RESOURCES NEEDED

### Team (Minimum for 8-week timeline):

1. **Full-Stack Developer** (1-2): Backend + mobile integration
2. **Mobile Developer** (1): React Native focus
3. **Backend Developer** (1): Node.js/database expert
4. **QA Tester** (1): Manual + automated testing
5. **UI/UX Designer** (0.5): Final polish and assets
6. **Project Manager** (0.5): Timeline management

**OR**

1. **Senior Full-Stack Developer** (You + 1 more): Handle everything

### Budget Estimates:

**Development** (if hiring):
- Full-stack developers: $5,000-10,000/month × 2 months = $10,000-20,000
- QA Tester: $3,000/month × 1 month = $3,000
- Total: $13,000-23,000

**Services** (Monthly):
- Backend hosting: $50-200/month
- Database (MongoDB Atlas): $0-50/month (free tier works for MVP)
- Push notifications: Free (Expo)
- Payment processing: 2.9% + $0.30 per transaction
- SMS (Twilio): $0.0075 per message
- Image hosting (Cloudinary): Free tier (25GB)
- Total: ~$100-300/month

**One-Time Costs**:
- Apple Developer Program: $99/year
- Google Play Console: $25 one-time
- Domain name: $10-15/year
- SSL certificate: Free (Let's Encrypt)
- Total: ~$140

**Grand Total for MVP**: $13,000-23,000 development + $1,500/year services

---

## CONCLUSION

This execution plan provides a comprehensive roadmap to transform the Alonix prototype from a UI-focused demo into a fully functional Phase 1 application. The 8-week timeline is aggressive but achievable with focused effort.

**Key Success Factors**:
1. Start with backend foundation (don't skip this)
2. Prioritize safety features - they're the core differentiator
3. Test extensively with real users before launch
4. Iterate based on feedback
5. Don't over-engineer - ship MVP first

**Remember**: The goal is to launch a functional MVP, not a perfect product. You can always add features and improvements based on real user feedback post-launch.

Good luck! 🚀
