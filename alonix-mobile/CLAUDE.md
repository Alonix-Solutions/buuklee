# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alonix is a React Native mobile application built with Expo SDK 54. It's a social-first fitness and tourism platform that connects people to explore and perform outdoor activities together—from cycling around Mauritius to hiking Le Morne or multi-day adventure trips.

**Current Status**: Backend-integrated MVP (50% complete). The backend API is fully functional and running. Mobile app has complete UI with ongoing backend integration.

**Core Philosophy**: "Move Together, Save Together"

### The Problem We're Solving

Many outdoor activities and adventures require:
- Finding like-minded participants (many trails/camping require minimum group sizes)
- Coordinating logistics (transport, accommodation, costs)
- Ensuring safety during activities (especially for families and groups)
- Post-activity community building

Alonix addresses all these needs by combining activity matching, real-time tracking, cost-sharing, and community features in one platform.

### Core User Journey

1. **Discovery**: Users browse or create activities (cycling trips, hikes, multi-day adventures)
2. **Matching**: Participants join activities and meet adventure partners
3. **Planning**: Organizers set requirements (contribution fees, transport, accommodation)
4. **Real-Time Tracking**: During activities, everyone sees live locations, distances, speed, and health metrics
5. **Safety Monitoring**: Group members can monitor each other (parents tracking kids, checking on those falling behind)
6. **Community**: Post-activity groups can convert into clubs for future events

### Phase 1 (Current): Activity-Centric Platform
- Users create or join activities/challenges
- Real-time GPS tracking during activities with collective statistics
- Cost-sharing for transport and accommodation tied to activities
- Safety features: live location, distance, speed, phone-derived health data
- Club formation from successful group activities

**Phase 1 Recent Implementations** (Dec 2024):
1. ✅ **Activity Completion & Winner Detection**: Podium display, leaderboard, 5-star rating, personal stats
2. ✅ **Transport Integration**: Organizers can offer car seats, participants see ride options, taxi booking from activity
3. ✅ **Interactive Map Point Picker**: Select meeting/start/finish points on map with draggable markers
4. ✅ **Accommodation Integration**: Show nearby hotels, WhatsApp booking, roommate matching with cost-split calculator

### Phase 2 (Future): Independent Service Booking
- Book hotels, restaurants, taxis, attractions **without joining activities**
- Lightweight booking via WhatsApp bot (no heavy forms/UI)
- Vehicle rentals (bikes, cars for supplies) directly through platform
- Organizers can offer their own services (transport, accommodation) with custom pricing

### Safety-First Design Principle

**Critical**: Safety is a core feature, not an add-on. Every development decision should consider:
- Real-time location visibility for all participants
- Health metrics monitoring (heart rate, etc. from phone sensors)
- Quick identification of participants falling behind or in distress
- Easy communication during activities
- Emergency contact features

When building features, always ask: "How does this keep participants safe during activities?"

## Build & Development Commands

### Starting the App
```bash
# Start Expo development server
npm start
# or
expo start

# Clear cache and start fresh
npx expo start -c

# Start in tunnel mode (for network issues)
npx expo start --tunnel

# Platform-specific launches
npm run android    # Launch on Android
npm run ios        # Launch on iOS (macOS only)
npm run web        # Launch web version
```

### Installation
```bash
# Install dependencies
npm install

# If encountering issues, clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Testing on Devices
- **Physical Device**: Use Expo Go app (iOS/Android), scan QR code
- **iOS Simulator**: Press 'i' in terminal (requires macOS + Xcode)
- **Android Emulator**: Press 'a' in terminal (requires Android Studio)

### Backend Connection Setup

**IMPORTANT**: Before testing integrated features, ensure the backend is running:

1. **Start Backend Server**:
```bash
cd ../alonix-backend
npm run dev
# Backend runs on port 3000
```

2. **Configure API URL** in `src/config/api.js`:
```javascript
// For physical devices or tunneling:
export const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
export const SOCKET_URL = 'http://YOUR_COMPUTER_IP:3000';

// For Android emulator:
export const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For iOS simulator:
export const API_BASE_URL = 'http://localhost:3000/api';
```

3. **Find Your IP Address**:
   - Windows: `ipconfig` (look for IPv4)
   - macOS/Linux: `ifconfig` or `ip addr`

4. **Test Connection**:
   - Try logging in with test credentials
   - Backend credentials: pascal@alonix.com / Test123

## Architecture Overview

### Navigation Structure

The app uses a **hybrid navigation pattern** with React Navigation v6:
- **Root Level**: Authentication-gated routing (AuthNavigator vs MainTabNavigator)
- **Main Level**: Bottom Tab Navigator with 5 tabs
- **Tab Level**: Each tab has its own Stack Navigator for deep navigation

```
App
├── AuthProvider (wraps entire app)
├── NotificationsProvider
├── MessagesProvider
├── BookingProvider
└── SocialProvider
    └── NavigationContainer
        └── AppNavigator
            ├── AuthNavigator (when not authenticated)
            │   ├── LoginScreen
            │   ├── RegisterScreen
            │   └── ForgotPasswordScreen
            └── MainTabNavigator (when authenticated)
                ├── Home Tab (HomeStack)
                ├── Explore Tab (ExploreStack)
                ├── Messages Tab (MessagesStack)
                ├── Activity Tab (ActivityStack)
                └── Profile Tab (ProfileStack)
