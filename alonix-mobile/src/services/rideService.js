import api from './api';
import { API_ENDPOINTS } from '../config/api';

class RideService {
    // Create a new ride offer
    async createRide(rideData) {
        try {
            const response = await api.post('/rides', rideData);
            return response.success ? response.ride : null;
        } catch (error) {
            console.error('Create ride error:', error);
            throw error;
        }
    }

    // Get all rides (can filter by activityId)
    async getRides(activityId = null) {
        try {
            const filters = activityId ? { activityId } : {};
            const response = await api.get('/rides', filters);
            return response.success ? response.rides : [];
        } catch (error) {
            console.error('Get rides error:', error);
            throw error;
        }
    }

    // Join a ride
    async joinRide(rideId) {
        try {
            const response = await api.post(`/rides/${rideId}/join`);
            return response.success ? response.ride : null;
        } catch (error) {
            console.error('Join ride error:', error);
            throw error;
        }
    }
}

export default new RideService();
