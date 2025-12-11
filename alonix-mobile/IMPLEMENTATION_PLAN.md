# Alonix Mobile App - UI/UX Implementation Plan

## Executive Summary
The Alonix app is designed to connect people for fitness exploration activities in Mauritius. The core value proposition is **safety through live tracking** and **community building** for outdoor activities.

## Core App Vision

### Primary Purpose
Connect people who want to perform fitness/exploration activities together (cycling circumnavigation of Mauritius Island, hiking Le Morne, walking North to South, etc.)

### Key Differentiator
**SAFETY & SECURITY**:
- Live GPS tracking of all participants
- Real-time health data monitoring (heart rate, battery level)
- SOS alerts with location sharing
- Family safety: Parents can track kids/family members during group activities

### User Journey Flow
```
1. User wants to do an activity (e.g., cycle around Mauritius)
2. User creates activity or joins existing one
3. Users match based on activity, time, location
4. Optional: Book transport/accommodation through organizer or app
5. Activity starts → Live tracking begins
6. Everyone sees everyone's location, speed, distance, health data
7. Activity completes → Convert to club for future activities
```

## Critical Issues to Fix (Priority Order)

### 🔴 CRITICAL - Immediate Fixes

#### 1. Challenge Details Screen Empty
- **Issue**: Screen uses mock data, doesn't connect to backend
- **Fix**: Connect to `/api/activities/:id` endpoint
- **File**: `src/screens/ChallengeDetailScreen.js`
- **Impact**: Users can't view activity details

#### 2. Club Details Screen Empty
- **Issue**: Screen uses mock data, doesn't connect to backend
- **Fix**: Connect to `/api/clubs/:id` endpoint
- **File**: `src/screens/ClubDetailScreen.js`
- **Impact**: Users can't view club information

#### 3. Maps Showing Wrong Location
- **Issue**: Maps appear to show Kenya instead of Mauritius
- **Root Cause**: Likely initial region not set correctly in MapView components
- **Fix**: Ensure all maps default to Mauritius coordinates (-20.1644, 57.5046)
- **Files**:
  - `src/screens/HotelDetailScreen.js`
  - `src/screens/RestaurantDetailScreen.js`
  - `src/screens/UberStyleRideScreen.js`
  - `src/screens/DriverTrackingScreen.js`

### 🟡 HIGH PRIORITY - Core Features

#### 4. Organizer Service Provision UI
**What**: Allow activity organizers to offer transport/accommodation
**Example**: "I'm bringing a 5-seater car, everyone contributes Rs 500"

**UI Changes Needed**:
- Add "Offer Services" button in Create Activity screen
- Transport service form:
  - Vehicle type (Car 5-seater, Van 8-seater, etc.)
  - Total seats available
  - Contribution fee per person
  - Pickup location & time
- Accommodation service form:
  - Type (Camping tent, Hotel room share, etc.)
  - Max slots
  - Contribution fee per person
  - Location

**Backend Support**: Already exists in Activity model (`organizerServices`)

#### 5. Service Provider Booking in Activity Details
**What**: Show organizer's transport/accommodation offers in activity details
**UI**:
- "Transport Available" card showing vehicle type, seats, cost
- "Accommodation Available" card showing type, slots, cost
- "Book" button to reserve spot
- Display "X/Y seats booked"

#### 6. WhatsApp Integration for Hotels/Restaurants
**What**: Instead of form booking, direct WhatsApp link
**UI Changes**:
- Replace "Book Now" button with "Contact via WhatsApp"
- Generate pre-filled WhatsApp message with booking details
- Message format: "Hi, I'd like to book [restaurant/hotel] for [date/time/people]..."

