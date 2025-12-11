import api from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Review Service
 * Handles all API calls related to reviews for various entities
 */
class ReviewService {
    /**
     * Get reviews for an entity (hotel, restaurant, driver, activity, etc.)
     * @param {string} entityType - Type of entity (hotel, restaurant, driver, activity)
     * @param {string} entityId - Entity ID
     * @param {Object} params - Optional params (page, limit, sortBy, etc.)
     * @returns {Promise<Object>} - { success, reviews, pagination, stats }
     */
    async getReviews(entityType, entityId, params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.REVIEWS.ENTITY(entityType, entityId), params);
            return response.success ? response : { success: false, reviews: [], stats: {} };
        } catch (error) {
            console.error('Get reviews error:', error);
            return { success: false, reviews: [], stats: {}, error: error.message };
        }
    }

    /**
     * Get a specific review by ID
     * @param {string} id - Review ID
     * @returns {Promise<Object|null>} - Review object or null
     */
    async getReview(id) {
        try {
            if (!id) {
                console.warn('getReview called with no ID');
                return null;
            }
            const response = await api.get(API_ENDPOINTS.REVIEWS.GET(id));
            return response.success ? response.review : null;
        } catch (error) {
            console.error('Get review error:', error);
            return null;
        }
    }

    /**
     * Get reviews by a specific user
     * @param {string} userId - User ID
     * @param {Object} params - Optional params (page, limit, etc.)
     * @returns {Promise<Object>} - { success, reviews, pagination }
     */
    async getUserReviews(userId, params = {}) {
        try {
            if (!userId) {
                console.warn('getUserReviews called with no userId');
                return { success: false, reviews: [] };
            }
            const response = await api.get(API_ENDPOINTS.REVIEWS.USER(userId), params);
            return response.success ? response : { success: false, reviews: [] };
        } catch (error) {
            console.error('Get user reviews error:', error);
            return { success: false, reviews: [], error: error.message };
        }
    }

    /**
     * Create a new review
     * @param {Object} reviewData - { entityType, entityId, rating, title, content, photos }
     * @returns {Promise<Object>} - { success, review }
     */
    async createReview(reviewData) {
        try {
            const response = await api.post(API_ENDPOINTS.REVIEWS.CREATE, reviewData);
            return response.success ? response : { success: false, error: response.error };
        } catch (error) {
            console.error('Create review error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get review stats for an entity
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @returns {Promise<Object>} - { success, stats: { average, count, distribution } }
     */
    async getReviewStats(entityType, entityId) {
        try {
            const response = await api.get(API_ENDPOINTS.REVIEWS.ENTITY(entityType, entityId), {
                statsOnly: true
            });
            return response.success ? response : { success: false, stats: {} };
        } catch (error) {
            console.error('Get review stats error:', error);
            return { success: false, stats: {}, error: error.message };
        }
    }
}

export default new ReviewService();