```

### Context-Based State Management

The app uses **React Context API** for global state. Five main contexts wrap the app in `App.js`:

1. **AuthContext** (`src/context/AuthContext.js`)
   - User authentication state (login/logout)
   - Session persistence with AsyncStorage
   - Exposes: `isAuthenticated`, `user`, `login()`, `logout()`

2. **NotificationsContext** (`src/context/NotificationsContext.js`)
   - Notification state and unread counts
   - Notification actions (mark as read, clear)
   - Exposes: `notifications`, `unreadCount`, `markAsRead()`

3. **MessagesContext** (`src/context/MessagesContext.js`)
   - Chat conversations and messages
   - Unread message tracking
   - Exposes: `conversations`, `totalUnreadCount`, `sendMessage()`

4. **BookingContext** (`src/context/BookingContext.js`)
   - Booking state management (hotels, cars, drivers, challenges)
   - Payment processing
   - Exposes: `bookings`, `createBooking()`, `cancelBooking()`

5. **SocialContext** (`src/context/SocialContext.js`)
   - Social interactions (likes, comments, follows)
   - Activity feed
   - Exposes: `posts`, `likePost()`, `commentPost()`, `followUser()`

**Important**: When adding new global state, prefer creating a new context over expanding existing ones. Keep contexts focused on single concerns.

### Service Layer Pattern

Business logic is separated into service files under `src/services/`:

**Core Backend Integration Services** (connected to real API):
- **api.js**: Base HTTP client with authentication, error handling, token management
- **activityService.js**: All activity endpoints (create, join, discover, track)
- **clubService.js**: Club management and membership operations
- **bookingService.js**: Booking creation, cancellation, payment integration
- **notificationService.js**: Push notification registration and handling
- **socketService.js**: Real-time WebSocket communication (Socket.IO)
- **whatsappService.js**: WhatsApp deep linking for external bookings

**Utility Services**:
- **gpsService.js**: Location tracking, route calculation, distance/pace computation
- **paymentService.js**: Payment processing integration
- **imageService.js**: Image selection, compression, upload preparation
- **ChatService.js**: Real-time chat functionality
- **PushNotificationService.js**: Advanced notification handling
- **SocialShareService.js**: Multi-platform social sharing

**Pattern**: Services should be pure functions/classes without React dependencies. Backend integration services use the base `api.js` client for all HTTP requests.

**Example Service Usage**:
```javascript
import activityService from '../services/activityService';

