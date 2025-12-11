import api from './api';
import { API_ENDPOINTS } from '../config/api';

class NotificationService {
  // Get notifications
  async getNotifications(filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET, filters);
      return response.success ? response : { success: false, notifications: [], unreadCount: 0 };
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id) {
    try {
      const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      return response.success;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  // Mark all as read
  async markAllAsRead() {
    try {
      const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      return response.success;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
      return response.success;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      return response.success ? response.unreadCount : 0;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  // Update preferences
  async updatePreferences(preferences) {
    try {
      const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences);
      return response.success;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }
}

export default new NotificationService();
