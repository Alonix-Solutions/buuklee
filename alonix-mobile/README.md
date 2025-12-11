# Alonix - Social Fitness & Tourism Platform

## 🎯 Platform Vision

Alonix is a **social-first mobile platform** that brings people together through fitness challenges, outdoor activities, and shared travel experiences. At its core, it's about building community through movement, adventure, and cost-sharing.

**Core Philosophy: "Move Together, Save Together"**

---

## ✨ Features

### 🏃 Social Fitness
- **Create & Join Challenges** - Organize cycling, running, hiking challenges
- **Live Tracking** - Real-time GPS tracking with live map and leaderboard
- **Clubs** - Join or create fitness clubs for regular activities
- **Social Feed** - Share achievements, photos, and stats
- **Achievements & Badges** - Unlock badges and track your progress

### 🚗 Cost Sharing
- **Ride Sharing** - Share rides to challenges and split costs
- **Shared Taxis** - Match with others going the same direction
- **Cost Split Calculator** - Automatic fair cost distribution
- **Payment Integration** - Secure payment handling

### 🗺️ Tourism & Booking
- **Hotel Search** - Browse hotels with interactive maps
- **Restaurant Reservations** - Book tables via WhatsApp
- **Map Integration** - View everything on live maps
- **WhatsApp Bot** - Easy booking through WhatsApp

### 📊 Stats & Analytics
- **Activity Tracking** - Distance, elevation, time, pace, calories
- **Personal Bests** - Track your records and improvements
- **Yearly Stats** - See your progress over time
- **Performance Breakdown** - By activity type

---

## 🏗️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Maps**: React Native Maps
- **Icons**: Expo Vector Icons
- **UI Design**: Custom components inspired by Booking.com, Strava, and Uber

---

## 📱 App Structure

### Bottom Navigation (5 Tabs)

1. **🏠 Home**
   - Welcome screen with personalized greeting
   - Live challenges happening now
   - Quick actions (Create challenge, Find activities, Share ride, Book hotel)
   - Upcoming challenges
   - Featured clubs

2. **🔍 Explore**
   - Search and filter functionality
   - Browse challenges, clubs, hotels, restaurants, attractions
   - Interactive map view
   - Advanced filters (date, distance, difficulty, price)

3. **➕ Create** (Center FAB)
   - Create challenge
   - Offer ride share
   - Create club
   - Post achievement
   - Schedule event

4. **🎯 Activity**
   - My challenges (upcoming and past)
   - My ride shares
   - My bookings
   - My clubs
   - Notifications

5. **👤 Profile**
   - User stats and achievements
   - Activity breakdown by type
   - Recent posts
   - Settings and preferences

---

## 🎨 Key Screens

### Home Screen
- Personalized greeting
- Live challenge card with real-time participant tracking
- Quick action buttons for common tasks
- Featured upcoming challenges
- Featured clubs

### Explore Screen
- Tab navigation (Challenges, Clubs, Hotels, Restaurants, Attractions)
- Search bar with real-time filtering
- Filter chips (Date, Distance, Difficulty, Price)
- Map view toggle for hotels
- Grid/list view options

### Challenge Detail Screen
- Cover photo gallery
- Challenge information (date, distance, elevation, difficulty)
- Organizer profile
- Interactive route map
- Participant list
- Ride sharing availability
- Join button with share option

### Live Tracking Screen
- Full-screen map with participant markers
- Real-time GPS tracking
- Live leaderboard
- Current stats (distance, time, elevation, pace)
- Toggle between stats and leaderboard
- Pause and SOS buttons

### Profile Screen
- User header with photo and bio
- Overall stats cards
- Activity breakdown by type (running, cycling, hiking)
- Achievement badges gallery
- Recent activity posts

### Ride Sharing Screen
- Cost savings calculator
- Available rides list
- Driver ratings and reviews
- Route preview
- Seat availability
- Cost per person
- Request seat button

### Hotel Detail Screen
- Photo gallery with swipe
- Rating and reviews
- Location with map
- Amenities list
- WhatsApp booking button
- Price display

### Club Detail Screen
- Cover photo and logo
- Club info and stats
- Tab navigation (About, Events, Members, Photos)
- Next event preview
- Membership information
- Regular activities schedule
- Join button

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (for macOS) or Android Studio (for Android development)
- Expo Go app on your phone (for testing on real device)

### Installation