**Implementation**:
```javascript
const handleWhatsAppBooking = () => {
  const message = `Hi, I'd like to book ${hotel.name} for...`;
  const whatsappUrl = `https://wa.me/${hotel.whatsappNumber}?text=${encodeURIComponent(message)}`;
  Linking.openURL(whatsappUrl);
};
```

### 🟢 MEDIUM PRIORITY - Enhanced Features

#### 7. Convert Activity to Club
**What**: After completing activities together, convert the group into a club
**When**: Show "Convert to Club" option after activity status = 'completed'
**UI**:
- In completed activity details, show "Convert to Club" button
- Modal to create club:
  - Club name (pre-fill with activity title)
  - Club description
  - Import all participants as members
  - Set activity type based on completed activity

#### 8. Enhanced Live Tracking with Health Data
**Current**: Shows location, distance, speed
**Add**:
- Heart rate display (from phone sensors or wearables)
- Battery level indicator
- Safety alerts:
  - Participant stopped moving for > 10 minutes
  - Participant too far from group (> 2km spread)
  - Low battery alert (< 20%)
  - Abnormal heart rate

**UI Changes in LiveTrackingScreen**:
- Add health icon next to each participant
- Color-coded battery indicator (green > 50%, yellow 20-50%, red < 20%)
- Heart rate badge
- Auto-SOS if participant hasn't moved in 15 minutes

#### 9. Club Push Notifications
**What**: Notify club members when organizer creates new activity
**Flow**:
1. Organizer creates activity
2. If organizer belongs to clubs, option to "Post to Club"
3. All club members get push notification
4. Members can confirm availability through the platform

#### 10. Phase 2 - Independent Booking
**What**: Allow users to book hotels, restaurants, taxis, attractions WITHOUT being in an activity
**Implementation**:
- Separate "Explore" tab with:
  - Hotels section
  - Restaurants section
  - Transport section
  - Attractions section
- Each maintains same WhatsApp booking flow
- No activity attachment required

### 🔵 FUTURE - Long-term Enhancements

#### 11. Vehicle Rental
- Add vehicle rental listings
- Tourists can rent bikes for island tours
- Car rental for supply transport
- Integration with rental companies via WhatsApp

#### 12. WhatsApp Bot for Bookings
- Automated WhatsApp bot to handle reservations
- Process availability checks
- Confirm bookings
- Send reminders

## Implementation Priority

### Sprint 1 (This Week)
1. ✅ Fix isParticipant() backend bug
2. 🔄 Fix Challenge Details Screen
3. 🔄 Fix Club Details Screen
4. 🔄 Fix map coordinates issue
5. 🔄 Add WhatsApp booking for hotels/restaurants

### Sprint 2 (Next Week)
6. Add organizer service provision UI
7. Add service booking in activity details
8. Enhance live tracking with health data
9. Add Convert to Club feature

### Sprint 3 (Week 3)
10. Club push notifications
11. Member availability confirmation
12. Activity history and statistics

### Phase 2 (Month 2)
13. Independent booking system
14. Vehicle rental integration
15. WhatsApp bot development

## Technical Architecture

### Core Technologies
- **Frontend**: React Native + Expo
- **Backend**: Node.js + Express + MongoDB
- **Real-time**: Socket.IO for live tracking
- **Maps**: React Native Maps
- **Notifications**: Expo Notifications
- **External Integration**: WhatsApp Business API

### Data Flow for Live Tracking
```
Mobile App (GPS)
  → Socket.IO emit('location-update')
  → Backend (ActivitySession.updateParticipantLocation)
  → MongoDB (store location)
  → Socket.IO broadcast('participant-location')
  → All participants receive update
  → Map updates in real-time
```

### Safety Features Architecture
```
Health Monitoring Service (runs every 30s)
  → Check participant locations
  → Calculate group spread
  → Check battery levels
  → Monitor movement patterns
  → Trigger alerts if anomalies detected
  → Send notifications to group/emergency contacts
```

## UI/UX Principles

### Design Language
- **Primary Color**: Based on activity type (running = blue, cycling = green, etc.)
- **Clean**: Minimal UI, focus on essential information
- **Safety-First**: Health/safety indicators always visible
- **Quick Actions**: Common actions accessible in 1-2 taps
- **Real-time Feedback**: Show live status, loading states, confirmations

### Mobile-First Considerations
- Large touch targets (min 44x44 pts)
- Offline support for critical features
- Battery optimization during live tracking
- GPS accuracy indicators
- Network status visibility

## Success Metrics

### User Engagement
- Number of activities created/joined per user per month
- Live tracking session duration
- Club formation rate after activities
- Repeat participation rate

### Safety Metrics
- SOS alerts triggered
- Response time to alerts
- Successful activity completions
- User-reported safety incidents

### Business Metrics
- Hotel/restaurant bookings via WhatsApp
- Transport service utilization
- Vehicle rental conversions
- User retention rate

## Next Steps

1. **Immediate**: Fix critical UI issues (Challenge/Club details, maps)
2. **This Week**: Implement WhatsApp integration
3. **Next Week**: Build organizer service provision
4. **Ongoing**: Enhance live tracking with health data

---

*Last Updated: 2025-12-09*
*Status: In Active Development*
