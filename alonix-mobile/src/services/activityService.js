import api from './api';
import { API_ENDPOINTS } from '../config/api';

class ActivityService {
  // Get all activities with filters
  async getActivities(filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.BASE, filters);
      return response.success ? response : { success: false, activities: [], pagination: {} };
    } catch (error) {
      console.error('Get activities error:', error);
      throw error;
    }
  }

  // Get nearby activities
  async getNearbyActivities(longitude, latitude, radius = 50) {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.NEARBY, {
        longitude,
        latitude,
        radius
      });
      return response.success ? response : { success: false, activities: [] };
    } catch (error) {
      console.error('Get nearby activities error:', error);
      throw error;
    }
  }

  // Get activity by ID
  async getActivity(id) {
    try {
      if (!id) {
        console.warn('getActivity called with no ID');
        return null;
      }
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.GET(id));
      return response.success ? response.activity : null;
    } catch (error) {
      console.error('Get activity error:', error);
      // Return null instead of throwing to prevent app crashes
      return null;
    }
  }

  // Create activity
  async createActivity(activityData) {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.CREATE, activityData);
      return response.success ? response.activity : null;
    } catch (error) {
      console.error('Create activity error:', error);
      throw error;
    }
  }

  // Update activity
  async updateActivity(id, updates) {
    try {
      const response = await api.put(API_ENDPOINTS.ACTIVITIES.UPDATE(id), updates);
      return response.success ? response.activity : null;
    } catch (error) {
      console.error('Update activity error:', error);
      throw error;
    }
  }

  // Delete activity
  async deleteActivity(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.ACTIVITIES.DELETE(id));
      return response.success;
    } catch (error) {
      console.error('Delete activity error:', error);
      throw error;
    }
  }

  // Join activity
  async joinActivity(id) {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.JOIN(id));
      return response.success ? response.activity : null;
    } catch (error) {
      console.error('Join activity error:', error);
      throw error;
    }
  }

  // Leave activity
  async leaveActivity(id) {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.LEAVE(id));
      return response.success;
    } catch (error) {
      console.error('Leave activity error:', error);
      throw error;
    }
  }

  // Book organizer service (transport/accommodation)
  async bookService(activityId, serviceType, quantity = 1) {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.BOOK_SERVICE(activityId), {
        serviceType,
        quantity
      });
      return response.success ? response.activity : null;
    } catch (error) {
      console.error('Book service error:', error);
      throw error;
    }
  }

  // Get user's activities
  async getUserActivities(userId, type = 'all', status = 'all') {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.USER(userId), { type, status });
      return response.success ? response.activities : [];
    } catch (error) {
      console.error('Get user activities error:', error);
      throw error;
    }
  }

  // Session Management
  async startSession(activityId) {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.START_SESSION(activityId));
      return response.success ? response.session : null;
    } catch (error) {
      console.error('Start session error:', error);
      throw error;
    }
  }

  async endSession(activityId) {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.END_SESSION(activityId));
      return response.success ? response.session : null;
    } catch (error) {
      console.error('End session error:', error);
      throw error;
    }
  }

  async getSession(activityId) {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.GET_SESSION(activityId));
      return response.success ? response.session : null;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  async getSessionParticipants(activityId) {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.GET_PARTICIPANTS(activityId));
      return response.success ? {
        participants: response.participants,
        groupStats: response.groupStats
      } : { participants: [], groupStats: {} };
    } catch (error) {
      console.error('Get participants error:', error);
      throw error;
    }
  }

  async getSessionHistory(activityId) {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.GET_SESSIONS(activityId));
      return response.success ? response.sessions : [];
    } catch (error) {
      console.error('Get session history error:', error);
      throw error;
    }
  }

  async getSessionDetails(activityId, sessionId) {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.GET_SESSION_DETAILS(activityId, sessionId));
      return response.success ? response.session : null;
    } catch (error) {
      console.error('Get session details error:', error);
      throw error;
    }
  }

  // Get session results
  async getSessionResults(sessionId) {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVITIES.SESSION_RESULTS(sessionId));
      return response.success ? response.results : null;
    } catch (error) {
      console.error('Get session results error:', error);
      throw error;
    }
  }

  // Rate activity
  async rateActivity(activityId, rating) {
    try {
      const response = await api.post(API_ENDPOINTS.ACTIVITIES.RATE(activityId), { rating });
      return response.success;
    } catch (error) {
      console.error('Rate activity error:', error);
      throw error;
    }
  }
}

export default new ActivityService();

