import api from './api';
import { API_ENDPOINTS } from '../config/api';

class ClubService {
  // Get all clubs
  async getClubs(filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.CLUBS.BASE, filters);
      return response.success ? response : { success: false, clubs: [], pagination: {} };
    } catch (error) {
      console.error('Get clubs error:', error);
      throw error;
    }
  }

  // Get club by ID
  async getClub(id) {
    try {
      const response = await api.get(API_ENDPOINTS.CLUBS.GET(id));
      return response.success ? response.club : null;
    } catch (error) {
      console.error('Get club error:', error);
      throw error;
    }
  }

  // Create club
  async createClub(clubData) {
    try {
      const response = await api.post(API_ENDPOINTS.CLUBS.CREATE, clubData);
      return response.success ? response.club : null;
    } catch (error) {
      console.error('Create club error:', error);
      throw error;
    }
  }

  // Join club
  async joinClub(id) {
    try {
      const response = await api.post(API_ENDPOINTS.CLUBS.JOIN(id));
      return response.success ? response.club : null;
    } catch (error) {
      console.error('Join club error:', error);
      throw error;
    }
  }

  // Leave club
  async leaveClub(id) {
    try {
      const response = await api.post(API_ENDPOINTS.CLUBS.LEAVE(id));
      return response.success;
    } catch (error) {
      console.error('Leave club error:', error);
      throw error;
    }
  }

  // Get user's clubs
  async getUserClubs(userId) {
    try {
      const response = await api.get(API_ENDPOINTS.CLUBS.USER(userId));
      return response.success ? response.clubs : [];
    } catch (error) {
      console.error('Get user clubs error:', error);
      throw error;
    }
  }

  // Get club events
  async getClubEvents(clubId, status = null) {
    try {
      const params = status ? { status } : {};
      const response = await api.get(API_ENDPOINTS.CLUBS.EVENTS(clubId), params);
      return response.success ? response.events : [];
    } catch (error) {
      console.error('Get club events error:', error);
      throw error;
    }
  }

  // Create club event
  async createClubEvent(clubId, eventData) {
    try {
      const response = await api.post(API_ENDPOINTS.CLUBS.CREATE_EVENT(clubId), eventData);
      return response.success ? response.event : null;
    } catch (error) {
      console.error('Create club event error:', error);
      throw error;
    }
  }

  // Confirm availability for event
  async confirmEventAvailability(clubId, eventId, status = 'confirmed') {
    try {
      const response = await api.post(API_ENDPOINTS.CLUBS.CONFIRM_EVENT(clubId, eventId), {
        status
      });
      return response.success ? response.event : null;
    } catch (error) {
      console.error('Confirm availability error:', error);
      throw error;
    }
  }
}

export default new ClubService();

