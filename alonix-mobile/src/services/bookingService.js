import api from './api';
import { API_ENDPOINTS } from '../config/api';

class BookingService {
  // Book hotel
  async bookHotel(bookingData) {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKINGS.HOTEL, bookingData);
      return response.success ? response.booking : null;
    } catch (error) {
      console.error('Book hotel error:', error);
      throw error;
    }
  }

  // Book restaurant
  async bookRestaurant(bookingData) {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKINGS.RESTAURANT, bookingData);
      return response.success ? response.booking : null;
    } catch (error) {
      console.error('Book restaurant error:', error);
      throw error;
    }
  }

  // Book taxi
  async bookTaxi(bookingData) {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKINGS.TAXI, bookingData);
      return response.success ? response.booking : null;
    } catch (error) {
      console.error('Book taxi error:', error);
      throw error;
    }
  }

  // Book vehicle
  async bookVehicle(bookingData) {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKINGS.VEHICLE, bookingData);
      return response.success ? response.booking : null;
    } catch (error) {
      console.error('Book vehicle error:', error);
      throw error;
    }
  }

  // Get nearby taxis
  async getNearbyTaxis(longitude, latitude, radius = 10) {
    try {
      const response = await api.get(API_ENDPOINTS.BOOKINGS.NEARBY_TAXIS, {
        longitude,
        latitude,
        radius
      });
      return response.success ? response.drivers : [];
    } catch (error) {
      console.error('Get nearby taxis error:', error);
      throw error;
    }
  }

  // Get available vehicles
  async getAvailableVehicles(filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.BOOKINGS.AVAILABLE_VEHICLES, filters);
      return response.success ? response.vehicles : [];
    } catch (error) {
      console.error('Get available vehicles error:', error);
      throw error;
    }
  }

  // Get booking by ID
  async getBooking(id) {
    try {
      const response = await api.get(API_ENDPOINTS.BOOKINGS.GET(id));
      return response.success ? response.booking : null;
    } catch (error) {
      console.error('Get booking error:', error);
      throw error;
    }
  }

  // Get user's bookings
  async getUserBookings(userId, filters = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.BOOKINGS.USER(userId), filters);
      return response.success ? response.bookings : [];
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(id, reason = '') {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKINGS.CANCEL(id), { reason });
      return response.success ? response.booking : null;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }
}

export default new BookingService();

