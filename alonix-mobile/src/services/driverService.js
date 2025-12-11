import api from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Driver Service
 * Handles all API calls related to drivers/taxi services
 */
class DriverService {
    /**
     * Get all drivers with optional filters
     * @param {Object} filters - Optional filters (available, language, vehicleType, etc.)
     * @returns {Promise<Object>} - { success, drivers, pagination }
     */
    async getDrivers(filters = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.DRIVERS.BASE, filters);
            return response.success ? response : { success: false, drivers: [] };
        } catch (error) {
            console.error('Get drivers error:', error);
            return { success: false, drivers: [], error: error.message };
        }
    }

    /**
     * Get a specific driver by ID
     * @param {string} id - Driver ID
     * @returns {Promise<Object|null>} - Driver object or null
     */
    async getDriver(id) {
        try {
            if (!id) {
                console.warn('getDriver called with no ID');
                return null;
            }
            const response = await api.get(API_ENDPOINTS.DRIVERS.GET(id));
            return response.success ? response.driver : null;
        } catch (error) {
            console.error('Get driver error:', error);
            return null;
        }
    }

    /**
     * Get available drivers
     * @param {Object} params - Optional params (location, vehicleType, etc.)
     * @returns {Promise<Object>} - { success, drivers }
     */
    async getAvailableDrivers(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.DRIVERS.AVAILABLE, params);
            return response.success ? response : { success: false, drivers: [] };
        } catch (error) {
            console.error('Get available drivers error:', error);
            return { success: false, drivers: [], error: error.message };
        }
    }

    /**
     * Get nearby drivers based on location
     * @param {number} latitude - User's latitude
     * @param {number} longitude - User's longitude
     * @param {number} radius - Search radius in km (default: 10)
     * @returns {Promise<Object>} - { success, drivers }
     */
    async getNearbyDrivers(latitude, longitude, radius = 10) {
        try {
            const response = await api.get(API_ENDPOINTS.DRIVERS.NEARBY, {
                latitude,
                longitude,
                radius
            });
            return response.success ? response : { success: false, drivers: [] };
        } catch (error) {
            console.error('Get nearby drivers error:', error);
            return { success: false, drivers: [], error: error.message };
        }
    }

    /**
     * Rate a driver
     * @param {string} driverId - Driver ID
     * @param {number} rating - Rating (1-5)
     * @param {string} review - Optional review text
     * @returns {Promise<boolean>} - Success status
     */
    async rateDriver(driverId, rating, review = '') {
        try {
            const response = await api.post(API_ENDPOINTS.DRIVERS.RATE(driverId), {
                rating,
                review
            });
            return response.success;
        } catch (error) {
            console.error('Rate driver error:', error);
            return false;
        }
    }
}

export default new DriverService();
