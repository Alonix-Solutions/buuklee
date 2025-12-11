import api from './api';

class RoommateService {
    // Create a new roommate request
    async createRequest(requestData) {
        try {
            const response = await api.post('/roommates', requestData);
            return response.success ? response.request : null;
        } catch (error) {
            console.error('Create roommate request error:', error);
            throw error;
        }
    }

    // Get all roommate requests for an activity
    async getRequests(activityId) {
        try {
            const response = await api.get(`/roommates/${activityId}`);
            return response.success ? response.requests : [];
        } catch (error) {
            console.error('Get roommate requests error:', error);
            throw error;
        }
    }
}

export default new RoommateService();
