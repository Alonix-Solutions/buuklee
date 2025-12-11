# Alonix Mobile App - Project Summary

## Project Overview
Alonix is a comprehensive fitness and lifestyle mobile application built with React Native and Expo SDK 49. The app combines social fitness tracking, challenge participation, travel booking, and transportation services into a unified platform.

## Technology Stack
- **Framework**: React Native with Expo SDK 49
- **Navigation**: React Navigation v6 (Stack & Bottom Tabs)
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **Maps**: React Native Maps with GPS tracking
- **Location**: expo-location
- **Image Handling**: expo-image-picker
- **Notifications**: expo-notifications
- **UI Icons**: @expo/vector-icons (Ionicons)

## App Architecture

### Navigation Structure
The app uses a hybrid navigation structure with Bottom Tab Navigation as the root and Stack Navigators for each tab:

```
Root
├── Authentication Flow (when not logged in)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
└── Main App (when logged in)
    ├── Home Tab (HomeStack)
    ├── Explore Tab (ExploreStack)
    ├── Messages Tab (MessagesStack)
    ├── Activity Tab (ActivityStack)
    └── Profile Tab (ProfileStack)
```

### Context Providers
The app uses multiple context providers for global state management:

1. **AuthContext** - User authentication, login/logout, session management
2. **BookingContext** - Booking creation, cancellation, status updates
3. **SocialContext** - Follow/unfollow, likes, comments, activity feed
4. **NotificationsContext** - Push notifications, unread counts
5. **MessagesContext** - Chat conversations, unread message counts

## Feature Breakdown

### 1. Authentication System
**Files**: `LoginScreen.js`, `RegisterScreen.js`, `ForgotPasswordScreen.js`, `AuthContext.js`

**Features**:
- Email/password authentication
- User registration with validation
- Password recovery flow
- Persistent session management
- Secure credential storage

### 2. Home & Discovery
**Files**: `HomeScreen.js`, `ExploreScreen.js`, `SearchScreen.js`

**Features**:
- Featured challenges and events
- Quick access to transportation services
- Recent activity feed
- Category browsing (Challenges, Clubs, Hotels, Restaurants, Attractions)
- Advanced search with filters

### 3. Fitness & Activity Tracking
**Files**: `ActivityTrackerScreen.js`, `LiveTrackingScreen.js`, `ActivityDetailScreen.js`

**Features**:
- Real-time GPS tracking
- Activity recording (running, cycling, hiking)
- Route visualization on map
- Stats tracking (distance, pace, duration, elevation)
- Activity history and analytics
- Live challenge participation tracking

**Key Functionality**:
- Start/pause/resume/finish tracking
- Background location updates
- Polyline route rendering
- Activity statistics calculation

### 4. Social Features
**Files**: `ActivityScreen.js`, `UserProfileScreen.js`, `SocialContext.js`

**Features**:
- Activity feed with user posts
- Follow/unfollow users
- Like and comment on activities
- User profiles with stats
- Achievement badges
- Leaderboards (planned)

### 5. Challenge System
**Files**: `ChallengeDetailScreen.js`, `LiveTrackingScreen.js`

**Features**:
- Browse challenges by category
- Challenge details (route, difficulty, participants)
- Registration and payment
- Live challenge tracking
- Participant list
- Ride sharing for challenges

### 6. Booking & Payment System
**Files**: `PaymentScreen.js`, `BookingConfirmationScreen.js`, `MyBookingsScreen.js`, `BookingContext.js`

**Features**:
- Unified payment interface for all bookings
- Multiple payment methods:
  - M-Pesa mobile money
  - Credit/debit cards
  - Bank transfer
- Booking management
- Booking history
- Cancellation and refunds

**Supported Booking Types**:
- Hotel reservations
- Car rentals
- Driver/ride bookings
- Challenge registrations

### 7. Car Rental System
**Files**: `CarRentalScreen.js`, `CarDetailScreen.js`, `CarBookingScreen.js`

**Features**:
- Browse available rental cars
- Filter by price, type, transmission
- Car details (specs, photos, ratings)
- Date and location selection
- Booking form with validation
- Insurance options

### 8. Driver & Ride Booking
**Files**: `DriverSelectionScreen.js`, `RideRequestScreen.js`, `DriverTrackingScreen.js`, `TransportSelectionScreen.js`

**Features**:
- Transportation hub (car rental vs driver)
- Driver profiles with ratings and reviews
- Multiple service types:
  - Personal driver
  - Airport transfer
  - City tours
  - Long-distance trips
- Scheduled vs immediate booking
- Real-time driver tracking
- Route and duration display

### 9. Hotel & Accommodation
**Files**: `HotelDetailScreen.js`

**Features**:
- Hotel details with photos
- Amenities list
- Location on map
- Reviews and ratings
- Room selection
- Direct booking integration

### 10. Clubs & Social Venues
**Files**: `ClubDetailScreen.js`

