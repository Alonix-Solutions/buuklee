import * as Location from 'expo-location';
import * as Battery from 'expo-battery';

class GPSService {
  constructor() {
    this.isTracking = false;
    this.listeners = [];
    this.locationSubscription = null;
    this.currentActivity = null;
  }

  // Request location permissions
  async requestPermissions() {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        return { foreground: false, background: false };
      }

      // Try to request background permission
      let backgroundStatus = 'denied';
      try {
        const bgPermission = await Location.requestBackgroundPermissionsAsync();
        backgroundStatus = bgPermission.status;
      } catch (error) {
        console.log('Background permission not available:', error.message);
      }

      return {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted'
      };
    } catch (error) {
      console.error('Permission request error:', error);
      return { foreground: false, background: false };
    }
  }

  // Subscribe to location updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }

  // Get current activity stats
  getCurrentActivityStats() {
    if (!this.currentActivity) {
      return {
        totalDistance: 0,
        totalTime: 0,
        averageSpeed: 0,
        averagePace: 0,
        maxSpeed: 0,
        maxAltitude: 0,
        calories: 0
      };
    }

    return {
      totalDistance: this.currentActivity.totalDistance || 0,
      totalTime: this.currentActivity.totalTime || 0,
      averageSpeed: this.currentActivity.averageSpeed || 0,
      averagePace: this.currentActivity.averagePace || 0,
      maxSpeed: this.currentActivity.maxSpeed || 0,
      maxAltitude: this.currentActivity.maxAltitude || 0,
      calories: this.currentActivity.calories || 0
    };
  }


  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Start tracking activity
  async startTracking(options = {}) {
    try {
      if (this.isTracking) {
        console.warn('Tracking already in progress');
        return;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission.foreground) {
        throw new Error('Location permission required');
      }

      this.isTracking = true;
      this.currentActivity = {
        startTime: Date.now(),
        locations: [],
        totalDistance: 0,
        totalTime: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        minAltitude: null,
        maxAltitude: null,
        pausedTime: 0,
        isPaused: false,
        steps: 0, // Initialize steps
      };

      // Configure tracking options
      const trackingOptions = {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: options.timeInterval || 1000, // Update every second
        distanceInterval: options.distanceInterval || 5, // Update every 5 meters
        ...options,
      };

      // Start watching position
      this.locationSubscription = await Location.watchPositionAsync(
        trackingOptions,
        async (location) => {
          if (!this.currentActivity.isPaused) {
            this.updateActivity(location);

            // Get battery level
            let batteryLevel = -1;
            try {
              const level = await Battery.getBatteryLevelAsync();
              batteryLevel = Math.round(level * 100);
            } catch (e) {
              console.log('Battery level error:', e);
            }

            this.notifyListeners({
              location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                altitude: location.coords.altitude,
                speed: location.coords.speed,
              },
              activity: this.getCurrentActivityStats(),
              health: {
                heartRate: Math.floor(Math.random() * (160 - 120 + 1)) + 120, // Simulated HR 120-160 BPM
                steps: this.currentActivity.steps,
                batteryLevel: batteryLevel
              }
            });
          }
        }
      );

      return this.currentActivity;
    } catch (error) {
      console.error('Error starting tracking:', error);
      this.isTracking = false;
      throw error;
    }
  }

  // Update activity with new location
  updateActivity(location) {
    if (!this.currentActivity || this.currentActivity.isPaused) return;

    const newLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      speed: location.coords.speed || 0,
      timestamp: location.timestamp,
    };

    // Add location to route
    this.currentActivity.locations.push(newLocation);

    // Calculate distance if we have previous location
    if (this.currentActivity.locations.length > 1) {
      const prevLocation = this.currentActivity.locations[this.currentActivity.locations.length - 2];
      const distance = this.calculateDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        newLocation.latitude,
        newLocation.longitude
      );
      this.currentActivity.totalDistance += distance;

      // Simulate steps: approx 1.3 steps per meter
      this.currentActivity.steps += Math.round(distance * 1.3);
    }

    // Update time
    this.currentActivity.totalTime = Date.now() - this.currentActivity.startTime - this.currentActivity.pausedTime;

    // Update speed
    if (newLocation.speed > this.currentActivity.maxSpeed) {
      this.currentActivity.maxSpeed = newLocation.speed;
    }

    // Calculate average speed (distance / time in hours)
    const timeInHours = this.currentActivity.totalTime / (1000 * 60 * 60);
    const distanceInKm = this.currentActivity.totalDistance / 1000;
    this.currentActivity.averageSpeed = timeInHours > 0 ? distanceInKm / timeInHours : 0;

    // Update altitude
    if (newLocation.altitude) {
      if (this.currentActivity.minAltitude === null || newLocation.altitude < this.currentActivity.minAltitude) {
        this.currentActivity.minAltitude = newLocation.altitude;
      }
      if (this.currentActivity.maxAltitude === null || newLocation.altitude > this.currentActivity.maxAltitude) {
        this.currentActivity.maxAltitude = newLocation.altitude;
      }
    }
  }

  // Pause tracking
  pauseTracking() {
    if (!this.isTracking || !this.currentActivity) return;

    this.currentActivity.isPaused = true;
    this.currentActivity.pauseStartTime = Date.now();
  }

  // Resume tracking
  resumeTracking() {
    if (!this.isTracking || !this.currentActivity || !this.currentActivity.isPaused) return;

    const pauseDuration = Date.now() - this.currentActivity.pauseStartTime;
    this.currentActivity.pausedTime += pauseDuration;
    this.currentActivity.isPaused = false;
    delete this.currentActivity.pauseStartTime;
  }

  // Stop tracking
  async stopTracking() {
    try {
      if (!this.isTracking) {
        console.warn('No tracking in progress');
        return null;
      }

      // Stop location updates
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      this.isTracking = false;

      // Calculate final stats
      const finalActivity = this.getCurrentActivityStats();

      // Clear current activity
      this.currentActivity = null;

      return finalActivity;
    } catch (error) {
      console.error('Error stopping tracking:', error);
      throw error;
    }
  }

  // Get current activity stats
  getCurrentActivityStats() {
    if (!this.currentActivity) return null;

    const actualTime = this.currentActivity.isPaused
      ? Date.now() - this.currentActivity.startTime - this.currentActivity.pausedTime - (Date.now() - this.currentActivity.pauseStartTime)
      : this.currentActivity.totalTime;

    return {
      distance: this.currentActivity.totalDistance, // in meters
      steps: this.currentActivity.steps,
      duration: actualTime, // in milliseconds
      averageSpeed: this.currentActivity.averageSpeed, // km/h
      maxSpeed: this.currentActivity.maxSpeed, // m/s
      averagePace: this.calculatePace(this.currentActivity.totalDistance, actualTime), // min/km
      locations: this.currentActivity.locations,
      startTime: this.currentActivity.startTime,
      isPaused: this.currentActivity.isPaused,
      elevation: {
        min: this.currentActivity.minAltitude,
        max: this.currentActivity.maxAltitude,
        gain: this.calculateElevationGain(),
      },
    };
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Calculate pace (minutes per kilometer)
  calculatePace(distance, time) {
    if (distance === 0) return 0;
    const distanceInKm = distance / 1000;
    const timeInMinutes = time / (1000 * 60);
    return timeInMinutes / distanceInKm;
  }

  // Calculate elevation gain
  calculateElevationGain() {
    if (!this.currentActivity || this.currentActivity.locations.length < 2) return 0;

    let gain = 0;
    for (let i = 1; i < this.currentActivity.locations.length; i++) {
      const prevAlt = this.currentActivity.locations[i - 1].altitude || 0;
      const currAlt = this.currentActivity.locations[i].altitude || 0;
      const diff = currAlt - prevAlt;
      if (diff > 0) {
        gain += diff;
      }
    }
    return gain;
  }

  // Generate route polyline coordinates for map display
  getRoutePolyline() {
    if (!this.currentActivity || this.currentActivity.locations.length === 0) {
      return [];
    }

    return this.currentActivity.locations.map((loc) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
  }

  // Format duration to human-readable string
  formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Format distance to human-readable string
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  }

  // Format speed to human-readable string
  formatSpeed(metersPerSecond) {
    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  }

  // Format pace to human-readable string
  formatPace(minPerKm) {
    if (!minPerKm || minPerKm === Infinity || minPerKm === 0) {
      return '--:--';
    }
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Calculate calories burned (rough estimation)
  calculateCalories(distance, duration, weight = 70) {
    // MET (Metabolic Equivalent) values for different activities
    const MET_RUNNING = 9.8;
    const MET_WALKING = 3.5;
    const MET_CYCLING = 7.5;

    // Determine activity type based on average speed
    const avgSpeed = (distance / 1000) / (duration / (1000 * 60 * 60)); // km/h
    let MET = MET_WALKING;

    if (avgSpeed > 8) {
      MET = MET_RUNNING;
    } else if (avgSpeed > 15) {
      MET = MET_CYCLING;
    }

    // Calories = MET × weight (kg) × time (hours)
    const timeInHours = duration / (1000 * 60 * 60);
    return Math.round(MET * weight * timeInHours);
  }

  // Get tracking status
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      isPaused: this.currentActivity?.isPaused || false,
      hasActivity: this.currentActivity !== null,
    };
  }
}

// Export singleton instance and safe named exports for CommonJS/ES interop
const gpsServiceInstance = new GPSService();

export const requestPermissions = gpsServiceInstance.requestPermissions.bind(gpsServiceInstance);
export const startTracking = gpsServiceInstance.startTracking.bind(gpsServiceInstance);
export const stopTracking = gpsServiceInstance.stopTracking.bind(gpsServiceInstance);
export const subscribe = gpsServiceInstance.subscribe.bind(gpsServiceInstance);
export const getCurrentActivityStats = gpsServiceInstance.getCurrentActivityStats.bind(gpsServiceInstance);
export const formatDistance = gpsServiceInstance.formatDistance.bind(gpsServiceInstance);
export default gpsServiceInstance;
