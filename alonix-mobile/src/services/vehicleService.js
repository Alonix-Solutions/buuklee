import api from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Vehicle Service
 * Handles all API calls related to car rentals and vehicles
 */
class VehicleService {
    /**
     * Get all vehicles with optional filters
     * @param {Object} filters - Optional filters (type, available, priceRange, etc.)
     * @returns {Promise<Object>} - { success, vehicles, pagination }
     */
    async getVehicles(filters = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.VEHICLES.BASE, filters);
            return response.success ? response : { success: false, vehicles: [] };
        } catch (error) {
            console.error('Get vehicles error:', error);
            return { success: false, vehicles: [], error: error.message };
        }
    }

    /**
     * Get a specific vehicle by ID
     * @param {string} id - Vehicle ID
     * @returns {Promise<Object|null>} - Vehicle object or null
     */
    async getVehicle(id) {
        try {
            if (!id) {
                console.warn('getVehicle called with no ID');
                return null;
            }
            const response = await api.get(API_ENDPOINTS.VEHICLES.GET(id));
            return response.success ? response.vehicle : null;
        } catch (error) {
            console.error('Get vehicle error:', error);
            return null;
        }
    }

    /**
     * Get available vehicles
     * @param {Object} params - Optional params (startDate, endDate, type, etc.)
     * @returns {Promise<Object>} - { success, vehicles }
     */
    async getAvailableVehicles(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.VEHICLES.AVAILABLE, params);
            return response.success ? response : { success: false, vehicles: [] };
        } catch (error) {
            console.error('Get available vehicles error:', error);
            return { success: false, vehicles: [], error: error.message };
        }
    }

    /**
     * Book a vehicle
     * @param {string} vehicleId - Vehicle ID
     * @param {Object} bookingDetails - { startDate, endDate, pickupLocation, etc. }
     * @returns {Promise<Object>} - { success, booking }
     */
    async bookVehicle(vehicleId, bookingDetails) {
        try {
            const response = await api.post(API_ENDPOINTS.VEHICLES.BOOK(vehicleId), bookingDetails);
            return response.success ? response : { success: false, error: response.error };
        } catch (error) {
            console.error('Book vehicle error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel a vehicle booking
     * @param {string} vehicleId - Vehicle ID
     * @param {string} bookingId - Booking ID
     * @returns {Promise<boolean>} - Success status
     */
    async cancelBooking(vehicleId, bookingId) {
        try {
            const response = await api.post(API_ENDPOINTS.VEHICLES.CANCEL(vehicleId), { bookingId });
            return response.success;
        } catch (error) {
            console.error('Cancel vehicle booking error:', error);
            return false;
        }
    }

    /**
     * Get vehicles by type
     * @param {string} type - Vehicle type (sedan, suv, coupe, truck, etc.)
     * @returns {Promise<Object>} - { success, vehicles }
     */
    async getVehiclesByType(type) {
        return this.getVehicles({ type });
    }
}

export default new VehicleService();
