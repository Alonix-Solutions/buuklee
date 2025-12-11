// Backend API URL Configuration
// Update this to match your setup:
// - Android Emulator: http://10.0.2.2:3000/api
// - iOS Simulator: http://localhost:3000/api  
// - Physical Device: http://YOUR_COMPUTER_IP:3000/api (e.g., http://192.168.1.100:3000/api)

// Backend API URL - Update based on your device:
// Android Emulator: http://10.0.2.2:3000/api
// iOS Simulator: http://localhost:3000/api
// Physical Device: http://YOUR_COMPUTER_IP:3000/api (find with ipconfig/ifconfig)

export const API_BASE_URL = __DEV__
  ? 'http://10.79.44.242:3000/api'  // Development - Local server
  : 'https://alonix-backend.azurewebsites.net/api';  // Production - Azure

// Google Places API Configuration
// Get your API key from: https://console.cloud.google.com/apis/credentials
export const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY_HERE'; // Replace with your actual API key
export const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },

  // Users
  USERS: {
    BASE: '/users',
    ME: '/users/me',
    PROFILE: (id) => `/users/${id}`,
    UPDATE: '/users/me',
    STATS: (id) => `/users/${id}/stats`,
  },

  // Activities
  ACTIVITIES: {
    BASE: '/activities',
    CREATE: '/activities',
    GET: (id) => `/activities/${id}`,
    UPDATE: (id) => `/activities/${id}`,
    DELETE: (id) => `/activities/${id}`,
    JOIN: (id) => `/activities/${id}/join`,
    LEAVE: (id) => `/activities/${id}/leave`,
    NEARBY: '/activities/nearby',
    USER: (userId) => `/activities/user/${userId}`,
    BOOK_SERVICE: (id) => `/activities/${id}/book-service`,
    // Session Management
    START_SESSION: (id) => `/activities/${id}/start-session`,
    END_SESSION: (id) => `/activities/${id}/end-session`,
    GET_SESSION: (id) => `/activities/${id}/session`,
    GET_PARTICIPANTS: (id) => `/activities/${id}/session/participants`,
    GET_SESSIONS: (id) => `/activities/${id}/sessions`,
    GET_SESSION_DETAILS: (id, sessionId) => `/activities/${id}/sessions/${sessionId}`,
    SESSION_RESULTS: (sessionId) => `/activities/sessions/${sessionId}/results`,
    RATE: (id) => `/activities/${id}/rate`,
  },

  // Clubs
  CLUBS: {
    BASE: '/clubs',
    CREATE: '/clubs',
    GET: (id) => `/clubs/${id}`,
    JOIN: (id) => `/clubs/${id}/join`,
    LEAVE: (id) => `/clubs/${id}/leave`,
    USER: (userId) => `/clubs/user/${userId}`,
    EVENTS: (id) => `/clubs/${id}/events`,
    CREATE_EVENT: (id) => `/clubs/${id}/events`,
    CONFIRM_EVENT: (id, eventId) => `/clubs/${id}/events/${eventId}/confirm`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    GET: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id) => `/notifications/${id}`,
    UNREAD_COUNT: '/notifications/unread-count',
    PREFERENCES: '/notifications/preferences',
  },

  // Bookings
  BOOKINGS: {
    BASE: '/bookings',
    HOTEL: '/bookings/hotels',
    RESTAURANT: '/bookings/restaurants',
    TAXI: '/bookings/taxis',
    VEHICLE: '/bookings/vehicles',
    GET: (id) => `/bookings/${id}`,
    USER: (userId) => `/bookings/user/${userId}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
    NEARBY_TAXIS: '/bookings/nearby-taxis',
    AVAILABLE_VEHICLES: '/bookings/available-vehicles',
  },

  // Drivers
  DRIVERS: {
    BASE: '/drivers',
    GET: (id) => `/drivers/${id}`,
    AVAILABLE: '/drivers/available',
    NEARBY: '/drivers/nearby',
    RATE: (id) => `/drivers/${id}/rate`,
  },

  // Vehicles (Car Rentals)
  VEHICLES: {
    BASE: '/vehicles',
    GET: (id) => `/vehicles/${id}`,
    AVAILABLE: '/vehicles/available',
    BOOK: (id) => `/vehicles/${id}/book`,
    CANCEL: (id) => `/vehicles/${id}/cancel`,
  },

  // Posts (Activity Feed)
  POSTS: {
    BASE: '/posts',
    GET: (id) => `/posts/${id}`,
    USER: (userId) => `/posts/user/${userId}`,
    CREATE: '/posts',
    LIKE: (id) => `/posts/${id}/like`,
    COMMENT: (id) => `/posts/${id}/comments`,
    FEED: '/posts/feed',
  },

  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    GET: (id) => `/reviews/${id}`,
    ENTITY: (type, id) => `/reviews/${type}/${id}`,
    CREATE: '/reviews',
    USER: (userId) => `/reviews/user/${userId}`,
  },

  // WhatsApp
  WHATSAPP: {
    HOTEL: (id) => `/whatsapp/hotel/${id}`,
    RESTAURANT: (id) => `/whatsapp/restaurant/${id}`,
    GENERATE_LINK: '/whatsapp/generate-link',
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    REFUND: '/payments/refund',
    WEBHOOK: '/payments/webhook',
  },

  // Hotels
  HOTELS: {
    BASE: '/hotels',
    GET: (id) => `/hotels/${id}`,
  },

  // Restaurants
  RESTAURANTS: {
    BASE: '/restaurants',
    GET: (id) => `/restaurants/${id}`,
  },

  // SOS
  SOS: {
    ALERT: '/sos/alert',
    ACTIVE: '/sos/active',
    RESPOND: (id) => `/sos/${id}/respond`,
    RESOLVE: (id) => `/sos/${id}/resolve`,
    ACTIVITY: (activityId) => `/sos/activity/${activityId}`,
  },
};
