import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * Health Monitoring Service
 * Integrates heart rate, step count, and other health metrics
 * Note: Requires expo-sensors and platform-specific health permissions
 */
class HealthService {
    constructor() {
        this.heartRateSubscription = null;
        this.pedometerSubscription = null;
        this.listeners = [];
        this.currentHeartRate = null;
        this.currentSteps = 0;
        this.isMonitoring = false;
    }

    /**
     * Request health permissions
     * iOS: Requires HealthKit entitlement
     * Android: Requires BODY_SENSORS permission
     */
    async requestPermissions() {
        try {
            if (Platform.OS === 'ios') {
                // iOS HealthKit integration would go here
                // Requires expo-health or react-native-health
                console.log('iOS HealthKit integration required');
                return { heartRate: false, steps: false };
            } else if (Platform.OS === 'android') {
                // Android Health Connect / Google Fit integration
                console.log('Android Health Connect integration required');
                return { heartRate: false, steps: false };
            }

            return { heartRate: false, steps: false };
        } catch (error) {
            console.error('Health permissions error:', error);
            return { heartRate: false, steps: false };
        }
    }

    /**
     * Start monitoring heart rate
     * @param {Function} callback - Called with heart rate data
     */
    async startHeartRateMonitoring(callback) {
        try {
            // Check if heart rate sensor is available
            const isAvailable = await this.isHeartRateSensorAvailable();

            if (!isAvailable) {
                console.warn('Heart rate sensor not available on this device');
                return false;
            }

            this.isMonitoring = true;

            // Subscribe to heart rate updates
            // Note: This is a placeholder - actual implementation depends on device
            this.heartRateSubscription = this.simulateHeartRateMonitoring(callback);

            return true;
        } catch (error) {
            console.error('Start heart rate monitoring error:', error);
            return false;
        }
    }

    /**
     * Stop heart rate monitoring
     */
    stopHeartRateMonitoring() {
        if (this.heartRateSubscription) {
            clearInterval(this.heartRateSubscription);
            this.heartRateSubscription = null;
        }
        this.isMonitoring = false;
        this.currentHeartRate = null;
    }

    /**
     * Check if heart rate sensor is available
     */
    async isHeartRateSensorAvailable() {
        try {
            // Most mobile devices don't have built-in HR sensors
            // This would typically require:
            // 1. Wearable device (Apple Watch, Fitbit, etc.)
            // 2. External HR monitor via Bluetooth
            // 3. Camera-based HR detection (less accurate)

            return false; // Default to false unless wearable connected
        } catch (error) {
            console.error('Check HR sensor error:', error);
            return false;
        }
    }

    /**
     * Simulate heart rate monitoring for testing
     * In production, this would read from actual sensors
     */
    simulateHeartRateMonitoring(callback) {
        const baseHeartRate = 70;
        const variation = 15;

        return setInterval(() => {
            // Simulate realistic heart rate (60-100 bpm at rest)
            const hr = Math.floor(
                baseHeartRate + Math.random() * variation - variation / 2
            );

            this.currentHeartRate = hr;

            if (callback) {
                callback({
                    heartRate: hr,
                    timestamp: new Date().toISOString(),
                    quality: 'good', // good, fair, poor
                });
            }

            // Notify listeners
            this.notifyListeners({ type: 'heartRate', data: hr });
        }, 2000); // Update every 2 seconds
    }

    /**
     * Get current heart rate
     */
    getCurrentHeartRate() {
        return this.currentHeartRate;
    }

    /**
     * Start step counting
     */
    async startStepCounting(callback) {
        try {
            // Check if pedometer is available
            const isAvailable = await Pedometer.isAvailableAsync();

            if (!isAvailable) {
                console.warn('Pedometer not available on this device');
                return false;
            }

            // Subscribe to step updates
            this.pedometerSubscription = Pedometer.watchStepCount(result => {
                this.currentSteps = result.steps;

                if (callback) {
                    callback({
                        steps: result.steps,
                        timestamp: new Date().toISOString(),
                    });
                }

                this.notifyListeners({ type: 'steps', data: result.steps });
            });

            return true;
        } catch (error) {
            console.error('Start step counting error:', error);
            return false;
        }
    }

    /**
     * Stop step counting
     */
    stopStepCounting() {
        if (this.pedometerSubscription) {
            this.pedometerSubscription.remove();
            this.pedometerSubscription = null;
        }
    }

    /**
     * Get step count for a date range
     */
    async getStepCount(start, end) {
        try {
            const result = await Pedometer.getStepCountAsync(start, end);
            return result.steps || 0;
        } catch (error) {
            console.error('Get step count error:', error);
            return 0;
        }
    }

    /**
     * Subscribe to health updates
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

    /**
     * Check for abnormal heart rate
     * @param {number} heartRate - Current heart rate
     * @param {string} activityLevel - 'resting', 'light', 'moderate', 'vigorous'
     */
    isAbnormalHeartRate(heartRate, activityLevel = 'moderate') {
        const thresholds = {
            resting: { min: 50, max: 100 },
            light: { min: 90, max: 130 },
            moderate: { min: 110, max: 160 },
            vigorous: { min: 130, max: 180 },
        };

        const threshold = thresholds[activityLevel] || thresholds.moderate;

        return {
            isAbnormal: heartRate < threshold.min || heartRate > threshold.max,
            isTooLow: heartRate < threshold.min,
            isTooHigh: heartRate > threshold.max,
            heartRate,
            threshold,
        };
    }

    /**
     * Get health summary
     */
    getHealthSummary() {
        return {
            heartRate: this.currentHeartRate,
            steps: this.currentSteps,
            isMonitoring: this.isMonitoring,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Clean up all subscriptions
     */
    cleanup() {
        this.stopHeartRateMonitoring();
        this.stopStepCounting();
        this.listeners = [];
    }
}

export default new HealthService();
