import api from './api';
import { API_ENDPOINTS } from '../config/api';

const placeService = {
    getHotels: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.HOTELS.BASE);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getHotelById: async (id) => {
        try {
            const response = await api.get(API_ENDPOINTS.HOTELS.GET(id));
            return response;
        } catch (error) {
            throw error;
        }
    },

    getRestaurants: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.RESTAURANTS.BASE);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getRestaurantById: async (id) => {
        try {
            const response = await api.get(API_ENDPOINTS.RESTAURANTS.GET(id));
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default placeService;
