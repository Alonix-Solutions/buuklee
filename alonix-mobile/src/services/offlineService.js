import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Offline Support Service
 * Handles caching, queue management, and offline-first data access
 */
class OfflineService {
    constructor() {
        this.isOnline = true;
        this.listeners = [];
        this.requestQueue = [];
        this.netInfoUnsubscribe = null;
    }

    /**
     * Initialize offline service
     * Sets up network monitoring
     */
    async initialize() {
        try {
            // Check initial network state
            const state = await NetInfo.fetch();
            this.isOnline = state.isConnected && state.isInternetReachable;

            // Subscribe to network state changes
            this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
                const wasOnline = this.isOnline;
                this.isOnline = state.isConnected && state.isInternetReachable;

                // Notify listeners of connection change
                this.notifyListeners({ isOnline: this.isOnline });

                // Process queue when coming back online
                if (!wasOnline && this.isOnline) {
                    this.processQueue();
                }
            });

            return true;
        } catch (error) {
            console.error('Initialize offline service error:', error);
            return false;
        }
    }

    /**
     * Clean up subscriptions
     */
    cleanup() {
        if (this.netInfoUnsubscribe) {
            this.netInfoUnsubscribe();
        }
        this.listeners = [];
    }

    /**
     * Check if device is online
     */
    getIsOnline() {
        return this.isOnline;
    }

    /**
     * Subscribe to network status changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners
     */
    notifyListeners(data) {
        this.listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error('Listener notification error:', error);
            }
        });
    }

    // ==================== CACHING ====================

    /**
     * Cache data with expiration
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in seconds (default: 1 hour)
     */
    async cacheData(key, data, ttl = 3600) {
        try {
            const cacheItem = {
                data,
                timestamp: Date.now(),
                ttl: ttl * 1000, // Convert to milliseconds
            };
            await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
            return true;
        } catch (error) {
            console.error('Cache data error:', error);
            return false;
        }
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {any|null} - Cached data or null if expired/not found
     */
    async getCachedData(key) {
        try {
            const cached = await AsyncStorage.getItem(`cache_${key}`);
            if (!cached) return null;

            const cacheItem = JSON.parse(cached);
            const now = Date.now();

            // Check if expired
            if (now - cacheItem.timestamp > cacheItem.ttl) {
                await this.clearCache(key);
                return null;
            }

            return cacheItem.data;
        } catch (error) {
            console.error('Get cached data error:', error);
            return null;
        }
    }

    /**
     * Clear specific cache
     */
    async clearCache(key) {
        try {
            await AsyncStorage.removeItem(`cache_${key}`);
            return true;
        } catch (error) {
            console.error('Clear cache error:', error);
            return false;
        }
    }

    /**
     * Clear all cache
     */
    async clearAllCache() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('cache_'));
            await AsyncStorage.multiRemove(cacheKeys);
            return true;
        } catch (error) {
            console.error('Clear all cache error:', error);
            return false;
        }
    }

    // ==================== REQUEST QUEUE ====================

    /**
     * Add request to queue for later processing
     * @param {Object} request - Request object { method, url, data, callback }
     */
    async addToQueue(request) {
        try {
            this.requestQueue.push({
                ...request,
                timestamp: Date.now(),
                id: `req_${Date.now()}_${Math.random()}`,
            });

            // Persist queue
            await this.saveQueue();
            return true;
        } catch (error) {
            console.error('Add to queue error:', error);
            return false;
        }
    }

    /**
     * Save queue to AsyncStorage
     */
    async saveQueue() {
        try {
            await AsyncStorage.setItem('request_queue', JSON.stringify(this.requestQueue));
            return true;
        } catch (error) {
            console.error('Save queue error:', error);
            return false;
        }
    }

    /**
     * Load queue from AsyncStorage
     */
    async loadQueue() {
        try {
            const queue = await AsyncStorage.getItem('request_queue');
            if (queue) {
                this.requestQueue = JSON.parse(queue);
            }
            return this.requestQueue;
        } catch (error) {
            console.error('Load queue error:', error);
            return [];
        }
    }

    /**
     * Process queued requests
     */
    async processQueue() {
        if (!this.isOnline || this.requestQueue.length === 0) {
            return;
        }

        console.log(`Processing ${this.requestQueue.length} queued requests...`);

        const queue = [...this.requestQueue];
        this.requestQueue = [];

        for (const request of queue) {
            try {
                // Execute the request
                if (request.callback) {
                    await request.callback(request);
                }
            } catch (error) {
                console.error('Process queue item error:', error);
                // Re-add to queue if failed
                this.requestQueue.push(request);
            }
        }

        await this.saveQueue();
    }

    /**
     * Clear request queue
     */
    async clearQueue() {
        this.requestQueue = [];
        await AsyncStorage.removeItem('request_queue');
    }

    // ==================== PRESET CACHING HELPERS ====================

    /**
     * Cache user data
     */
    async cacheUserData(userData) {
        return await this.cacheData('user_data', userData, 86400); // 24 hours
    }

    /**
     * Get cached user data
     */
    async getCachedUserData() {
        return await this.getCachedData('user_data');
    }

    /**
     * Cache activities
     */
    async cacheActivities(activities) {
        return await this.cacheData('activities', activities, 1800); // 30 minutes
    }

    /**
     * Get cached activities
     */
    async getCachedActivities() {
        return await this.getCachedData('activities');
    }

    /**
     * Cache clubs
     */
    async cacheClubs(clubs) {
        return await this.cacheData('clubs', clubs, 3600); // 1 hour
    }

    /**
     * Get cached clubs
     */
    async getCachedClubs() {
        return await this.getCachedData('clubs');
    }

    /**
     * Cache messages
     */
    async cacheMessages(conversationId, messages) {
        return await this.cacheData(`messages_${conversationId}`, messages, 600); // 10 minutes
    }

    /**
     * Get cached messages
     */
    async getCachedMessages(conversationId) {
        return await this.getCachedData(`messages_${conversationId}`);
    }

    /**
     * Cache notifications
     */
    async cacheNotifications(notifications) {
        return await this.cacheData('notifications', notifications, 300); // 5 minutes
    }

    /**
     * Get cached notifications
     */
    async getCachedNotifications() {
        return await this.getCachedData('notifications');
    }

    // ==================== UTILITY ====================

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('cache_'));

            return {
                totalCacheItems: cacheKeys.length,
                queuedRequests: this.requestQueue.length,
                isOnline: this.isOnline,
            };
        } catch (error) {
            console.error('Get cache stats error:', error);
            return null;
        }
    }
}

export default new OfflineService();
