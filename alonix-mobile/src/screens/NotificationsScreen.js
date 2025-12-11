import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import moment from 'moment';

const NotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupedNotifications, setGroupedNotifications] = useState({});

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications();
      setNotifications(result.notifications || []);
      groupNotifications(result.notifications || []);
    } catch (error) {
      console.error('Load notifications error:', error);
      Alert.alert('Error', error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const groupNotifications = (notifs) => {
    const grouped = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = moment();
    notifs.forEach(notif => {
      const notifTime = moment(notif.createdAt);
      const diffDays = now.diff(notifTime, 'days');

      if (diffDays === 0) {
        grouped.today.push(notif);
      } else if (diffDays === 1) {
        grouped.yesterday.push(notif);
      } else if (diffDays <= 7) {
        grouped.thisWeek.push(notif);
      } else {
        grouped.older.push(notif);
      }
    });

    setGroupedNotifications(grouped);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => notificationService.markAsRead(id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    setGroupedNotifications({ today: [], yesterday: [], thisWeek: [], older: [] });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationPress = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type
    const relatedId = notification.relatedEntity?.id;
    switch (notification.type) {
      case 'activity_invite':
      case 'activity_joined':
        if (relatedId) {
          navigation.navigate('ChallengeDetail', {
            challengeId: relatedId,
          });
        }
        break;
      case 'booking_update':
        if (relatedId) {
          navigation.navigate('MyBookings');
        }
        break;
      case 'message':
        if (relatedId) {
          navigation.navigate('Messages');
        }
        break;
      case 'club_invite':
      case 'club_event':
        if (relatedId) {
          navigation.navigate('ClubDetail', {
            clubId: relatedId,
          });
        }
        break;
      case 'sos_alert':
        if (relatedId) {
          navigation.navigate('LiveTracking', {
            activityId: relatedId,
          });
        }
        break;
      default:
        // No specific action
        break;
    }
  };

  const handleDeleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNotification(notificationId);
          },
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            await markAllAsRead();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllNotifications();
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'activity_invite':
      case 'activity_joined':
      case 'activity_cancelled':
        return { name: 'trophy', color: COLORS.secondary };
      case 'booking_update':
        return { name: 'checkmark-circle', color: COLORS.success };
      case 'message':
        return { name: 'chatbubble', color: COLORS.primary };
      case 'club_invite':
      case 'club_event':
        return { name: 'people', color: COLORS.accent };
      case 'sos_alert':
        return { name: 'warning', color: COLORS.error };
      case 'follow':
        return { name: 'person-add', color: COLORS.info };
      case 'system':
        return { name: 'settings', color: COLORS.gray };
      default:
        return { name: 'notifications', color: COLORS.primary };
    }
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    const timeAgo = moment(item.createdAt).fromNow();

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.read && styles.unreadCard,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>

            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>

            <Text style={styles.timestamp}>{timeAgo}</Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNotification(item._id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title, count) => {
    if (count === 0) return null;

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
    );
  };

  const renderGroupedNotifications = () => {
    const sections = [];

    if (groupedNotifications.today?.length > 0) {
      sections.push(
        <View key="today">
          {renderSectionHeader('Today', groupedNotifications.today.length)}
          {groupedNotifications.today.map(item => (
            <View key={item._id}>{renderNotification({ item })}</View>
          ))}
        </View>
      );
    }

    if (groupedNotifications.yesterday?.length > 0) {
      sections.push(
        <View key="yesterday">
          {renderSectionHeader('Yesterday', groupedNotifications.yesterday.length)}
          {groupedNotifications.yesterday.map(item => (
            <View key={item.id}>{renderNotification({ item })}</View>
          ))}
        </View>
      );
    }

    if (groupedNotifications.thisWeek?.length > 0) {
      sections.push(
        <View key="thisWeek">
          {renderSectionHeader('This Week', groupedNotifications.thisWeek.length)}
          {groupedNotifications.thisWeek.map(item => (
            <View key={item.id}>{renderNotification({ item })}</View>
          ))}
        </View>
      );
    }

    if (groupedNotifications.older?.length > 0) {
      sections.push(
        <View key="older">
          {renderSectionHeader('Older', groupedNotifications.older.length)}
          {groupedNotifications.older.map(item => (
            <View key={item.id}>{renderNotification({ item })}</View>
          ))}
        </View>
      );
    }

    return sections;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={80} color={COLORS.lightGray} />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>
        You're all caught up! Check back later for updates.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleMarkAllAsRead}
              >
                <Text style={styles.headerButtonText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClearAll}
            >
              <Text style={[styles.headerButtonText, { color: COLORS.error }]}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={[{ key: 'grouped' }]}
          renderItem={() => <View>{renderGroupedNotifications()}</View>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SIZES.margin / 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SIZES.padding,
  },
  headerButton: {
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    backgroundColor: COLORS.backgroundGray,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  sectionCount: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.margin,
    marginVertical: 4,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: SIZES.padding,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin / 2,
  },
  textContainer: {
    flex: 1,
    marginRight: SIZES.margin / 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.black,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  message: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin / 2,
  },
  emptyMessage: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