1. **Clone the repository**
   ```bash
   cd alonix-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

---

## 📂 Project Structure

```
alonix-mobile/
├── App.js                      # Main app entry with navigation
├── index.js                    # Expo entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
│
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js     # Navigation setup (Bottom tabs + Stacks)
│   │
│   ├── screens/
│   │   ├── HomeScreen.js       # Home screen with featured content
│   │   ├── ExploreScreen.js    # Search and browse
│   │   ├── CreateScreen.js     # Create new content
│   │   ├── ActivityScreen.js   # User's activities and bookings
│   │   ├── ProfileScreen.js    # User profile and stats
│   │   ├── ChallengeDetailScreen.js
│   │   ├── LiveTrackingScreen.js
│   │   ├── HotelDetailScreen.js
│   │   ├── ClubDetailScreen.js
│   │   └── RideSharingScreen.js
│   │
│   ├── components/
│   │   ├── ChallengeCard.js    # Challenge card component
│   │   ├── ClubCard.js         # Club card component
│   │   └── HotelCard.js        # Hotel card component
│   │
│   ├── data/
│   │   └── mockData.js         # Mock data for prototype
│   │
│   ├── constants/
│   │   └── theme.js            # Colors, sizes, fonts
│   │
│   └── utils/
│       └── helpers.js          # Utility functions
│
└── assets/                     # Images and icons
```

---

## 🎨 Design System

### Colors
- **Primary**: Indigo (#4F46E5) - Main brand color
- **Secondary**: Orange (#FC5200) - Strava-inspired accent
- **Success**: Green (#10B981) - Positive actions
- **Warning**: Yellow (#F59E0B) - Caution
- **Error**: Red (#EF4444) - Errors and alerts

### Activity Colors
- Running: Red (#FF6B6B)
- Cycling: Teal (#4ECDC4)
- Hiking: Light Green (#95E1D3)
- Swimming: Cyan (#38B2AC)

### Difficulty Colors
- Easy: Green
- Medium: Yellow/Orange
- Hard: Red
- Extreme: Dark Red

### Typography
- Headings: Bold, System font
- Body: Regular, System font
- Sizes: xs (10), sm (12), base (14), md (16), lg (18), xl (20), xxl (24), xxxl (32)

---

## 🔧 Key Components

### ChallengeCard
- Displays challenge information
- Shows cover image, title, description
- Activity type badge with color coding
- Difficulty indicator
- Stats (date, distance, elevation)
- Organizer info with rating
- Participant count
- Ride sharing availability badge

### ClubCard
- Club branding (logo, cover photo)
- Member count and location
- Club type with icon
- Next event preview
- Membership type indicator

### HotelCard
- Hotel photo
- Star rating and review count
- Price per night
- Location and distance
- Amenities list
- Compact and full variants

### LiveMap (in LiveTrackingScreen)
- Real-time participant markers
- Route polyline
- Custom participant markers with photos
- Rank indicators with color coding
- Live updates

---

## 📊 Mock Data

The app uses comprehensive mock data including:

- **Current User**: Profile, stats, achievements
- **Challenges**: 4+ challenges with varying types and difficulties
- **Clubs**: 3+ clubs for different activities
- **Hotels**: 3+ hotels with photos and amenities
- **Restaurants**: 2+ restaurants
- **Ride Shares**: 2+ ride offers
- **Posts**: Social feed posts with stats
- **Live Tracking**: Real-time session with 3 participants

All mock data is in `src/data/mockData.js` and can be easily customized.

---

## 🚧 Prototype Limitations

This is a **UI/UX prototype** with the following limitations:

1. **No Backend** - All data is mocked, no real API calls
2. **No Authentication** - Login/signup not implemented
3. **No Real GPS** - Live tracking uses mock coordinates
4. **No Payments** - Payment flow is UI only
5. **No WhatsApp Integration** - WhatsApp buttons are placeholders
6. **No Push Notifications** - Notification system not implemented
7. **Static Maps** - Maps use mock data, not real routing

---

## 🎯 Next Steps (For Production)

### Phase 1: Backend Integration
- Set up API endpoints
- Implement authentication (JWT, OAuth)
- Real database integration
- File upload for photos

### Phase 2: Real-Time Features
- Implement actual GPS tracking
- WebSocket for live updates
- Push notifications
- Real-time chat

### Phase 3: Payments
- Integrate payment gateway (Stripe, PayPal)
- Escrow system for ride sharing
- Refund handling
- Transaction history

### Phase 4: Advanced Features
- AI-powered recommendations
- Route optimization
- Weather integration
- Social sharing to other platforms

### Phase 5: Performance
- Image optimization
- Caching strategies
- Offline support
- Analytics integration

---

## 🎨 UI/UX Inspiration

This app draws inspiration from:

- **Booking.com**: Hotel browsing, map views, filters
- **Strava**: Activity tracking, stats display, social feed
- **Uber**: Live tracking, cost splitting, driver/passenger flow

---

## 📝 License

This is a prototype project. All rights reserved.

---

## 👥 Contributing

This is a prototype for demonstration purposes. Not currently accepting contributions.

---

## 📧 Contact

For questions about this prototype, please contact the development team.

---

## 🙏 Acknowledgments

- React Native and Expo teams
- Community contributors to open-source libraries
- Design inspiration from Booking.com, Strava, and Uber

---

**Made with ❤️ for the fitness and adventure community**
