# Frontend-Backend Integration Guide

## Overview
This document tracks the integration of backend features with the frontend mobile app.

## Integration Status

### ✅ Completed
- [x] API Configuration updated
- [x] API Service updated for backend response format
- [x] Socket.IO Service created
- [x] Activity Service created
- [x] Club Service created
- [x] Notification Service created
- [x] Booking Service created
- [x] WhatsApp Service created
- [x] AuthContext integrated with real API

### 🔄 In Progress
- [ ] Activity Screens integration
- [ ] Club Screens integration
- [ ] Notification Screen integration
- [ ] Booking Screens integration
- [ ] Payment integration

### ⏳ Pending
- [ ] End-to-end testing
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Offline support

## API Base URL Configuration

Update `src/config/api.js` with your backend URL:

```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-production-url.com/api';  // Production
```

**Important Notes:**
- For Android emulator: Use `http://10.0.2.2:3000/api`
- For iOS simulator: Use `http://localhost:3000/api`
- For physical device: Use your computer's IP (e.g., `http://192.168.1.100:3000/api`)

## Services Created

### 1. ActivityService (`src/services/activityService.js`)
- `getActivities(filters)` - Get all activities
- `getNearbyActivities(longitude, latitude, radius)` - Find nearby activities
- `getActivity(id)` - Get activity details
- `createActivity(activityData)` - Create new activity
- `joinActivity(id)` - Join activity
- `leaveActivity(id)` - Leave activity
- `startSession(activityId)` - Start live tracking session
- `endSession(activityId)` - End session
- `getSession(activityId)` - Get active session
- `getSessionParticipants(activityId)` - Get live participants
- `getSessionHistory(activityId)` - Get session history

### 2. ClubService (`src/services/clubService.js`)
- `getClubs(filters)` - Get all clubs
- `getClub(id)` - Get club details
- `createClub(clubData)` - Create club
- `joinClub(id)` - Join club
- `leaveClub(id)` - Leave club
- `getClubEvents(clubId)` - Get club events
- `createClubEvent(clubId, eventData)` - Create event
- `confirmEventAvailability(clubId, eventId, status)` - Confirm availability

### 3. NotificationService (`src/services/notificationService.js`)
- `getNotifications(filters)` - Get notifications
- `markAsRead(id)` - Mark as read
- `markAllAsRead()` - Mark all as read
- `getUnreadCount()` - Get unread count

### 4. BookingService (`src/services/bookingService.js`)
- `bookHotel(bookingData)` - Book hotel
- `bookRestaurant(bookingData)` - Book restaurant
- `bookTaxi(bookingData)` - Book taxi
- `bookVehicle(bookingData)` - Book vehicle
- `getNearbyTaxis(longitude, latitude)` - Find nearby taxis
- `getAvailableVehicles(filters)` - Get available vehicles
- `getUserBookings(userId)` - Get user bookings
- `cancelBooking(id)` - Cancel booking

### 5. WhatsAppService (`src/services/whatsappService.js`)
- `getHotelLink(hotelId, inquiryType, bookingData)` - Get hotel WhatsApp link
- `getRestaurantLink(restaurantId, inquiryType, bookingData)` - Get restaurant WhatsApp link
- `openHotelWhatsApp(hotelId, ...)` - Open hotel WhatsApp directly
- `openRestaurantWhatsApp(restaurantId, ...)` - Open restaurant WhatsApp directly

### 6. SocketService (`src/services/socketService.js`)
- `connect(token)` - Connect to socket server
- `joinActivity(activityId, userId)` - Join activity room
- `sendLocationUpdate(activityId, userId, location, stats)` - Send location update
- `sendSOSAlert(activityId, userId, location, reason)` - Send SOS alert
- `on(event, callback)` - Listen to socket events
- `disconnect()` - Disconnect socket

## Screens to Update

### Priority 1: Core Features
1. **ActivityScreen.js** - Replace mock data with API calls
2. **ActivityDetailScreen.js** - Load real activity data, join/leave functionality
3. **LiveTrackingScreen.js** - Integrate Socket.IO, real-time tracking
4. **CreateScreen.js** - Create activity with API

### Priority 2: Social Features
5. **ClubDetailScreen.js** - Load real club data, join/leave
6. **NotificationsScreen.js** - Load real notifications

### Priority 3: Booking Features
7. **MyBookingsScreen.js** - Load user bookings
8. **HotelDetailScreen.js** - WhatsApp integration
9. **CarBookingScreen.js** - Vehicle booking integration

## Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Logout
- [ ] Token refresh on app restart

### Activities
- [ ] Create activity
- [ ] View activities list
- [ ] Filter activities
- [ ] Join activity
- [ ] Leave activity
- [ ] View activity details

### Live Tracking
- [ ] Start session (organizer)
- [ ] Join session (participant)
- [ ] Send location updates
- [ ] Receive location updates
- [ ] View live map
- [ ] End session

### Clubs
- [ ] Create club
- [ ] View clubs list
- [ ] Join club
- [ ] Create club event
- [ ] Confirm availability

### Notifications
- [ ] Receive notifications
- [ ] Mark as read
- [ ] Delete notification

### Bookings
- [ ] Book hotel
- [ ] Book restaurant
- [ ] Book taxi
- [ ] Book vehicle
- [ ] View bookings
- [ ] Cancel booking

### WhatsApp
- [ ] Open hotel WhatsApp
- [ ] Open restaurant WhatsApp

## Error Handling

All services throw errors that should be caught in screens:

```javascript
try {
  const activities = await activityService.getActivities();
  // Handle success
} catch (error) {
  // Handle error
  Alert.alert('Error', error.message || 'Failed to load activities');
}
```

## Next Steps

1. Update ActivityScreen to use ActivityService
2. Update ActivityDetailScreen with join/leave
3. Update LiveTrackingScreen with Socket.IO
4. Update ClubDetailScreen
5. Update NotificationsScreen
6. Test each integration
7. End-to-end testing

