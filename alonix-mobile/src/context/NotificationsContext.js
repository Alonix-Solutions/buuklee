import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext({});

// Notification types
export const NOTIFICATION_TYPES = {
  CHALLENGE_INVITE: 'challenge_invite',
  BOOKING_CONFIRM: 'booking_confirm',
  MESSAGE: 'message',
  ACHIEVEMENT: 'achievement',
  FRIEND_REQUEST: 'friend_request',
  RIDE_UPDATE: 'ride_update',
  CLUB_INVITE: 'club_invite',
  SYSTEM: 'system',
};

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications from storage on mount
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [user]);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Load notifications from AsyncStorage
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('@notifications');

      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
      } else {
        // Initialize with mock notifications for demo
        const mockNotifications = generateMockNotifications();
        setNotifications(mockNotifications);
        await saveNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save notifications to AsyncStorage
  const saveNotifications = async (notificationsData) => {
    try {
      await AsyncStorage.setItem('@notifications', JSON.stringify(notificationsData));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  // Get all notifications
  const getNotifications = () => {
    return notifications;
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  // Get notifications grouped by date
  const getGroupedNotifications = () => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach(notification => {
      const notifDate = new Date(notification.timestamp);
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      if (notifDay.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notifDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notifDate >= weekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
      await saveNotifications(updated);
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      await saveNotifications(updated);
      return { success: true };
    } catch (error) {
      console.error('Error marking all as read:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const updated = notifications.filter(n => n.id !== notificationId);
      setNotifications(updated);
      await saveNotifications(updated);
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem('@notifications');
      return { success: true };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, error: error.message };
    }
  };

  // Add new notification
  const addNotification = async (notification) => {
    try {
      const newNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification,
      };

      const updated = [newNotification, ...notifications];
      setNotifications(updated);
      await saveNotifications(updated);

      return { success: true, notification: newNotification };
    } catch (error) {
      console.error('Error adding notification:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    getNotifications,
    getUnreadNotifications,
    getGroupedNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom hook to use notifications context
export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
};

// Generate mock notifications for demo
const generateMockNotifications = () => {
  const now = new Date();

  return [
    {
      id: '1',
      type: NOTIFICATION_TYPES.CHALLENGE_INVITE,
      title: 'Challenge Invitation',
      message: 'Sarah invited you to join "Mountain Peak Challenge"',
      timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      read: false,
      data: {
        challengeId: 'ch1',
        inviterId: 'user2',
        inviterName: 'Sarah Johnson',
      },
    },
    {
      id: '2',
      type: NOTIFICATION_TYPES.BOOKING_CONFIRM,
      title: 'Booking Confirmed',
      message: 'Your hotel reservation at Grand Plaza is confirmed',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false,
      data: {
        bookingId: 'bk123',
        hotelName: 'Grand Plaza',
      },
    },
    {
      id: '3',
      type: NOTIFICATION_TYPES.MESSAGE,
      title: 'New Message',
      message: 'Mike: "Are you ready for tomorrow\'s ride?"',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      read: true,
      data: {
        conversationId: 'conv1',
        senderId: 'user3',
        senderName: 'Mike Chen',
      },
    },
    {
      id: '4',
      type: NOTIFICATION_TYPES.ACHIEVEMENT,
      title: 'Achievement Unlocked!',
      message: 'You earned the "Century Rider" badge - 100km cycling',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: true,
      data: {
        achievementId: 'ach1',
        badgeName: 'Century Rider',
      },
    },
    {
      id: '5',
      type: NOTIFICATION_TYPES.FRIEND_REQUEST,
      title: 'Friend Request',
      message: 'Alex Martinez wants to connect with you',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      read: true,
      data: {
        userId: 'user4',
        userName: 'Alex Martinez',
      },
    },
    {
      id: '6',
      type: NOTIFICATION_TYPES.RIDE_UPDATE,
      title: 'Driver Arriving',
      message: 'Your driver is 2 minutes away',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      read: true,
      data: {
        rideId: 'ride123',
        driverName: 'John Doe',
        eta: '2 min',
      },
    },
    {
      id: '7',
      type: NOTIFICATION_TYPES.CLUB_INVITE,
      title: 'Club Invitation',
      message: 'You\'ve been invited to join "City Cyclists" club',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      read: true,
      data: {
        clubId: 'club1',
        clubName: 'City Cyclists',
      },
    },
    {
      id: '8',
      type: NOTIFICATION_TYPES.SYSTEM,
      title: 'App Update Available',
      message: 'Version 2.0 is now available with new features',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      read: true,
      data: {
        version: '2.0',
      },
    },
  ];
};

export default NotificationsContext;
