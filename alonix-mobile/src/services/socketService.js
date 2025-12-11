import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  // Connect to socket server
  async connect(token) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    try {
      // Extract base URL (remove /api)
      const baseURL = API_BASE_URL.replace('/api', '');

      this.socket = io(baseURL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        auth: {
          token: token
        }
      });

      this.setupEventHandlers();

      return Promise.race([
        new Promise((resolve, reject) => {
          this.socket.on('connect', () => {
            console.log('✅ Socket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            resolve();
          });

          this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
            reject(error);
          });

          // Authenticate after connection
          this.socket.emit('authenticate', { token });
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
    } catch (error) {
      console.error('Socket connect error:', error);
      throw error;
    }
  }

  // Setup event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      this.isConnected = false;
    });
  }

  // Join activity room
  joinActivity(activityId, userId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('join-activity', { activityId, userId });
  }

  // Leave activity room
  leaveActivity(activityId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('leave-activity', { activityId });
  }

  // Send location update
  sendLocationUpdate(activityId, userId, location, stats, health) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('location-update', {
      activityId,
      userId,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      stats: {
        distance: stats.distance || 0,
        duration: stats.duration || 0,
        pace: stats.pace || 0,
        speed: stats.speed || 0,
        elevation: stats.elevation || 0,
        calories: stats.calories || 0,
      },
      health: {
        heartRate: health?.heartRate || 0,
        steps: health?.steps || 0,
        batteryLevel: health?.batteryLevel || 100
      }
    });
  }

  // Send SOS alert
  sendSOSAlert(activityId, userId, location, reason = 'Emergency SOS') {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.emit('sos-alert', {
      activityId,
      userId,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        address: location.address || ''
      },
      reason
    });
  }

  // Update participant status
  updateStatus(activityId, userId, status) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('status-update', {
      activityId,
      userId,
      status
    });
  }

  // Send chat message
  sendMessage(activityId, message) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('send-message', {
      activityId,
      message
    });
  }

  // Request group statistics
  getGroupStats(activityId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('get-group-stats', { activityId });
  }

  // Event Listeners
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      // Remove all listeners for this event
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.forEach(listener => {
          this.socket.off(event, listener);
        });
      }
      this.listeners.delete(event);
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export default new SocketService();

