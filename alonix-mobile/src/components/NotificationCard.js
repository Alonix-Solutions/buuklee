import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { NOTIFICATION_CATEGORIES } from '../services/PushNotificationService';

// Notification icon and color mapping
const NOTIFICATION_CONFIG = {
  [NOTIFICATION_CATEGORIES.CHALLENGE_INVITE]: {
    icon: 'trophy',
    color: '#FF6B35',
    bgColor: '#FFF1EC',
  },
  [NOTIFICATION_CATEGORIES.BOOKING_CONFIRMED]: {
    icon: 'checkmark-circle',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  [NOTIFICATION_CATEGORIES.RIDE_MATCHED]: {
    icon: 'car',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  [NOTIFICATION_CATEGORIES.ACHIEVEMENT_UNLOCKED]: {
    icon: 'ribbon',
    color: '#FBBF24',
    bgColor: '#FFFBEB',
  },
  [NOTIFICATION_CATEGORIES.MESSAGE_RECEIVED]: {
    icon: 'chatbubble',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  [NOTIFICATION_CATEGORIES.FRIEND_REQUEST]: {
    icon: 'person-add',
    color: '#EC4899',
    bgColor: '#FDF2F8',
  },
  [NOTIFICATION_CATEGORIES.CLUB_INVITE]: {
    icon: 'people',
    color: '#6366F1',
    bgColor: '#EEF2FF',
  },
  [NOTIFICATION_CATEGORIES.SYSTEM]: {
    icon: 'information-circle',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
  [NOTIFICATION_CATEGORIES.REMINDER]: {
    icon: 'alarm',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
};

const NotificationCard = ({
  notification,
  onPress,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}) => {
  const [swipeAnimation] = useState(new Animated.Value(0));
  const [deleteAnimation] = useState(new Animated.Value(1));

  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG[NOTIFICATION_CATEGORIES.SYSTEM];

  // Create PanResponder for swipe gesture
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      // Only allow left swipe
      if (gestureState.dx < 0) {
        swipeAnimation.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -100) {
        // Swipe threshold reached - delete
        handleSwipeDelete();
      } else {
        // Return to original position
        Animated.spring(swipeAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }).start();
      }
    },
  });

  // Handle swipe to delete
  const handleSwipeDelete = () => {
    Animated.timing(swipeAnimation, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(deleteAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        if (onDelete) {
          onDelete(notification.id);
        }
      });
    });
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    const now = moment();
    const notificationTime = moment(timestamp);
    const diffMinutes = now.diff(notificationTime, 'minutes');
    const diffHours = now.diff(notificationTime, 'hours');
    const diffDays = now.diff(notificationTime, 'days');

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return notificationTime.format('MMM D');
    }
  };

  // Handle card press
  const handlePress = () => {
    if (onPress) {
      onPress(notification);
    }
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  // Handle mark as read/unread
  const handleToggleRead = () => {
    if (notification.read) {
      if (onMarkAsUnread) {
        onMarkAsUnread(notification.id);
      }
    } else {
      if (onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: deleteAnimation,
          transform: [
            {
              scale: deleteAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.card,
          notification.read ? styles.readCard : styles.unreadCard,
          {
            transform: [{ translateX: swipeAnimation }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {/* Left indicator for unread */}
          {!notification.read && <View style={styles.unreadIndicator} />}

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon} size={24} color={config.color} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  notification.read ? styles.readTitle : styles.unreadTitle,
                ]}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              <Text style={styles.time}>{formatTimeAgo(notification.timestamp)}</Text>
            </View>

            <Text
              style={[
                styles.message,
                notification.read ? styles.readMessage : styles.unreadMessage,
              ]}
              numberOfLines={2}
            >
              {notification.message}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleRead}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={notification.read ? 'mail-unread-outline' : 'mail-open-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Delete button revealed on swipe */}
      <View style={styles.deleteContainer}>
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        <Text style={styles.deleteText}>Delete</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 1,
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  readCard: {
    opacity: 0.8,
  },
  unreadCard: {
    opacity: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 12,
  },
  unreadIndicator: {
    width: 4,
    height: '100%',
    backgroundColor: '#4F46E5',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  readTitle: {
    fontWeight: '500',
    color: '#6B7280',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadMessage: {
    color: '#4B5563',
  },
  readMessage: {
    color: '#9CA3AF',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  deleteContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NotificationCard;
