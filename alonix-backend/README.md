# Alonix Backend API

Backend server for Alonix - A social fitness and activity platform that connects people for outdoor activities with real-time GPS tracking and safety features.

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed
- MongoDB installed locally OR MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB** (if running locally):
```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

4. **Run the server**:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

### Verify Installation

Check the health endpoint:
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-08T...",
  "uptime": 1.234,
  "environment": "development"
}
```

## 📁 Project Structure

```
alonix-backend/
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Activity.js
│   ├── ActivitySession.js
│   ├── Club.js
│   ├── Booking.js
│   ├── Notification.js
│   └── SOSAlert.js
├── routes/              # API routes
│   ├── auth.js
│   ├── users.js
│   ├── activities.js
│   ├── bookings.js
│   ├── clubs.js
│   ├── notifications.js
│   ├── sos.js
│   └── upload.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── socket/              # WebSocket handlers
│   └── socketHandler.js
├── utils/               # Utility functions
│   ├── jwt.js
│   ├── cloudinary.js
│   ├── stripe.js
│   └── notifications.js
├── config/              # Configuration files
│   └── database.js
├── server.js            # Main entry point
├── package.json
├── .env.example
└── README.md
```

## 🔑 Environment Variables

### Required Variables

Create a `.env` file based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/alonix

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=24h

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your-key

# Twilio (for SMS alerts)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Getting API Keys

**MongoDB Atlas** (Free tier):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

**Cloudinary** (Free tier):
1. Sign up at https://cloudinary.com
2. Get Cloud Name, API Key, API Secret from dashboard
3. Add to `.env`

**Stripe** (Test mode):
1. Sign up at https://stripe.com
2. Get test API key from dashboard
3. Add to `.env`

**Twilio** (For SMS - optional for MVP):
1. Sign up at https://twilio.com
2. Get Account SID, Auth Token, Phone Number
3. Add to `.env`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/refresh-token   # Refresh JWT token
POST   /api/auth/forgot-password # Request password reset
POST   /api/auth/reset-password  # Reset password
GET    /api/auth/me              # Get current user
```

### Users
```
GET    /api/users/:id            # Get user profile
PUT    /api/users/:id            # Update user profile
POST   /api/users/:id/follow     # Follow user
DELETE /api/users/:id/follow     # Unfollow user
POST   /api/users/push-token     # Register push notification token
```

### Activities
```
POST   /api/activities           # Create activity
GET    /api/activities           # List activities (with filters)
GET    /api/activities/:id       # Get activity details
PUT    /api/activities/:id       # Update activity
DELETE /api/activities/:id       # Delete activity
POST   /api/activities/:id/join  # Join activity
POST   /api/activities/:id/leave # Leave activity
GET    /api/activities/nearby    # Find nearby activities
POST   /api/activities/:id/start-session   # Start live tracking
POST   /api/activities/:id/end-session     # End live tracking
```

### Real-Time (WebSocket)
```
connect                          # Connect to WebSocket
authenticate                     # Authenticate with JWT
join-activity                    # Join activity room
location-update                  # Send location update
sos-alert                        # Trigger emergency alert
```

### Bookings
```
POST   /api/bookings             # Create booking
GET    /api/bookings/:id         # Get booking details
PUT    /api/bookings/:id/cancel  # Cancel booking
GET    /api/bookings/user/:id    # User's bookings
```

### Clubs
```
POST   /api/clubs                # Create club
GET    /api/clubs/:id            # Get club details
POST   /api/clubs/:id/join       # Join club
POST   /api/clubs/:id/leave      # Leave club
GET    /api/clubs/:id/members    # Get club members
POST   /api/clubs/:id/events     # Create club event
```

### SOS/Emergency
```
POST   /api/sos/alert            # Trigger SOS alert
GET    /api/sos/active           # Get active alerts
POST   /api/sos/:id/respond      # Respond to alert
POST   /api/sos/:id/resolve      # Resolve alert
```

### Image Upload
```
POST   /api/upload/profile-photo # Upload profile photo
POST   /api/upload/activity-photo # Upload activity photo
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register/Login Flow:

1. **Register**: `POST /api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

2. **Use Token**: Add to Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

3. **Protected Routes**: All routes except `/auth/*` and `/health` require authentication.

## 📱 WebSocket Events

### Client → Server

**Authenticate**:
```javascript
socket.emit('authenticate', { token: 'your-jwt-token' });
```

**Join Activity Room**:
```javascript
socket.emit('join-activity', {
  activityId: '...',
  userId: '...'
});
```

**Send Location Update**:
```javascript
socket.emit('location-update', {
  activityId: '...',
  userId: '...',
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  stats: {
    distance: 1234, // meters
    speed: 5.2, // m/s
    pace: 320, // seconds per km
    elevation: 100, // meters
    heartRate: 145 // bpm (optional)
  }
});
```

**Trigger SOS**:
```javascript
socket.emit('sos-alert', {
  activityId: '...',
  userId: '...',
  location: { ... },
  reason: 'Emergency'
});
```

### Server → Client

**Participant Location Update**:
```javascript
socket.on('participant-location', (data) => {
  // data: { userId, location, stats, timestamp }
});
```

**Emergency Alert**:
```javascript
socket.on('emergency-alert', (data) => {
  // data: { alertId, userId, userName, location, reason }
});
```

**Safety Alert**:
```javascript
socket.on('safety-alert', (data) => {
  // data: { userId, userName, alert, location }
});
```

## 🧪 Testing

### Manual Testing with curl

**Health check**:
```bash
curl http://localhost:3000/health
```

**Register user**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Create Activity** (requires token):
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Hike Le Morne",
    "description": "Morning hike up Le Morne mountain",
    "activityType": "hiking",
    "difficulty": "hard",
    "date": "2025-12-15T06:00:00Z",
    "maxParticipants": 10,
    "meetingPoint": {
      "address": "Le Morne Beach, Mauritius",
      "coordinates": [57.3246, -20.4524]
    }
  }'
```

### Testing WebSocket

Use a tool like **Socket.IO Client** or test in browser console:

```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected');

  // Authenticate
  socket.emit('authenticate', { token: 'your-jwt-token' });

  // Join activity
  socket.emit('join-activity', {
    activityId: 'activity-id',
    userId: 'user-id'
  });

  // Listen for updates
  socket.on('participant-location', (data) => {
    console.log('Location update:', data);
  });
});
```

## 🚨 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "... (only in development mode)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (no permission)
- `404`: Not Found
- `500`: Internal Server Error

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication with token expiration
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation and sanitization
- Geospatial query protection
- Environment variable protection

## 📊 Database Schema

### Key Collections:

**users**: User accounts and profiles
**activities**: Fitness activities/challenges
**activity_sessions**: Live tracking sessions
**clubs**: User clubs
**bookings**: Service bookings
**notifications**: Push notifications
**sos_alerts**: Emergency alerts

See `models/` directory for complete schemas.

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection error: connect ECONNREFUSED
```
**Solution**: Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change `PORT` in `.env` or kill process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### JWT Secret Error
```
Error: JWT secret not configured
```
**Solution**: Set `JWT_SECRET` in `.env` file:
```env
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

## 📈 Next Steps

1. ✅ Backend setup complete
2. ⏳ Implement remaining routes (see `routes/` directory)
3. ⏳ Connect mobile app to backend
4. ⏳ Test real-time tracking
5. ⏳ Deploy to production

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [JWT Documentation](https://jwt.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📝 License

Proprietary - All rights reserved
