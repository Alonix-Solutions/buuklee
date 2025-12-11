import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Notification Categories
export const NOTIFICATION_CATEGORIES = {
  CHALLENGE_INVITE: 'challenge_invite',
  BOOKING_CONFIRMED: 'booking_confirmed',
  RIDE_MATCHED: 'ride_matched',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  MESSAGE_RECEIVED: 'message_received',
  FRIEND_REQUEST: 'friend_request',
  CLUB_INVITE: 'club_invite',
  SYSTEM: 'system',
  REMINDER: 'reminder',
};

// Notification Sound Patterns
const SOUND_PATTERNS = {
  [NOTIFICATION_CATEGORIES.CHALLENGE_INVITE]: { sound: 'default', vibrate: [0, 250, 250, 250] },
  [NOTIFICATION_CATEGORIES.BOOKING_CONFIRMED]: { sound: 'default', vibrate: [0, 500] },
  [NOTIFICATION_CATEGORIES.RIDE_MATCHED]: { sound: 'default', vibrate: [0, 100, 100, 100, 100, 100] },
  [NOTIFICATION_CATEGORIES.ACHIEVEMENT_UNLOCKED]: { sound: 'default', vibrate: [0, 200, 100, 200] },
  [NOTIFICATION_CATEGORIES.MESSAGE_RECEIVED]: { sound: 'default', vibrate: [0, 150] },
  [NOTIFICATION_CATEGORIES.FRIEND_REQUEST]: { sound: 'default', vibrate: [0, 200, 100, 200] },
  [NOTIFICATION_CATEGORIES.CLUB_INVITE]: { sound: 'default', vibrate: [0, 250, 250, 250] },
  [NOTIFICATION_CATEGORIES.SYSTEM]: { sound: 'default', vibrate: [0, 300] },
  [NOTIFICATION_CATEGORIES.REMINDER]: { sound: 'default', vibrate: [0, 200] },
};

// Deep link routes for navigation
const DEEP_LINK_ROUTES = {
  [NOTIFICATION_CATEGORIES.CHALLENGE_INVITE]: 'Challenges',
  [NOTIFICATION_CATEGORIES.BOOKING_CONFIRMED]: 'Bookings',
  [NOTIFICATION_CATEGORIES.RIDE_MATCHED]: 'Rides',
  [NOTIFICATION_CATEGORIES.ACHIEVEMENT_UNLOCKED]: 'Achievements',
  [NOTIFICATION_CATEGORIES.MESSAGE_RECEIVED]: 'Messages',
  [NOTIFICATION_CATEGORIES.FRIEND_REQUEST]: 'Friends',
  [NOTIFICATION_CATEGORIES.CLUB_INVITE]: 'Clubs',
  [NOTIFICATION_CATEGORIES.SYSTEM]: 'Home',
  [NOTIFICATION_CATEGORIES.REMINDER]: 'ActivityTracker',
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const category = notification.request.content.data?.category || NOTIFICATION_CATEGORIES.SYSTEM;
    const preferences = await PushNotificationService.getNotificationPreferences();

    // Check Do Not Disturb
    if (preferences.doNotDisturb) {
      const now = new Date();
      const currentHour = now.getHours();
      const { startHour, endHour } = preferences.doNotDisturbHours;

      if (startHour <= endHour) {
        if (currentHour >= startHour && currentHour < endHour) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: true,
          };
        }
      } else {
        if (currentHour >= startHour || currentHour < endHour) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: true,
          };
        }
      }
    }

    // Check if category is muted
    if (preferences.mutedCategories.includes(category)) {
      return {
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
      };
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: !preferences.muteAll,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    };
  },
});

class PushNotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.backgroundListener = null;
    this.expoPushToken = null;
    this.fcmToken = null;
    this.navigationRef = null;
  }

  // Initialize notification service
  async initialize(navigationRef = null) {
    try {
      this.navigationRef = navigationRef;

      // Request permissions
      const permissionResult = await this.requestPermissions();

      if (!permissionResult.success) {
        console.warn('Notification permissions not granted');
        return { success: false, error: 'Permissions not granted' };
      }

      // Get push token
      const token = await this.getExpoPushToken();

      // Set up notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupNotificationChannels();
      }

      // Set up listeners
      this.setupNotificationListeners();

      // Load and apply preferences
      await this.loadNotificationPreferences();

      console.log('Push notification service initialized successfully');
      return { success: true, token };
    } catch (error) {
      console.error('Error initializing push notification service:', error);
      return { success: false, error: error.message };
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return { success: false, error: 'Must use physical device' };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return { success: false, error: 'Permission not granted' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Expo push token
  async getExpoPushToken() {
    try {
      if (this.expoPushToken) {
        return this.expoPushToken;
      }

      // Configure project ID for Expo SDK 49+
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      const token = tokenData.data;
      this.expoPushToken = token;

      // Save token to storage
      await AsyncStorage.setItem('@expo_push_token', token);

      // TODO: Send token to your backend
      // await this.registerTokenWithBackend(token);

      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Setup Android notification channels
  async setupNotificationChannels() {
    try {
      if (Platform.OS !== 'android') {
        return;
      }

      // Default channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
        sound: 'default',
      });

      // Challenge invites
      await Notifications.setNotificationChannelAsync('challenges', {
        name: 'Challenges',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: 'default',
      });

      // Messages
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 150],
        lightColor: '#10B981',
        sound: 'default',
      });

      // Bookings
      await Notifications.setNotificationChannelAsync('bookings', {
        name: 'Bookings',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500],
        lightColor: '#3B82F6',
        sound: 'default',
      });

      // Achievements
      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#FBBF24',
        sound: 'default',
      });

      // Rides
      await Notifications.setNotificationChannelAsync('rides', {
        name: 'Rides',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 100, 100, 100, 100, 100],
        lightColor: '#8B5CF6',
        sound: 'default',
      });

      console.log('Notification channels set up successfully');
    } catch (error) {
      console.error('Error setting up notification channels:', error);
    }
  }

  // Setup notification listeners
  setupNotificationListeners() {
    // Foreground notification listener
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );

    // Notification response listener (user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );

    // Background notification listener
    this.backgroundListener = Notifications.addNotificationReceivedListener(
      this.handleBackgroundNotification.bind(this)
    );
  }

  // Handle notification received (foreground)
  async handleNotificationReceived(notification) {
    try {
      const { title, body, data } = notification.request.content;
      const category = data?.category || NOTIFICATION_CATEGORIES.SYSTEM;

      console.log('Notification received:', { title, body, category });

      // Trigger custom vibration pattern
      const pattern = SOUND_PATTERNS[category];
      if (pattern && pattern.vibrate) {
        Vibration.vibrate(pattern.vibrate);
      }

      // Update badge count
      await this.incrementBadgeCount();

      // Store notification in local storage
      await this.storeNotification({
        id: notification.request.identifier,
        title,
        message: body,
        type: category,
        timestamp: new Date().toISOString(),
        read: false,
        data,
      });
    } catch (error) {
      console.error('Error handling notification received:', error);
    }
  }

  // Handle notification response (user taps notification)
  async handleNotificationResponse(response) {
    try {
      const { notification } = response;
      const { data } = notification.request.content;
      const category = data?.category || NOTIFICATION_CATEGORIES.SYSTEM;

      console.log('Notification tapped:', { category, data });

      // Navigate to appropriate screen
      this.navigateToScreen(category, data);

      // Mark notification as read
      const notificationId = notification.request.identifier;
      await this.markNotificationAsRead(notificationId);

      // Decrement badge count
      await this.decrementBadgeCount();
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  }

  // Handle background notification
  async handleBackgroundNotification(notification) {
    try {
      console.log('Background notification:', notification);
      // Additional background handling if needed
    } catch (error) {
      console.error('Error handling background notification:', error);
    }
  }

  // Navigate to screen based on notification category
  navigateToScreen(category, data) {
    try {
      if (!this.navigationRef) {
        console.warn('Navigation ref not set');
        return;
      }

      const route = DEEP_LINK_ROUTES[category] || 'Home';

      // Navigate with data
      this.navigationRef.navigate(route, {
        notificationData: data,
        fromNotification: true,
      });
    } catch (error) {
      console.error('Error navigating to screen:', error);
    }
  }

  // Schedule local notification
  async scheduleLocalNotification(notification) {
    try {
      const {
        title,
        body,
        data = {},
        trigger = null,
        category = NOTIFICATION_CATEGORIES.SYSTEM,
        sound = true,
      } = notification;

      const soundPattern = SOUND_PATTERNS[category];
      const channelId = this.getChannelId(category);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title || 'Alonix',
          body: body || '',
          data: { ...data, category },
          sound: sound ? soundPattern.sound : false,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: category,
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: trigger || null, // null means immediate
      });

      return { success: true, notificationId };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get channel ID based on category
  getChannelId(category) {
    const channelMap = {
      [NOTIFICATION_CATEGORIES.CHALLENGE_INVITE]: 'challenges',
      [NOTIFICATION_CATEGORIES.MESSAGE_RECEIVED]: 'messages',
      [NOTIFICATION_CATEGORIES.BOOKING_CONFIRMED]: 'bookings',
      [NOTIFICATION_CATEGORIES.ACHIEVEMENT_UNLOCKED]: 'achievements',
      [NOTIFICATION_CATEGORIES.RIDE_MATCHED]: 'rides',
    };

    return channelMap[category] || 'default';
  }

  // Cancel notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true };
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all delivered notifications
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
      return { success: true };
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Badge count management
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
      await AsyncStorage.setItem('@badge_count', count.toString());
      return { success: true };
    } catch (error) {
      console.error('Error setting badge count:', error);
      return { success: false, error: error.message };
    }
  }

  async getBadgeCount() {
    try {
      const count = await AsyncStorage.getItem('@badge_count');
      return parseInt(count || '0', 10);
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async incrementBadgeCount() {
    try {
      const count = await this.getBadgeCount();
      await this.setBadgeCount(count + 1);
    } catch (error) {
      console.error('Error incrementing badge count:', error);
    }
  }

  async decrementBadgeCount() {
    try {
      const count = await this.getBadgeCount();
      await this.setBadgeCount(Math.max(0, count - 1));
    } catch (error) {
      console.error('Error decrementing badge count:', error);
    }
  }

  // Store notification locally
  async storeNotification(notification) {
    try {
      const stored = await AsyncStorage.getItem('@notifications');
      const notifications = stored ? JSON.parse(stored) : [];

      notifications.unshift(notification);

      // Keep only last 100 notifications
      const trimmed = notifications.slice(0, 100);

      await AsyncStorage.setItem('@notifications', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const stored = await AsyncStorage.getItem('@notifications');
      if (!stored) return;

      const notifications = JSON.parse(stored);
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      await AsyncStorage.setItem('@notifications', JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Notification preferences
  static async getNotificationPreferences() {
    try {
      const stored = await AsyncStorage.getItem('@notification_preferences');

      if (stored) {
        return JSON.parse(stored);
      }

      // Default preferences
      return {
        muteAll: false,
        doNotDisturb: false,
        doNotDisturbHours: { startHour: 22, endHour: 7 },
        mutedCategories: [],
        vibrationEnabled: true,
        soundEnabled: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        muteAll: false,
        doNotDisturb: false,
        doNotDisturbHours: { startHour: 22, endHour: 7 },
        mutedCategories: [],
        vibrationEnabled: true,
        soundEnabled: true,
      };
    }
  }

  async saveNotificationPreferences(preferences) {
    try {
      await AsyncStorage.setItem('@notification_preferences', JSON.stringify(preferences));
      return { success: true };
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  async loadNotificationPreferences() {
    try {
      const preferences = await PushNotificationService.getNotificationPreferences();
      return { success: true, preferences };
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Predefined notification templates
  createNotification = {
    challengeInvite: (inviterName, challengeName, challengeId) => ({
      title: '🏆 Challenge Invitation',
      body: `${inviterName} invited you to join "${challengeName}"`,
      category: NOTIFICATION_CATEGORIES.CHALLENGE_INVITE,
      data: { challengeId, inviterName, challengeName },
    }),

    bookingConfirmed: (bookingType, name, bookingId) => ({
      title: '✓ Booking Confirmed',
      body: `Your ${bookingType} reservation at ${name} is confirmed`,
      category: NOTIFICATION_CATEGORIES.BOOKING_CONFIRMED,
      data: { bookingId, bookingType, name },
    }),

    rideMatched: (driverName, eta, rideId) => ({
      title: '🚗 Ride Matched',
      body: `${driverName} is ${eta} away`,
      category: NOTIFICATION_CATEGORIES.RIDE_MATCHED,
      data: { rideId, driverName, eta },
    }),

    achievementUnlocked: (badgeName, description, achievementId) => ({
      title: '🎉 Achievement Unlocked!',
      body: `You earned "${badgeName}" - ${description}`,
      category: NOTIFICATION_CATEGORIES.ACHIEVEMENT_UNLOCKED,
      data: { achievementId, badgeName, description },
    }),

    messageReceived: (senderName, message, conversationId) => ({
      title: `💬 ${senderName}`,
      body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      category: NOTIFICATION_CATEGORIES.MESSAGE_RECEIVED,
      data: { conversationId, senderName, message },
    }),

    friendRequest: (userName, userId) => ({
      title: '👋 Friend Request',
      body: `${userName} wants to connect with you`,
      category: NOTIFICATION_CATEGORIES.FRIEND_REQUEST,
      data: { userId, userName },
    }),

    clubInvite: (clubName, clubId) => ({
      title: '🎯 Club Invitation',
      body: `You've been invited to join "${clubName}"`,
      category: NOTIFICATION_CATEGORIES.CLUB_INVITE,
      data: { clubId, clubName },
    }),

    reminder: (title, message) => ({
      title: `⏰ ${title}`,
      body: message,
      category: NOTIFICATION_CATEGORIES.REMINDER,
      data: { type: 'reminder' },
    }),
  };

  // Remove listeners
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    if (this.backgroundListener) {
      Notifications.removeNotificationSubscription(this.backgroundListener);
      this.backgroundListener = null;
    }
  }

  // Cleanup
  cleanup() {
    this.removeListeners();
    this.expoPushToken = null;
    this.fcmToken = null;
    this.navigationRef = null;
  }
}

// Export singleton instance
const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