**Features**:
- Club information and photos
- Operating hours
- Member benefits
- Location details
- Join/membership options

### 11. Ride Sharing
**Files**: `RideSharingScreen.js`

**Features**:
- Carpool coordination for challenges
- Available seats display
- Cost splitting
- Ride matching

### 12. Messaging System
**Files**: `MessagesScreen.js`, `ConversationScreen.js`, `MessagesContext.js`

**Features**:
- Direct messaging
- Conversation threads
- Unread message indicators
- Real-time updates (simulated)
- Message history

### 13. Notifications
**Files**: `NotificationsScreen.js`, `NotificationsContext.js`

**Features**:
- Activity notifications
- Booking updates
- Social interactions (likes, comments, follows)
- Challenge reminders
- Unread badge counts

### 14. User Profile & Settings
**Files**: `ProfileScreen.js`, `EditProfileScreen.js`, `SettingsScreen.js`

**Features**:
- User statistics dashboard
- Activity breakdown by type
- Achievement display
- Recent posts
- Profile editing
- App settings
- Account management

### 15. Achievements System
**Files**: `AchievementsScreen.js`

**Features**:
- Achievement badges
- Progress tracking
- Unlock conditions
- Achievement categories

### 16. Reviews & Ratings
**Files**: `ReviewsScreen.js`, `WriteReviewScreen.js`

**Features**:
- View reviews for services
- Star ratings
- Written reviews
- Photo uploads
- Helpful votes

### 17. Help & Support
**Files**: `HelpScreen.js`

**Features**:
- FAQ section
- Contact support
- Account help
- Booking assistance
- App tutorials

## Data Models

### User
```javascript
{
  id: string,
  name: string,
  email: string,
  profilePhoto: string,
  location: string,
  bio: string,
  stats: {
    challengesCompleted: number,
    totalDistance: number,
    totalElevation: number,
    totalTime: number
  },
  achievements: Array,
  followers: number,
  following: number
}
```

### Activity
```javascript
{
  id: string,
  userId: string,
  type: 'running' | 'cycling' | 'hiking' | 'swimming',
  title: string,
  description: string,
  distance: number,
  duration: number,
  averagePace: number,
  elevation: number,
  route: Array<{latitude, longitude}>,
  photos: Array<string>,
  likes: number,
  comments: number,
  createdAt: timestamp
}
```

### Booking
```javascript
{
  id: string,
  userId: string,
  type: 'hotel' | 'car' | 'driver' | 'challenge',
  item: Object,
  details: Object,
  payment: Object,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  bookingReference: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Challenge
```javascript
{
  id: string,
  title: string,
  description: string,
  activity: 'running' | 'cycling' | 'hiking',
  difficulty: 'easy' | 'moderate' | 'hard',
  type: 'timed' | 'distance',
  date: timestamp,
  distance: number,
  elevation: number,
  currentParticipants: number,
  maxParticipants: number,
  entryFee: number,
  currency: string,
  meetingPoint: {
    address: string,
    latitude: number,
    longitude: number
  },
  organizer: Object,
  rideSharingAvailable: boolean,
  availableSeats: number
}
```

## App Screens

### Authentication Screens (3)
1. LoginScreen
2. RegisterScreen
3. ForgotPasswordScreen

### Main Tab Screens (5)
4. HomeScreen
5. ExploreScreen
6. MessagesScreen (main)
7. ActivityScreen
8. ProfileScreen

### Booking & Transportation (11)
9. TransportSelectionScreen
10. CarRentalScreen
11. CarDetailScreen
12. CarBookingScreen
13. DriverSelectionScreen
14. RideRequestScreen
15. DriverTrackingScreen
16. PaymentScreen
17. BookingConfirmationScreen
18. MyBookingsScreen
19. RideSharingScreen

### Activity & Fitness (5)
20. ActivityTrackerScreen
21. ActivityDetailScreen
22. LiveTrackingScreen
23. CreateScreen
24. AchievementsScreen

### Social & Discovery (8)
25. SearchScreen
26. UserProfileScreen
27. ChallengeDetailScreen
28. HotelDetailScreen
29. ClubDetailScreen
30. ReviewsScreen
31. WriteReviewScreen
32. ConversationScreen

### Settings & Profile (5)
33. SettingsScreen
34. EditProfileScreen
35. NotificationsScreen
36. HelpScreen

**Total: 36 Screens**

## Key Dependencies

```json
{
  "expo": "~49.0.0",
  "@react-navigation/native": "^6.1.6",
  "@react-navigation/stack": "^6.3.16",
  "@react-navigation/bottom-tabs": "^6.5.7",
  "react-native-maps": "1.7.1",
  "expo-location": "~16.1.0",
  "expo-image-picker": "~14.3.2",
  "expo-notifications": "~0.20.1",
  "@react-native-async-storage/async-storage": "1.18.2",
  "expo-device": "^5.4.0"
}
```

## Project Structure

```
alonix-mobile/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ChallengeCard.js
│   │   ├── ClubCard.js
│   │   ├── HotelCard.js
│   │   └── PostCard.js
│   ├── constants/          # App constants
│   │   └── theme.js
│   ├── context/            # Context providers
│   │   ├── AuthContext.js
│   │   ├── BookingContext.js
│   │   ├── SocialContext.js
│   │   ├── NotificationsContext.js
│   │   └── MessagesContext.js
│   ├── data/               # Mock data
│   │   └── mockData.js
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.js
│   │   └── AuthNavigator.js
│   ├── screens/            # Screen components (36 total)
│   ├── services/           # Business logic services
│   │   └── GPSService.js
│   └── utils/              # Utility functions
│       └── helpers.js
├── App.js                  # Root component
├── index.js                # Entry point
├── package.json
└── app.json
```

## Recent Issues Fixed

### 1. Variable Naming Conflict
**Issue**: `ActivityTrackerScreen.js` had a naming conflict between React Navigation's `route` parameter and a state variable also named `route`.

**Fix**: Renamed state variable from `route` to `routePath` and updated all 5 references throughout the file.

**File**: `src/screens/ActivityTrackerScreen.js:30`

### 2. Missing Dependencies
**Issue**: `expo-device` package was listed in package.json but not installed, causing build failures.

**Fix**: Ran `npm install` to install all missing packages.

### 3. Incompatible SDK Versions
**Issue**: Three Expo packages had versions incompatible with SDK 49:
- expo-image-picker@17.0.8
- expo-location@19.0.7
- expo-notifications@0.32.12

**Fix**: Downgraded to SDK 49 compatible versions:
- expo-image-picker@~14.3.2
- expo-location@~16.1.0
- expo-notifications@~0.20.1

## Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI
- Expo Go app (for testing on physical device)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

### Installation
```bash
cd alonix-mobile
npm install
```

### Running the App
```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start --clear

