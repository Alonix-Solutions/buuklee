import api from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Post Service
 * Handles all API calls related to activity posts and social feed
 */
class PostService {
    /**
     * Get activity feed posts
     * @param {Object} params - Optional params (page, limit, etc.)
     * @returns {Promise<Object>} - { success, posts, pagination }
     */
    async getFeed(params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.POSTS.FEED, params);
            return response.success ? response : { success: false, posts: [] };
        } catch (error) {
            console.error('Get feed error:', error);
            return { success: false, posts: [], error: error.message };
        }
    }

    /**
     * Get all posts with optional filters
     * @param {Object} filters - Optional filters (type, userId, etc.)
     * @returns {Promise<Object>} - { success, posts, pagination }
     */
    async getPosts(filters = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.POSTS.BASE, filters);
            return response.success ? response : { success: false, posts: [] };
        } catch (error) {
            console.error('Get posts error:', error);
            return { success: false, posts: [], error: error.message };
        }
    }

    /**
     * Get a specific post by ID
     * @param {string} id - Post ID
     * @returns {Promise<Object|null>} - Post object or null
     */
    async getPost(id) {
        try {
            if (!id) {
                console.warn('getPost called with no ID');
                return null;
            }
            const response = await api.get(API_ENDPOINTS.POSTS.GET(id));
            return response.success ? response.post : null;
        } catch (error) {
            console.error('Get post error:', error);
            return null;
        }
    }

    /**
     * Get posts by a specific user
     * @param {string} userId - User ID
     * @param {Object} params - Optional params (page, limit, etc.)
     * @returns {Promise<Object>} - { success, posts, pagination }
     */
    async getUserPosts(userId, params = {}) {
        try {
            if (!userId) {
                console.warn('getUserPosts called with no userId');
                return { success: false, posts: [] };
            }
            const response = await api.get(API_ENDPOINTS.POSTS.USER(userId), params);
            return response.success ? response : { success: false, posts: [] };
        } catch (error) {
            console.error('Get user posts error:', error);
            return { success: false, posts: [], error: error.message };
        }
    }

    /**
     * Create a new post
     * @param {Object} postData - { title, content, photos, stats, type, etc. }
     * @returns {Promise<Object>} - { success, post }
     */
    async createPost(postData) {
        try {
            const response = await api.post(API_ENDPOINTS.POSTS.CREATE, postData);
            return response.success ? response : { success: false, error: response.error };
        } catch (error) {
            console.error('Create post error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Like/unlike a post
     * @param {string} postId - Post ID
     * @returns {Promise<Object>} - { success, liked, likesCount }
     */
    async toggleLike(postId) {
        try {
            const response = await api.post(API_ENDPOINTS.POSTS.LIKE(postId));
            return response.success ? response : { success: false };
        } catch (error) {
            console.error('Toggle like error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get comments for a post
     * @param {string} postId - Post ID
     * @param {Object} params - Optional params (page, limit, etc.)
     * @returns {Promise<Object>} - { success, comments, pagination }
     */
    async getComments(postId, params = {}) {
        try {
            const response = await api.get(API_ENDPOINTS.POSTS.COMMENT(postId), params);
            return response.success ? response : { success: false, comments: [] };
        } catch (error) {
            console.error('Get comments error:', error);
            return { success: false, comments: [], error: error.message };
        }
    }

    /**
     * Add a comment to a post
     * @param {string} postId - Post ID
     * @param {string} content - Comment content
     * @returns {Promise<Object>} - { success, comment }
     */
    async addComment(postId, content) {
        try {
            const response = await api.post(API_ENDPOINTS.POSTS.COMMENT(postId), { content });
            return response.success ? response : { success: false, error: response.error };
        } catch (error) {
            console.error('Add comment error:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new PostService();