// In a component
const loadActivities = async () => {
  try {
    const response = await activityService.getActivities({
      type: 'hiking',
      difficulty: 'medium'
    });
    setActivities(response.activities);
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Key Navigation Patterns

1. **Cross-Tab Navigation**: Use `navigation.navigate('TabName', { screen: 'ScreenName' })` to navigate to screens in other tabs
   ```javascript
   navigation.navigate('Home', { screen: 'ChallengeDetail', params: { id: 123 } });
   ```

2. **Screen Reuse**: Screens like `ChallengeDetailScreen`, `LiveTrackingScreen`, `ActivityDetailScreen` are registered in multiple stacks to be accessible from different tabs

3. **Header Control**: Many detail screens use `headerShown: false` for custom headers or immersive experiences (maps, tracking)

### Design System (`src/constants/theme.js`)

The app follows a consistent design system exported from `theme.js`:

- **COLORS**: Primary (#4F46E5 indigo), Secondary (#FC5200 Strava orange), activity-specific colors
- **SIZES**: Font sizes (xs to xxxl), spacing (padding/margin), component dimensions
- **SHADOWS**: Predefined shadow styles (small, medium, large)
- **ACTIVITY_ICONS**: Emoji icons for activity types
- **DIFFICULTY_LABELS**: Standard difficulty naming

**Rule**: Always import and use these constants instead of hardcoding colors/sizes:
```javascript
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
```

## Recent Feature Implementations (Phase 1)

### 1. Activity Completion & Winner Screen
**Files**: `ActivityCompletionScreen.js`, `ActivityResultsScreen.js`
**Registered in**: `AppNavigator.js` (HomeStack, ExploreStack, ActivityStack)

**Features**:
- **Personal Results View** (ActivityCompletionScreen):
  - Rank badge with podium colors (🥇 Gold, 🥈 Silver, 🥉 Bronze)
  - Stats grid: Distance, Time, Avg Pace, Calories
  - 5-star rating system with haptic feedback
  - Share results to social media
  - Celebration animation on load

- **Organizer Results View** (ActivityResultsScreen):
  - Podium display for top 3 winners
  - Full sortable leaderboard (by rank, time, distance)
  - Winner badges and achievements
  - Share leaderboard functionality

**Navigation**:
```javascript
// From LiveTrackingScreen after activity ends:
navigation.replace('ActivityCompletion', { activityId, sessionId });

// Organizer view:
navigation.replace('ActivityResults', { activityId, sessionId });
```

**Backend Methods** (activityService.js):
- `getSessionResults(sessionId)` - Fetch activity results with participant stats
- `rateActivity(activityId, rating, feedback)` - Submit activity rating

### 2. Transport Integration
**Files Modified**: `CreateChallengeScreen.js`, `ActivityDetailScreen.js`

**Create Activity - Offer Transport**:
- Toggle "I can offer rides"
- Input number of available seats
- Set price per seat (or leave free)
- Data included in activity creation payload:
```javascript
{
  organizerServices: {
    transport: {
      available: true,
      seats: 4,
      pricePerSeat: 500,
      currency: 'MUR'
    }
  }
}
```

**Activity Detail - View Transport**:
- Shows organizer's ride offer (if available) with seat count and price
- "Book Taxi" button - opens taxi booking to activity meeting point
- "Offer Ride" button - participants can also offer rides
- Displays seat availability and booking status

**UI Components**:
```javascript
// Transport section in ActivityDetailScreen
<View style={styles.transportSection}>
  {activity.organizerServices?.transport?.available && (
    <OrganizerRideCard />
  )}
  <BookTaxiButton />
  <OfferRideButton />
</View>
```

### 3. Interactive Map Point Picker
**Files**: `MapPointPicker.js` (new component), `CreateChallengeScreen.js`

**MapPointPicker Component**:
- Full-screen map with draggable marker
- Search bar for location lookup
- Address input field (manual entry)
- Confirm button with selected coordinates
- Helper text with instructions
- Used for Meeting Point, Start Point, Finish Point

**CreateChallengeScreen Integration**:
- Three modal instances for each point type
- "Select Meeting Point" button opens map picker
- "Select Start Point" with "Same as meeting point" toggle
- "Select Finish Point" button
- Displays selected coordinates and address
- Payload includes `meetingPoint`, `startPoint`, `finishPoint` with `{latitude, longitude}` format

**Usage Pattern**:
```javascript
const [selectedPoint, setSelectedPoint] = useState(null);
const [showMapPicker, setShowMapPicker] = useState(false);

<TouchableOpacity onPress={() => setShowMapPicker(true)}>
  <Text>Select Point on Map</Text>
</TouchableOpacity>

<Modal visible={showMapPicker}>
  <MapPointPicker
    initialLocation={selectedPoint}
    onConfirm={(location) => {
      setSelectedPoint(location);
      setShowMapPicker(false);
    }}
    onCancel={() => setShowMapPicker(false)}
  />
</Modal>
```

### 4. Accommodation Integration
**Files Modified**: `ActivityDetailScreen.js`

**Features**:
- Shows 2 nearby hotels with images, names, ratings
- "Book via WhatsApp" button - opens WhatsApp with pre-filled message including:
  - Hotel name
  - Activity name
  - User details
  - Booking reference
- Roommate matching card showing other participants looking for roommates
- Cost-split calculator displaying savings (e.g., "Save 50%")
- "I'm looking for roommate" button to join matching pool

**WhatsApp Booking Flow**:
```javascript
const handleWhatsAppBooking = (hotelName) => {
  const message = encodeURIComponent(
    `Hi, I'd like to book ${hotelName} for the activity: ${activity.title}\n\n` +
    `Name: ${user.name}\n` +
    `Date: ${activity.date}\n` +
    `Participants: ${activity.currentParticipants}\n` +
    `Reference: ${activity._id}`
  );
  Linking.openURL(`whatsapp://send?phone=230XXXXXXXX&text=${message}`);
};
```

**Roommate Matching UI**:
- Shows participants actively looking for roommates
- Displays potential cost savings
- "Match with roommate" button to connect participants
- Cost split automatically calculated (original price / number of roommates)

## Core Feature Priorities

Understanding feature priorities helps guide development decisions:

### Tier 1: Activity & Safety (Mission Critical)
These features directly support the core value proposition of safe group activities:

1. **Real-Time Activity Tracking** (`LiveTrackingScreen.js`, `gpsService.js`)
   - Live location of all participants on map
   - Distance, speed, and pace calculations
   - Health metrics integration (heart rate from phone sensors)
   - Collective group statistics
   - Priority: Accuracy and reliability over fancy UI

2. **Activity Creation & Discovery** (`CreateChallengeScreen.js`, `ChallengeDetailScreen.js`)
   - Users create activities with clear requirements
   - Browse and join activities
   - Minimum participant requirements
   - Activity type categorization

3. **Safety Features**
   - Real-time participant monitoring
   - "Falling behind" detection
   - Emergency contact/SOS functionality
   - Location sharing controls

### Tier 2: Logistics & Cost-Sharing
Features that make activities easier to organize:

1. **Transport Cost-Sharing** (`RideSharingScreen.js`)
   - Organizers specify contribution fees (e.g., "Rs 500 per person")
   - Proximity-based taxi booking
   - Transport matching for activities

2. **Accommodation Booking** (Activity-tied in Phase 1)
   - Multi-day trip accommodation
   - Group booking features
   - Integration with activity planning

### Tier 3: Community Building
Features that keep users engaged long-term:

1. **Club Formation** (`ClubDetailScreen.js`)
   - Convert successful activities into clubs
   - Push notifications for new club events
   - Member management
   - Club statistics and history

2. **Social Features** (`ActivityScreen.js`, `SocialContext.js`)
   - Activity feed
   - Comments and likes
   - User profiles with stats
   - Following/followers

### Tier 4: Phase 2 Features (Future)
Independent service booking without activities:

1. **WhatsApp Bot Integration**
   - Lightweight booking flow
   - Restaurant reservations via bot
   - Hotel inquiries via bot
   - Minimal in-app forms

2. **Vehicle Rentals**
   - Bike rentals for activities
   - Cars for supplies
   - Direct platform booking

### Development Guideline

When prioritizing work or making trade-offs:
- **Safety features** > Everything else
- **Activity tracking reliability** > UI polish
- **Real-time accuracy** > Advanced features
- **Simple, working features** > Complex, buggy features

For Phase 1, if a feature doesn't directly support creating, joining, or safely completing group activities, it should be deprioritized.

## Backend Integration Status & Patterns

### Current Integration State

**✅ Fully Integrated**:
- Authentication system (login, register, token management)
- API base client with error handling
- Service layer (activityService, clubService, bookingService, notificationService)
- Socket.IO real-time communication setup
- AuthContext connected to backend

**🔄 In Progress** (screens need updating):
- ActivityScreen.js - needs to load real activities from API
- ActivityDetailScreen.js - needs join/leave functionality
- LiveTrackingScreen.js - needs Socket.IO integration
- ExploreScreen.js - needs search/filter with API
- CreateChallengeScreen.js - needs activity creation
- NotificationsScreen.js - needs real notification loading
- ClubDetailScreen.js - needs real club data

**⏳ Not Started**:
- Payment integration (Stripe/M-Pesa)
- Push notification delivery
- Club formation automation
- Health monitoring integration

### Backend Integration Pattern

All screens integrating with the backend should follow this standardized pattern:

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import { COLORS } from '../constants/theme';

const MyScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activityService.getActivities();
      // Backend returns: {success: true, activities: [...]}
      setData(response.activities || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message);
      Alert.alert('Error', err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Error state
  if (error && !data.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: COLORS.error, marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity onPress={loadData}>
          <Text style={{ color: COLORS.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (!data.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No data found</Text>
      </View>
    );
  }

  // Success state with data
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
};

export default MyScreen;
```

### Backend Response Format

The backend uses a consistent response format:

**Success Response**:
```javascript
{
  success: true,
  activities: [...],  // or user, club, booking, etc.
  pagination: {       // if paginated
    page: 1,
    limit: 20,
    total: 100
  }
}
```

**Error Response**:
```javascript
{
  success: false,
  error: "Error message here"
}
```

The `api.js` service automatically handles this format and throws errors appropriately.

### Socket.IO Real-Time Pattern

For features requiring real-time updates (live tracking, chat):

```javascript
import { useEffect } from 'react';
import socketService from '../services/socketService';

const LiveTrackingScreen = ({ route }) => {
  const { activityId } = route.params;
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Connect socket
    socketService.connect();

    // Join activity room
    socketService.joinActivity(activityId);

    // Listen for location updates
    const handleLocationUpdate = (data) => {
      setParticipants(prev => {
        const index = prev.findIndex(p => p.userId === data.userId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [...prev, data];
      });
    };

    socketService.on('participant-location', handleLocationUpdate);

    // Cleanup
    return () => {
      socketService.off('participant-location', handleLocationUpdate);
      socketService.leaveActivity(activityId);
      socketService.disconnect();
    };
  }, [activityId]);

  // Send location update
  const sendLocation = (location, stats) => {
    socketService.sendLocationUpdate(activityId, user._id, location, stats);
  };

  return (
    // Your UI with real-time participant markers
  );
};
```

### Error Handling Best Practices

1. **Always use try-catch** around API calls
2. **Show user-friendly messages** via Alert.alert()
3. **Log errors** with console.error() for debugging
4. **Provide retry mechanism** for failed requests
5. **Handle network errors** gracefully (offline mode)
6. **Validate data** before sending to backend

### Authentication Flow

The app uses JWT token-based authentication:

1. **Login** → Backend returns JWT token
2. **Store token** → Saved in AsyncStorage via api.js
3. **Auto-include token** → All API requests include `Authorization: Bearer TOKEN`
4. **Token refresh** → When token expires, refresh endpoint called
5. **Logout** → Token cleared from storage

The `AuthContext` handles all of this automatically. Access user data with:
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

## Data Layer

### Mock Data vs Real Data

**IMPORTANT**: The app is transitioning from mock data to real backend integration.

- **Mock Data** (`src/data/mockData.js`): Still used by some screens for prototyping
- **Real Data**: New integrations should ONLY use backend services, not mock data

### Mock Data Architecture (Legacy)

The app originally used mock data from `src/data/mockData.js` for prototyping. This file exports:
- `currentUser`: Logged-in user profile and stats
- `challenges`: Fitness challenges with participants and routes
- `clubs`: Fitness clubs with members and events
- `hotels`: Accommodation listings with amenities
- `restaurants`: Restaurant listings
- `rideShares`: Available ride sharing options
- `posts`: Social feed posts
- `liveTracking`: Live challenge session data
- And more...

**When building features**: Reference this file to understand the data structure. When integrating with a backend, replace mock data imports with API calls while maintaining the same data shape.

### Data Models

Key data structures:

**User**:
```javascript
{
  id, name, email, profilePhoto, location, bio,
  stats: { challengesCompleted, totalDistance, totalElevation, totalTime },
  achievements: Array,
  followers, following
}
```

**Challenge**:
```javascript
{
  id, title, description, activity, difficulty, type, date,
  distance, elevation, currentParticipants, maxParticipants,
  entryFee, currency, meetingPoint: { address, lat, lng },
  organizer, rideSharingAvailable, availableSeats
}
```

**Booking**:
```javascript
{
  id, userId, type: 'hotel'|'car'|'driver'|'challenge',
  item, details, payment,
  status: 'pending'|'confirmed'|'cancelled'|'completed',
  bookingReference, createdAt, updatedAt
}
```

## Important Implementation Details

### GPS & Location Tracking

The app uses `expo-location` for GPS functionality:

1. **Permission Handling**: Always request location permissions before accessing GPS
2. **Background Location**: Activity tracking uses background location updates
3. **Route Recording**: Routes are stored as arrays of `{latitude, longitude}` coordinates
4. **Calculations**: Distance, pace, and elevation calculations are in `gpsService.js`

**ActivityTrackerScreen.js Note**: This screen has a state variable named `routePath` (not `route`) to avoid conflicts with React Navigation's `route` prop.

### Map Integration

The app uses `react-native-maps` with three distinct map implementations:

1. **UberStyleRideScreen**: Ride booking with animated bottom sheet, driver markers, route polylines
2. **StravaStyleMapScreen**: Activity tracking with pace-colored polylines, elevation profiles, split markers
3. **AirbnbStyleMapScreen**: Hotel discovery with price markers, synced carousel, filters

**Best Practice**: When creating new map screens, reference these implementations for animation patterns, marker customization, and polyline rendering.

### Payment Flow

Multi-step booking and payment pattern:
1. User selects item (hotel/car/driver/challenge)
2. Navigate to `PaymentScreen` with booking details
3. User selects payment method (M-Pesa, Card, Bank Transfer)
4. Process payment via `paymentService.js`
5. Navigate to `BookingConfirmationScreen`
6. Add booking to `BookingContext`

**Important**: Payment processing is currently mocked. For production, integrate with Stripe or payment gateway in `paymentService.js`.

### Notification Badge System

Unread counts are displayed as badges on bottom tab icons:
- **Activity Tab**: Shows `unreadCount` from NotificationsContext
- **Messages Tab**: Shows `totalUnreadCount` from MessagesContext

This is implemented in `AppNavigator.js` using custom badge rendering in the `tabBarIcon` function.

### WhatsApp Bot Integration Pattern (Phase 2)

The app's Phase 2 strategy deliberately avoids heavy in-app booking forms. Instead:

**Pattern**: Deep linking to WhatsApp with pre-filled message
```javascript
import { Linking } from 'react-native';

// When user taps "Book via WhatsApp" on restaurant/hotel
const handleWhatsAppBooking = async (serviceName, serviceType, userDetails) => {
  const phoneNumber = '+230XXXXXXXX'; // Service WhatsApp number
  const message = encodeURIComponent(
    `Hi, I'd like to book ${serviceName}.\n` +
    `Type: ${serviceType}\n` +
    `Name: ${userDetails.name}\n` +
    `Reference: ${generateBookingRef()}`
  );

  const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;

  await Linking.openURL(whatsappUrl);
};
```

**Design Philosophy**:
- Keep app UI minimal for external bookings
- Let WhatsApp bot handle complex reservation flows
- Reduce in-app form friction
- Bot can ask follow-up questions naturally in chat

**Implementation Considerations**:
- Store booking references in app for tracking
- Handle fallback if WhatsApp not installed
- Sync booking confirmations from bot back to app (via webhook or SMS)

### Organizer-Set Contribution Fees

Organizers can set custom requirements for activities:

**Data Structure**:
```javascript
{
  activity: {
    // ... other fields
    organizerServices: {
      transport: {
        available: true,
        type: 'Car - 4 seats',
        contributionFee: 500, // Rs per person
        currency: 'MUR'
      },
      accommodation: {
        available: true,
        type: 'Camping tent',
        contributionFee: 200,
        currency: 'MUR'
      }
    },
    minimumParticipants: 5,
    maximumParticipants: 10
  }
}
```

**UI Pattern**: When creating an activity, show toggles for "I'm providing transport" / "I'm providing accommodation" with fee input fields. This is more flexible than fixed service listings.

### Collective Statistics for Groups

During live tracking, calculate and display group-level metrics:

**Implementation** (`gpsService.js`):
```javascript
export const calculateGroupStats = (participants) => {
  const totalDistance = participants.reduce((sum, p) => sum + p.distance, 0);
  const avgSpeed = participants.reduce((sum, p) => sum + p.speed, 0) / participants.length;
  const leadingParticipant = participants.reduce((max, p) => p.distance > max.distance ? p : max);
  const trailingParticipant = participants.reduce((min, p) => p.distance < min.distance ? p : min);

  return {
    totalDistance,
    avgSpeed,
    leadingParticipant,
    trailingParticipant,
    spreadDistance: leadingParticipant.distance - trailingParticipant.distance
  };
};
```

Display this in `LiveTrackingScreen.js` alongside individual stats. For competitions, group stats are primary; for family activities, individual monitoring is primary.

## Component Patterns

### Reusable Card Components

The app has three main card components in `src/components/`:
- **ChallengeCard.js**: Displays challenge info with activity badge, difficulty indicator
- **ClubCard.js**: Club branding with member count and next event
- **HotelCard.js**: Hotel listings with photos, ratings, amenities

**Pattern**: These cards are designed to be used in FlatLists with proper keys and onPress handlers.

### Screen Composition Pattern

Most screens follow this structure:
```javascript
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const MyScreen = ({ navigation, route }) => {
  const [state, setState] = useState(initialState);

  // Extract params
  const { paramName } = route.params || {};

  // Effects for data loading
  useEffect(() => {
    // Load data
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Content */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
});

export default MyScreen;
```

## Known Issues & Fixes

### CRITICAL: Theme Module Initialization (Fixed)
**Issue**: "Cannot read property 'small' of undefined" runtime error even though `SHADOWS` is correctly defined in `theme.js`.
**Root Cause**: Components use `...SHADOWS.small` in `StyleSheet.create()` at module level (executes immediately when file loads). Due to JavaScript module import order, `theme.js` wasn't fully initialized before components tried to use it.
**Fix**: Force theme to load first by importing at app entry point in `index.js`:
```javascript
import { registerRootComponent } from 'expo';
// Force theme to load first to prevent module initialization errors
import { COLORS, SIZES, FONTS, SHADOWS } from './src/constants/theme';
console.log('🟢 Theme loaded in index.js:', { COLORS, SIZES, FONTS, SHADOWS });
import App from './App';

registerRootComponent(App);
```
**Why this works**: By importing theme at the very top of `index.js`, we guarantee it loads and initializes before any component that uses SHADOWS. The console.log verifies the theme is loaded.

**Prevention**: Never use theme constants at module level outside of `StyleSheet.create()` unless necessary. If you must use them at module level, ensure imports are ordered correctly.

### Variable Naming Conflict (Fixed)
**Issue**: `ActivityTrackerScreen.js` had a naming conflict between React Navigation's `route` parameter and a state variable.
**Fix**: State variable renamed to `routePath` to avoid confusion.

### SDK Compatibility (Critical)
The app uses Expo SDK 54. Package versions must be compatible with this SDK version.

**Current Package Versions** (from package.json):
- `expo`: ^54.0.27
- `expo-location`: ~19.0.8
- `expo-image-picker`: ~17.0.9
- `expo-notifications`: ~0.32.14
- `expo-battery`: ~10.0.8
- `react-native`: 0.81.5
- `react-native-maps`: 1.20.1
- `socket.io-client`: 4.7.2

**When adding packages**: Check compatibility at https://docs.expo.dev/versions/v54.0.0/

### Google Places API Location Search (Fixed)
**Issue**: Taxi/ride screen used hardcoded mock location data.
**Fix**: Implemented real Google Places API integration with fallback.

**Files**:
- `src/services/locationService.js` - New service for Google Places API
- `src/screens/UberStyleRideScreen.js` - Updated to use real location search
- `src/config/api.js` - Added Google Places API configuration

**Features**:
- Real-time autocomplete as user types (2+ characters)
- Restricts search to Mauritius (`country:mu`)
- 50km radius around current location
- Session token management for billing optimization
- Icon mapping for different place types (airport, restaurant, hotel, etc.)
- Fallback to 15 predefined Mauritius locations when API unavailable
- Place details fetching with coordinates

**Setup**:
```javascript
// In src/config/api.js
export const GOOGLE_PLACES_API_KEY = 'YOUR_API_KEY_HERE';
export const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';
```

**Usage**:
```javascript
import locationService from '../services/locationService';

const results = await locationService.searchPlaces(query, {
  location: `${latitude},${longitude}`,
  radius: 50000,
  components: 'country:mu'
});
// Returns: [{ id, placeId, name, address, icon, types }]
```

### AsyncStorage Import
Always use: `@react-native-async-storage/async-storage` (NOT the deprecated `react-native` import)

## Development Workflow

### Adding a New Screen

1. Create screen file in `src/screens/NewScreen.js`
2. Follow the screen composition pattern above
3. Import and register in appropriate Stack Navigator in `AppNavigator.js`:
   ```javascript
   <Stack.Screen
     name="NewScreen"
     component={NewScreen}
     options={{ title: 'Screen Title' }}
   />
   ```
4. Navigate to it from other screens: `navigation.navigate('NewScreen', { params })`

### Adding Global State

1. Create context file: `src/context/MyContext.js`
2. Export provider and custom hook:
   ```javascript
   export const MyContext = createContext();
   export const MyProvider = ({ children }) => { /* ... */ };
   export const useMyContext = () => useContext(MyContext);
   ```
3. Wrap in `App.js` provider hierarchy
4. Use in screens: `const { state, action } = useMyContext();`

### Adding a Service

1. Create service file: `src/services/myService.js`
2. Export pure functions/classes
3. Import and use in screens/contexts
4. Keep services framework-agnostic (no React imports)

### Implementing Club Conversion from Activities

After a successful activity, allow participants to convert the group into a club:

**Flow**:
1. Activity completes (all participants finish)
2. Organizer sees "Convert to Club" option in activity summary
3. Organizer sets club name, description, avatar
4. All participants automatically become club members
5. Club inherits activity type, location, and stats as club history

**Implementation Considerations**:
- Check if club already exists with same members (suggest joining instead)
- Send push notification to all participants about club creation
- Club's first event is the completed activity (for stats/history)
- Store club membership in user profile for quick access

**Data Relationship**:
```javascript
{
  club: {
    id: 'club_123',
    name: 'Mauritius Cycling Crew',
    createdFrom: 'activity_456', // Reference to source activity
    members: ['user1', 'user2', ...], // All activity participants
    stats: {
      activitiesCompleted: 1,
      totalDistance: 100, // From first activity
      // ...
    }
  }
}
```

### Proximity-Based Taxi Booking

For activities requiring transport, match users based on location:

**Algorithm** (`src/services/locationService.js`):
```javascript
export const findNearbyParticipants = (participants, maxDistance = 5) => {
  // maxDistance in km
  const groups = [];

  participants.forEach(user => {
    // Find if user is within maxDistance of any existing group's center
    let addedToGroup = false;

    for (let group of groups) {
      const distance = calculateDistance(
        user.location,
        calculateGroupCenter(group.members)
      );

      if (distance <= maxDistance) {
        group.members.push(user);
        addedToGroup = true;
        break;
      }
    }

    // If not added to any group, create new group
    if (!addedToGroup) {
      groups.push({ members: [user], center: user.location });
    }
  });

  return groups; // Each group can share a taxi
};
```

**UI Flow**:
1. After joining activity, app shows "Find nearby participants for ride sharing"
2. Display proximity groups on map with cluster markers
3. Users in same group can chat and coordinate pickup location
4. Split taxi cost among group members

## Performance Considerations

### FlatList Usage
For long lists (challenges, hotels, posts), always use FlatList with:
- Proper `keyExtractor` (use unique IDs)
- `getItemLayout` for fixed-height items
- `removeClippedSubviews` for very long lists

### Animation Performance
- Use `useNativeDriver: true` whenever possible
- Prefer `Animated.timing()` over complex gesture animations
- Test animations on physical devices (simulators can be misleading)

### Image Optimization
- Use appropriate image sizes (don't load full-res unnecessarily)
- Consider implementing lazy loading for image-heavy screens
- Use `resizeMode` appropriately

### Health Metrics & Safety Monitoring

**Important**: Phone-derived health data is critical for safety monitoring:

**Data Sources**:
- **Pedometer/Step Counter**: `expo-sensors` - Accelerometer data for step counting
- **Heart Rate**: May require external sensor (Apple Watch, fitness band) via Bluetooth
- **Location-Based Metrics**: Speed, pace, distance from GPS

**Implementation Strategy**:
```javascript
// In gpsService.js or new healthService.js
import { Pedometer } from 'expo-sensors';

export const monitorParticipantHealth = async (participantId) => {
  // Check if hardware is available
  const isAvailable = await Pedometer.isAvailableAsync();

  if (isAvailable) {
    const subscription = Pedometer.watchStepCount(result => {
      const steps = result.steps;
      // Calculate if participant has stopped moving (potential distress)
      // Update participant's health status
    });

    return subscription;
  }
};

export const detectDistressSignals = (participant) => {
  const alerts = [];

  // No movement for > 5 minutes during activity
  if (participant.speed === 0 && participant.lastMovementTime > 300000) {
    alerts.push({ type: 'NO_MOVEMENT', severity: 'high' });
  }

  // Falling significantly behind group
  if (participant.distanceFromLeader > 2000) { // 2km behind
    alerts.push({ type: 'FALLING_BEHIND', severity: 'medium' });
  }

  // Abnormal heart rate (if available)
  if (participant.heartRate > 180 || participant.heartRate < 40) {
    alerts.push({ type: 'ABNORMAL_HEART_RATE', severity: 'high' });
  }

  return alerts;
};
```

**Safety UI Considerations**:
- Show health status icon next to each participant (green = OK, yellow = attention, red = alert)
- Automatic notification to organizer when distress detected
- Quick call/message button for each participant
- "I'm OK" check-in feature participants can trigger
- Emergency SOS button that alerts all participants and shares exact location

**Privacy**: Users should explicitly opt-in to health data sharing and control what metrics are visible to others.

## Backend API Reference

### Backend Location
- **Directory**: `../alonix-backend/` (parallel to this mobile app)
- **Running**: Backend should be running on `http://localhost:3000`
- **Documentation**: See `../alonix-backend/README.md` and `IMPLEMENTATION_STATUS.md`

### Available API Endpoints

**Authentication** (`/api/auth`):
- `POST /register` - Register new user
- `POST /login` - Login with email/password
- `POST /refresh-token` - Refresh JWT token
- `GET /me` - Get current user profile

**Activities** (`/api/activities`):
- `GET /` - List activities (with filters: type, difficulty, date, location)
- `POST /` - Create new activity
- `GET /:id` - Get activity details
- `PUT /:id` - Update activity (organizer only)
- `DELETE /:id` - Cancel activity
- `POST /:id/join` - Join activity
- `POST /:id/leave` - Leave activity
- `GET /nearby` - Find nearby activities (geospatial)
- `POST /:id/book-service` - Book organizer transport/accommodation

**Clubs** (`/api/clubs`):
- `GET /` - List clubs
- `POST /` - Create club
- `GET /:id` - Get club details
- `POST /:id/join` - Join club
- `POST /:id/leave` - Leave club

**Bookings** (`/api/bookings`):
- `GET /` - Get user's bookings
- `POST /` - Create booking
- `DELETE /:id` - Cancel booking

**Notifications** (`/api/notifications`):
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark as read

**SOS/Safety** (`/api/sos`):
- `POST /alert` - Trigger emergency alert
- `GET /active` - Get active alerts
- `POST /:id/respond` - Respond to alert
- `POST /:id/resolve` - Resolve alert

**Users** (`/api/users`):
- `GET /:id` - Get user profile
- `PUT /profile` - Update profile
- `POST /follow/:userId` - Follow user
- `DELETE /follow/:userId` - Unfollow user
- `POST /emergency-contacts` - Add emergency contact
- `POST /push-token` - Register push notification token

### WebSocket Events (Socket.IO)

**Connection**:
- `authenticate` - Authenticate socket with JWT token
- `authenticated` - Confirmation of authentication

**Activity Sessions**:
- `join-activity` - Join activity room
- `leave-activity` - Leave activity room
- `location-update` - Send location update
- `participant-location` - Receive participant location (broadcast)
- `activity-started` - Activity session started
- `activity-ended` - Activity session ended

**Safety**:
- `sos-alert` - Send emergency alert
- `emergency-alert` - Receive emergency alert (broadcast)
- `safety-alert` - Receive automatic safety warning

**Statistics**:
- `group-stats` - Receive group statistics update
- `leaderboard-update` - Receive leaderboard update

### Backend Technology Stack
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB Atlas (cloud)
- **ORM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **Security**: bcrypt, CORS, rate limiting, input validation

### Testing the Backend

**Test User Credentials**:
- Email: `pascal@alonix.com`
- Password: `Test123`
- User ID: `6937126b3c7728040ced3476`

**Health Check**:
```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","timestamp":"..."}
```

**Test Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pascal@alonix.com","password":"Test123"}'
```

### Related Documentation Files
- `INTEGRATION_STATUS.md` - Current integration progress
- `INTEGRATION_GUIDE.md` - Step-by-step integration guide
- `../alonix-backend/README.md` - Complete backend API docs
- `../alonix-backend/TESTING.md` - Backend testing guide
- `EXECUTION_PLAN.md` - 8-week development roadmap

## Platform-Specific Considerations

### iOS
- Requires location permissions in app.json
- Maps may need additional configuration for production

### Android
- Requires location permissions in app.json
- May need additional permissions for background location

### Web
- Limited functionality (maps, GPS don't work well)
- Use for testing UI components only

## Troubleshooting

### "Cannot read property 'small' of undefined" (SHADOWS error)
**Symptoms**: App crashes on load with SHADOWS undefined error, even though `theme.js` is correct.

**Root Cause**: Module initialization order - components using SHADOWS at module level load before theme.js initializes.

**Solution**:
1. Ensure `index.js` has theme import at the top:
```javascript
import { COLORS, SIZES, FONTS, SHADOWS } from './src/constants/theme';
```

2. If error persists, clear all caches:
```bash
# Clear Expo and Metro caches
cd alonix-mobile
rm -rf .expo node_modules/.cache

# Clear global Metro cache (Windows)
rm -rf /c/Users/$USERNAME/AppData/Local/Temp/metro-*
rm -rf /c/Users/$USERNAME/AppData/Local/Temp/haste-*

# Clear Watchman cache (if installed)
watchman watch-del-all

# Restart with clean cache
npx expo start -c
```

3. If still failing, kill all Node/Metro processes:
```bash
# Windows
tasklist | findstr node
taskkill //F //PID <process_id>

# Check port 8081 is free
netstat -ano | findstr :8081
```

### Metro bundler fails
```bash
npx expo start -c  # Clear cache
```

### Module not found errors
```bash
npm install  # Reinstall dependencies
```

### Maps not loading
- Check that `react-native-maps` is installed correctly
- Ensure mock data has proper coordinate format: `{latitude: number, longitude: number}`
- For production, configure API keys in app.json

### Expo Go connection issues
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Check firewall settings

### "Objects are not valid as a React child" errors
**Cause**: Trying to render objects directly in Text components (common with location data from backend).

**Solution**: Extract specific properties or format as string:
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