# Start on specific platform
npx expo start --android
npx expo start --ios
```

### Testing
The app can be tested on:
1. **Physical device**: Scan QR code with Expo Go app
2. **iOS Simulator**: Press 'i' in Expo CLI
3. **Android Emulator**: Press 'a' in Expo CLI

## Future Enhancements

### Short Term
1. Backend API integration
2. Real-time messaging with WebSockets
3. Push notification implementation
4. Image upload to cloud storage
5. Payment gateway integration

### Medium Term
1. Offline mode with data synchronization
2. Advanced analytics dashboard
3. Social media sharing
4. In-app camera for activity photos
5. Voice navigation during activities

### Long Term
1. Apple Watch / Wear OS integration
2. Machine learning for activity recommendations
3. Augmented reality features for challenges
4. Multi-language support
5. Gamification enhancements

## Performance Considerations

### Optimizations Implemented
1. Context provider memoization
2. FlatList for long lists
3. Image optimization
4. Lazy loading of screens
5. Async operations for storage
6. Background location updates

### Best Practices
1. Avoid inline function definitions in renders
2. Use React.memo for expensive components
3. Implement proper key props for lists
4. Minimize re-renders with proper state structure
5. Use useCallback and useMemo where appropriate

## Security Considerations

### Current Implementation
1. AsyncStorage for local data (not encrypted)
2. Simulated authentication (no real backend)
3. Client-side validation only

### Production Requirements
1. Implement proper backend authentication
2. Use secure token storage
3. Encrypt sensitive data
4. Implement certificate pinning
5. Add rate limiting
6. Sanitize user inputs
7. Implement proper authorization checks

## Testing Strategy

### Manual Testing Checklist
- [ ] Authentication flow (login, register, logout)
- [ ] Navigation between all screens
- [ ] GPS tracking functionality
- [ ] Booking flows (hotel, car, driver, challenge)
- [ ] Payment processing
- [ ] Social features (like, comment, follow)
- [ ] Messaging system
- [ ] Profile editing
- [ ] Search functionality
- [ ] Notifications

### Automated Testing (To Implement)
1. Unit tests for utilities and helpers
2. Component tests with React Testing Library
3. Integration tests for context providers
4. E2E tests with Detox
5. API mocking for consistent testing

## Deployment

### Android (Google Play Store)
```bash
# Build standalone APK
eas build --platform android

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS (App Store)
```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Over-the-Air Updates
```bash
# Publish update
eas update --branch production
```

## Contributing Guidelines

### Code Style
- Use ES6+ features
- Follow React Hooks best practices
- Maintain consistent component structure
- Add comments for complex logic
- Use meaningful variable and function names

### Commit Message Format
```
type(scope): subject

body

footer
```

Types: feat, fix, docs, style, refactor, test, chore

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description
5. Address review comments
6. Merge after approval

## License
[License information to be added]

## Contact & Support
[Contact information to be added]

---

**Last Updated**: 2025-11-12
**Version**: 1.0.0
**Status**: Development Complete - Ready for Backend Integration
