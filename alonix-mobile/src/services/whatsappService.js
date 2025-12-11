import { Linking } from 'react-native';
import api from './api';
import { API_ENDPOINTS } from '../config/api';

class WhatsAppService {
  // Get WhatsApp link for hotel
  async getHotelLink(hotelId, inquiryType = 'general', bookingData = null) {
    try {
      const params = { inquiryType };
      if (bookingData) {
        params.bookingData = JSON.stringify(bookingData);
      }
      
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`${API_ENDPOINTS.WHATSAPP.HOTEL(hotelId)}?${queryString}`);
      
      return response.success ? response.whatsappLink : null;
    } catch (error) {
      console.error('Get hotel WhatsApp link error:', error);
      throw error;
    }
  }

  // Get WhatsApp link for restaurant
  async getRestaurantLink(restaurantId, inquiryType = 'general', bookingData = null) {
    try {
      const params = { inquiryType };
      if (bookingData) {
        params.bookingData = JSON.stringify(bookingData);
      }
      
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`${API_ENDPOINTS.WHATSAPP.RESTAURANT(restaurantId)}?${queryString}`);
      
      return response.success ? response.whatsappLink : null;
    } catch (error) {
      console.error('Get restaurant WhatsApp link error:', error);
      throw error;
    }
  }

  // Generate custom WhatsApp link
  async generateLink(phoneNumber, message = '') {
    try {
      const response = await api.post(API_ENDPOINTS.WHATSAPP.GENERATE_LINK, {
        phoneNumber,
        message
      });
      return response.success ? response.whatsappLink : null;
    } catch (error) {
      console.error('Generate WhatsApp link error:', error);
      throw error;
    }
  }

  // Open WhatsApp with link
  async openWhatsApp(link) {
    try {
      const canOpen = await Linking.canOpenURL(link);
      if (canOpen) {
        await Linking.openURL(link);
        return true;
      } else {
        console.warn('Cannot open WhatsApp link');
        return false;
      }
    } catch (error) {
      console.error('Open WhatsApp error:', error);
      return false;
    }
  }

  // Open hotel WhatsApp directly
  async openHotelWhatsApp(hotelId, inquiryType = 'general', bookingData = null) {
    try {
      const link = await this.getHotelLink(hotelId, inquiryType, bookingData);
      if (link) {
        return await this.openWhatsApp(link);
      }
      return false;
    } catch (error) {
      console.error('Open hotel WhatsApp error:', error);
      return false;
    }
  }

  // Open restaurant WhatsApp directly
  async openRestaurantWhatsApp(restaurantId, inquiryType = 'general', bookingData = null) {
    try {
      const link = await this.getRestaurantLink(restaurantId, inquiryType, bookingData);
      if (link) {
        return await this.openWhatsApp(link);
      }
      return false;
    } catch (error) {
      console.error('Open restaurant WhatsApp error:', error);
      return false;
    }
  }
}

export default new WhatsAppService();

