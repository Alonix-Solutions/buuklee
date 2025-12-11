# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Alonix** is a social fitness and tourism platform connecting people for outdoor activities with real-time GPS tracking, cost-sharing, and safety features. The project is a **monorepo** containing:

- **alonix-backend/** - Node.js/Express REST API + Socket.IO real-time server
- **alonix-mobile/** - React Native (Expo SDK 54) mobile application

**Current Status**: Backend-integrated MVP (50% complete). Backend is fully functional and tested. Mobile app has complete UI with ongoing backend integration.

## Monorepo Structure

```
buuklee/
├── alonix-backend/           # Node.js backend
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth, validation, error handling
│   ├── socket/              # Socket.IO handlers
│   ├── server.js            # Entry point
│   └── package.json
│
├── alonix-mobile/           # React Native mobile app
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API integration & business logic
│   │   ├── navigation/     # React Navigation config
│   │   └── constants/      # Theme, colors, sizes
│   ├── App.js
│   └── package.json
│
├── IMPLEMENTATION_STATUS.md      # Backend completion status
├── INTEGRATION_COMPLETE.md       # Frontend integration status
├── FRONTEND_BACKEND_INTEGRATION_COMPLETE.md
└── CLAUDE.md                     # This file
```

**Important**: Each subdirectory has its own detailed CLAUDE.md file:
- `alonix-backend/README.md` - Backend API reference and setup
- `alonix-mobile/CLAUDE.md` - Mobile app architecture and patterns

## Common Commands

### Running the Full Stack

**1. Start Backend Server (Required First)**:
```bash
cd alonix-backend
npm install        # First time only
npm run dev        # Development with auto-reload
# Server runs on http://localhost:3000
```

**2. Start Mobile App**:
```bash
cd alonix-mobile
npm install        # First time only
npm start          # Start Expo dev server
# Press 'a' for Android, 'i' for iOS (macOS only)
```

**3. Configure Mobile → Backend Connection**:

Edit `alonix-mobile/src/config/api.js`:
```javascript
// Find your computer's IP address:
// Windows: ipconfig
// macOS/Linux: ifconfig or ip addr

export const API_BASE_URL = 'http://YOUR_IP:3000/api';
export const SOCKET_URL = 'http://YOUR_IP:3000';
```

### Testing the Backend

```bash
# Health check
curl http://localhost:3000/health

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pascal@alonix.com","password":"Test123"}'

# Test user credentials
# Email: pascal@alonix.com
# Password: Test123
```

### Building for Production

**Backend Deployment**:
```bash
cd alonix-backend
npm start  # Production mode
```

**Mobile App Build** (with EAS):
```bash
cd alonix-mobile
npm install -g eas-cli
eas login
eas build --platform android  # or ios
eas submit --platform android  # Submit to store
```

## Architecture Overview

### High-Level Data Flow

```
Mobile App (React Native)
    ↕ HTTP Requests (REST API)
    ↕ WebSocket (Socket.IO - real-time tracking)
Backend (Express + MongoDB)
    ↕
MongoDB Atlas (Cloud Database)
```

### Backend Technology Stack

- **Framework**: Express.js (Node.js)
- **Database**: MongoDB Atlas with Mongoose ORM
- **Authentication**: JWT tokens (jsonwebtoken + bcrypt)
- **Real-time**: Socket.IO for live GPS tracking
- **File Storage**: Cloudinary (images)
- **Payments**: Stripe integration
- **Push Notifications**: Expo Server SDK
- **Security**: CORS, rate limiting, input validation (express-validator)

### Mobile Technology Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation v6 (Stack + Tab navigators)
- **State Management**: React Context API (5 main contexts)
- **Maps**: react-native-maps
- **Location**: expo-location
- **Real-time**: socket.io-client
- **Storage**: AsyncStorage

### Key Design Principles

**1. Safety-First Architecture**
- Real-time GPS tracking is mission-critical
- Health monitoring and distress detection
- Emergency SOS with instant broadcast
- Reliability and accuracy > UI polish

**2. Schema-Based Multi-Tenancy** (Mentioned in old EDMS context, not applicable here)
- This project uses standard single-database architecture
- Ignore multi-tenancy references in old documentation

**3. Backend-First Development**
- All features integrate with real backend APIs
- Mock data is legacy - new features use services
- Consistent error handling and loading states

## Core Feature Areas

### 1. Authentication & User Management
**Backend**: `/api/auth/*`, `/api/users/*`
**Mobile**: `AuthContext.js`, `LoginScreen.js`, `RegisterScreen.js`
- JWT-based authentication with token refresh
- User profiles with stats and achievements
- Follow/unfollow system

### 2. Activity Creation & Discovery
**Backend**: `/api/activities/*`
**Mobile**: `CreateChallengeScreen.js`, `ExploreScreen.js`, `ChallengeDetailScreen.js`
- Create activities with organizer services (transport/accommodation)
- Geospatial queries for nearby activities
- Advanced filtering (type, difficulty, date, location)
- Join/leave functionality with participant tracking

### 3. Real-Time GPS Tracking
**Backend**: Socket.IO events in `socket/socketHandler.js`
**Mobile**: `LiveTrackingScreen.js`, `gpsService.js`, `socketService.js`
- WebSocket connection for live location updates
- Group statistics and leaderboard
- Route recording with pace/distance calculations
- Participant monitoring on map

### 4. Safety & Emergency Features
**Backend**: `/api/sos/*`
**Mobile**: SOS button in `LiveTrackingScreen.js`
- Manual SOS alerts with location broadcast
- Automatic safety monitoring (falling behind, no movement)
- Emergency contact notifications
- Real-time health metrics (heart rate, battery level)

### 5. Booking & Cost-Sharing
**Backend**: `/api/bookings/*`
**Mobile**: `BookingContext.js`, `RideSharingScreen.js`, `PaymentScreen.js`
- Activity-linked bookings (transport, accommodation)
- Organizer-set contribution fees
- Payment processing (Stripe integration)
- Booking confirmation and cancellation

### 6. Clubs & Community
**Backend**: `/api/clubs/*`
**Mobile**: `ClubDetailScreen.js`, `ActivityScreen.js` (feed)
- Club formation from repeated activities
- Club events and member management
- Social feed with likes and comments
- Push notifications for club activities

## Integration Status

### ✅ Backend Fully Implemented (100%)
- Authentication with JWT
- Activity CRUD and filtering
- Real-time tracking with Socket.IO
- SOS emergency system
- User management and follows
- Booking system
- Club system
- Notification system

### 🔄 Mobile Integration In Progress (50%)
**Completed**:
- AuthContext connected to backend
- Base API service with error handling
- Service layer (activityService, clubService, bookingService, socketService)
- Login/Register screens working
- ActivityDetailScreen with join/leave

**In Progress**:
- ActivityScreen feed loading from API
- LiveTrackingScreen Socket.IO integration
- ExploreScreen search/filter
- CreateChallengeScreen activity creation
- NotificationsScreen real notification loading

**Not Started**:
- Payment integration (Stripe/M-Pesa)
- Push notification delivery
- Club formation automation
- Health monitoring integration

See `INTEGRATION_COMPLETE.md` for detailed integration checklist.

## Development Workflow

### Adding a Backend Feature

1. **Create Mongoose model** in `alonix-backend/models/`
2. **Add routes** in `alonix-backend/routes/`
3. **Implement controller logic** with validation
4. **Test with curl** or Postman
5. **Update API documentation** in backend README

### Adding a Mobile Feature

1. **Create service** in `alonix-mobile/src/services/` for API calls
2. **Create/update screen** in `alonix-mobile/src/screens/`
3. **Add navigation** in `AppNavigator.js`
4. **Test with backend running**
5. **Handle loading, error, and empty states**

### Standard Backend Response Format

```javascript
// Success
{
  success: true,
  activities: [...],  // or user, club, booking, etc.
  pagination: { page: 1, limit: 20, total: 100 }
}

// Error
{
  success: false,
  error: "Error message here"
}
```

### Standard Mobile Integration Pattern

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';

const MyScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await activityService.getActivities();
      setData(response.activities || []);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (error) return <ErrorView />;
  if (!data.length) return <EmptyState />;

  return <FlatList data={data} ... />;
};
```

## Testing Strategy

### Backend Testing
```bash
cd alonix-backend
npm run test  # Run Jest tests (when implemented)

# Manual testing
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pascal@alonix.com","password":"Test123"}'
```

### Mobile Testing
1. **Run on physical device** (recommended for GPS/sensors)
2. **Test with backend running** on same network
3. **Check all states**: loading, error, empty, success
4. **Verify real-time updates** work via Socket.IO
5. **Test offline mode** gracefully

### Integration Testing
Run `alonix-mobile/test-integration.js` to verify:
- API connectivity
- Authentication flow
- CRUD operations
- Real-time events

## Common Issues & Solutions

### Backend won't start
```bash
# Check MongoDB is running
mongod --version

# Check port 3000 is available
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000

# Reinstall dependencies
cd alonix-backend
rm -rf node_modules package-lock.json
npm install
```

### Mobile can't connect to backend
1. **Verify backend is running**: `curl http://localhost:3000/health`
2. **Check IP address** in `alonix-mobile/src/config/api.js`
3. **Ensure same WiFi network** for phone and computer
4. **Try tunnel mode**: `npx expo start --tunnel`
5. **Check firewall** not blocking port 3000

### Socket.IO connection issues
- Backend and mobile must use matching Socket.IO versions
- Check `SOCKET_URL` in mobile config matches backend address
- Verify JWT token is being sent in socket authentication
- Monitor backend console for connection logs

### "Objects are not valid as a React child" errors
This typically happens when trying to render objects directly in Text components:
- **Common Cause**: Backend returns location as `{type: "Point", coordinates: [lng, lat]}` but code tries to render entire object
- **Fix**: Extract the specific property or format it as a string:
```javascript
// Wrong:
<Text>{hotel.location}</Text>

// Right:
<Text>
  {typeof hotel.location === 'string'
    ? hotel.location
    : (hotel.location?.address || hotel.location?.name || 'Location')}
</Text>
```
- Check `HotelCard.js`, `RestaurantDetailScreen.js`, `HotelDetailScreen.js` for examples

### GPS tracking errors
- **"gpsService.default.requestPermissions is not a function"**: Missing expo-location import
- **"You must be a participant to view participant data"**: User not added to activity participants array
- Solution: Use `add_participant.js` script or join via API endpoint before accessing tracking data

### Map performance issues
- Maps loading slowly or freezing: Add performance optimizations
  - Set `loadingEnabled={true}` and `cacheEnabled={true}` on MapView
  - Set `tracksViewChanges={false}` on all Markers
  - Make initialization non-blocking for LiveTrackingScreen

### Expo SDK compatibility errors
- This project uses **Expo SDK 54**
- Check package compatibility: https://docs.expo.dev/versions/v54.0.0/
- Don't upgrade packages independently - use Expo's compatibility

## Environment Setup

### Backend Environment Variables

Create `alonix-backend/.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/alonix
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=sk_test_your-key
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Mobile Configuration

No `.env` file needed. Configure in code:
- **API URL**: `src/config/api.js`
- **Google Places API Key**: `src/config/api.js` (for location autocomplete)
- **App config**: `app.json`
- **Theme**: `src/constants/theme.js`

### Google Places API Setup (Optional)

For dynamic location search in UberStyleRideScreen:

1. **Get API Key**: Visit https://console.cloud.google.com/apis/credentials
2. **Enable APIs**: Places API, Geocoding API
3. **Add Key** to `alonix-mobile/src/config/api.js`:
```javascript
export const GOOGLE_PLACES_API_KEY = 'YOUR_API_KEY_HERE';
```

**Note**: If not configured, the app falls back to local Mauritius location search

## Project Roadmap

See `alonix-mobile/EXECUTION_PLAN.md` for detailed 8-week roadmap.

**Phase 1 (Current)**: Activity-centric platform with real-time tracking
**Phase 2 (Future)**: Independent service booking via WhatsApp bot

## Related Documentation

### Backend
- `alonix-backend/README.md` - Complete API reference
- `alonix-backend/TESTING.md` - Testing guide with curl examples
- `IMPLEMENTATION_STATUS.md` - Backend completion checklist

### Mobile
- `alonix-mobile/CLAUDE.md` - Detailed mobile architecture
- `alonix-mobile/EXECUTION_PLAN.md` - 8-week development plan
- `alonix-mobile/INTEGRATION_GUIDE.md` - Step-by-step integration
- `INTEGRATION_COMPLETE.md` - Integration progress tracker

### Old Project Context (IGNORE)
- References to "EDMS" (Electronic Document Management System) are from previous project in this directory
- References to multi-tenancy, Maupass authentication, department schemas are NOT relevant to Alonix
- Focus on Alonix-specific documentation files listed above

## Key Technical Decisions

### Why Monorepo?
Keeps backend and mobile in sync during rapid development. Shared documentation and easier context switching.

### Why Expo?
- Cross-platform (iOS + Android) from single codebase
- Over-the-air updates without app store submission
- Built-in modules for GPS, camera, notifications
- Easy build process with EAS

### Why MongoDB?
- Flexible schema for rapid iteration
- Excellent geospatial queries (finding nearby activities)
- Scales well with real-time location data
- MongoDB Atlas provides free tier for MVP

### Why Socket.IO?
- Real-time bidirectional communication
- Automatic reconnection handling
- Room-based broadcasts (activity groups)
- Works across platforms (web, mobile)

### Why Context API (not Redux)?
- Simpler for MVP-stage development
- Less boilerplate than Redux
- Sufficient for current app complexity
- Can migrate to Redux/Zustand later if needed

## Performance Considerations

### Backend
- Database indexes on frequent queries (activity type, date, location)
- Geospatial indexes for proximity searches
- Rate limiting (100 req/15min)
- JWT token expiry (24hr) with refresh tokens (30 days)

### Mobile
- FlatList for long lists with proper keys
- Image optimization and lazy loading
- Debounced search inputs
- Memoization for expensive calculations
- Background location tracking optimized for battery

### Real-Time Tracking
- Location updates throttled to 3-5 seconds (not every GPS update)
- Batch socket events when possible
- Compress location data before sending
- Use markers instead of polylines for participant display

## Security Best Practices

### Backend
- Password hashing with bcrypt (10 rounds)
- JWT secrets stored in environment variables
- Input validation on all endpoints (express-validator)
- CORS configured for mobile app origin
- Rate limiting to prevent abuse
- SQL injection prevention (Mongoose parameterized queries)

### Mobile
- Never store passwords in plain text
- JWT tokens in AsyncStorage (encrypted on iOS)
- Validate all user inputs before sending
- Handle sensitive data (location) with user permission
- HTTPS only for production API calls

## Deployment Checklist

### Backend Production
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set (no hardcoded secrets)
- [ ] HTTPS/SSL certificate configured
- [ ] CORS updated for production mobile app
- [ ] Cloudinary account configured
- [ ] Stripe production keys
- [ ] Error logging (Sentry or similar)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database backups automated

### Mobile Production
- [ ] Apple Developer account ($99/year)
- [ ] Google Play Console account ($25 one-time)
- [ ] App icons and screenshots prepared
- [ ] Privacy policy URL added
- [ ] Backend API URL updated to production
- [ ] Build with EAS: `eas build --platform all`
- [ ] Submit to stores: `eas submit --platform all`
- [ ] Beta testing via TestFlight (iOS) and Internal Testing (Android)

## Support & Debugging

### Useful Logs

**Backend logs**:
```bash
cd alonix-backend
npm run dev
# Watch console for API requests, errors, socket events
```

**Mobile logs**:
```bash
cd alonix-mobile
npm start
# Press 'j' to open debugger
# Use React Developer Tools in Chrome
```

### Common Debug Commands

```bash
# Clear Expo cache
npx expo start -c

# Clear React Native cache
npx react-native start --reset-cache

# Check backend health
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pascal@alonix.com","password":"Test123"}'

# Monitor MongoDB
mongosh  # MongoDB shell
use alonix
db.users.find()
db.activities.find()
```

### Getting Help

1. Check existing documentation files listed above
2. Review integration status files for current progress
3. Check backend logs for API errors
4. Use Chrome DevTools for mobile debugging
5. Verify backend is running before testing mobile features
