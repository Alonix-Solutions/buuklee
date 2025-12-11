import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import gpsService from '../services/gpsService';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ActivityTrackerScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { activityType = 'running' } = route.params || {};

  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityPhotos, setActivityPhotos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mapRef = useRef(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (isTracking && currentLocation && mapRef.current) {
      // Center map on current location
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation, isTracking]);

  const requestPermissions = async () => {
    try {
      const locationPerms = await gpsService.requestPermissions();
      const imagePerms = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPerms = await ImagePicker.requestCameraPermissionsAsync();

      if (!locationPerms.foreground) {
        Alert.alert(
          'Permission Required',
          'Location permission is required to track your activity.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  useEffect(() => {
    // Sync state with GPS service on mount
    const status = gpsService.getTrackingStatus();
    if (status.isTracking) {
      setIsTracking(true);
      setIsPaused(status.isPaused);
      const currentStats = gpsService.getCurrentActivityStats();
      if (currentStats) {
        setActivityStats(currentStats);
        setRoutePath(gpsService.getRoutePolyline());
        if (currentStats.locations && currentStats.locations.length > 0) {
          const lastLoc = currentStats.locations[currentStats.locations.length - 1];
          setCurrentLocation(lastLoc);
        }
      }
    }

    // Subscribe to updates
    const unsubscribe = gpsService.subscribe((data) => {
      setCurrentLocation(data.location);
      setActivityStats(data.activity);
      setRoutePath(gpsService.getRoutePolyline());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStartTracking = async () => {
    try {
      setIsLoading(true);

      const enabled = await gpsService.checkLocationEnabled();
      if (!enabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services to track your activity.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get initial location
      const location = await gpsService.getCurrentLocation();
      setCurrentLocation(location);

      // Start tracking
      await gpsService.startTracking();

      setIsTracking(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Failed to start tracking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseTracking = () => {
    gpsService.pauseTracking();
    setIsPaused(true);
  };

  const handleResumeTracking = () => {
    gpsService.resumeTracking();
    setIsPaused(false);
  };

  const handleStopTracking = async () => {
    try {
      const finalStats = await gpsService.stopTracking();
      setActivityStats(finalStats);
      setIsTracking(false);
      setIsPaused(false);

      if (finalStats && finalStats.distance > 100) {
        // Only save if activity has meaningful distance
        setShowSaveModal(true);
      } else {
        Alert.alert(
          'Activity Too Short',
          'Your activity was too short to save. Try tracking for a longer distance.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error stopping tracking:', error);
      Alert.alert('Error', 'Failed to stop tracking.');
    }
  };

  const handleDiscardActivity = () => {
    Alert.alert(
      'Discard Activity',
      'Are you sure you want to discard this activity? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setShowSaveModal(false);
            setActivityStats(null);
            setRoutePath([]);
            setActivityPhotos([]);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddPhoto = async () => {
    Alert.alert('Add Photo', 'Choose photo source', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

          if (!result.canceled) {
            setActivityPhotos([...activityPhotos, result.assets[0].uri]);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

          if (!result.canceled) {
            setActivityPhotos([...activityPhotos, result.assets[0].uri]);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...activityPhotos];
    newPhotos.splice(index, 1);
    setActivityPhotos(newPhotos);
  };

  const handleSaveActivity = async () => {
    try {
      setIsSaving(true);

      const activity = {
        id: `activity_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        type: activityType,
        title: activityTitle || `${capitalize(activityType)} Activity`,
        description: activityDescription,
        distance: activityStats.distance,
        duration: activityStats.duration,
        averageSpeed: activityStats.averageSpeed,
        averagePace: activityStats.averagePace,
        maxSpeed: activityStats.maxSpeed,
        elevation: activityStats.elevation,
        photos: activityPhotos,
        route: routePath,
        calories: gpsService.calculateCalories(activityStats.distance, activityStats.duration),
        createdAt: Date.now(),
        likes: 0,
        comments: 0,
      };

      // Save to AsyncStorage
      const existingActivities = await AsyncStorage.getItem('@my_activities');
      const activities = existingActivities ? JSON.parse(existingActivities) : [];
      activities.unshift(activity);
      await AsyncStorage.setItem('@my_activities', JSON.stringify(activities));

      // TODO: Save to backend
      // await activityAPI.saveActivity(activity);

      Alert.alert('Success', 'Activity saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowSaveModal(false);
            navigation.navigate('ActivityDetail', { activity });
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Failed to save activity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getActivityIcon = () => {
    const icons = {
      running: 'walk',
      cycling: 'bicycle',
      hiking: 'trending-up',
      swimming: 'water',
    };
    return icons[activityType] || 'fitness';
  };

  const formatDuration = (ms) => {
    return gpsService.formatDuration(ms);
  };

  const formatDistance = (meters) => {
    return gpsService.formatDistance(meters);
  };

  const formatPace = (minPerKm) => {
    return gpsService.formatPace(minPerKm);
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.latitude || -1.286389,
            longitude: currentLocation?.longitude || 36.817223,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
        >
          {routePath.length > 0 && (
            <Polyline
              coordinates={routePath}
              strokeColor={COLORS.secondary}
              strokeWidth={4}
            />
          )}

          {currentLocation && isTracking && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
            >
              <View style={styles.currentLocationMarker}>
                <Ionicons name={getActivityIcon()} size={20} color={COLORS.white} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isTracking) {
              Alert.alert(
                'Stop Tracking',
                'Do you want to stop tracking and discard this activity?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Stop',
                    style: 'destructive',
                    onPress: async () => {
                      await gpsService.stopTracking();
                      navigation.goBack();
                    },
                  },
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      {/* Stats Panel */}
      <View style={styles.statsPanel}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>
              {formatDistance(activityStats?.distance || 0)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>
              {formatDuration(activityStats?.duration || 0)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg Pace</Text>
            <Text style={styles.statValue}>
              {formatPace(activityStats?.averagePace || 0)}
              <Text style={styles.statUnit}> /km</Text>
            </Text>
          </View>
        </View>

        {activityStats && !!activityStats.elevation && (
          <View style={styles.elevationRow}>
            <View style={styles.elevationItem}>
              <Ionicons name="arrow-up" size={16} color={COLORS.accent} />
              <Text style={styles.elevationText}>
                {Math.round(activityStats.elevation.gain || 0)}m
              </Text>
            </View>
            <View style={styles.elevationItem}>
              <Ionicons name="trending-up" size={16} color={COLORS.gray} />
              <Text style={styles.elevationText}>
                {Math.round(activityStats.elevation.max || 0)}m
              </Text>
            </View>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {!isTracking ? (
            <TouchableOpacity
              style={[styles.startButton, isLoading && styles.disabledButton]}
              onPress={handleStartTracking}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="play" size={32} color={COLORS.white} />
                  <Text style={styles.startButtonText}>Start</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.trackingControls}>
              {!isPaused ? (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={handlePauseTracking}
                >
                  <Ionicons name="pause" size={32} color={COLORS.white} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={handleResumeTracking}
                >
                  <Ionicons name="play" size={32} color={COLORS.white} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopTracking}
              >
                <Ionicons name="stop" size={32} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Save Activity Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleDiscardActivity}>
              <Text style={styles.discardText}>Discard</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Save Activity</Text>
            <TouchableOpacity
              onPress={handleSaveActivity}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Activity Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {formatDistance(activityStats?.distance || 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Distance</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {formatDuration(activityStats?.duration || 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Duration</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {formatPace(activityStats?.averagePace || 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Avg Pace</Text>
                </View>
              </View>
            </View>

            {/* Title Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder={`${capitalize(activityType)} Activity`}
                value={activityTitle}
                onChangeText={setActivityTitle}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How did it go?"
                value={activityDescription}
                onChangeText={setActivityDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Photos */}
            <View style={styles.inputSection}>
              <View style={styles.photoHeader}>
                <Text style={styles.inputLabel}>Photos</Text>
                <TouchableOpacity onPress={handleAddPhoto}>
                  <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {activityPhotos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photosContainer}
                >
                  {activityPhotos.map((photo, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Image source={{ uri: photo }} style={styles.photo} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
  },
  currentLocationMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  statsPanel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    ...SHADOW_LARGE,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  statUnit: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  elevationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  elevationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  elevationText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_LARGE,
  },
  disabledButton: {
    opacity: 0.6,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: 'bold',
    marginTop: 4,
  },
  trackingControls: {
    flexDirection: 'row',
    gap: 20,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
  },
  resumeButton: {
    backgroundColor: COLORS.accent,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
  },
  stopButton: {
    backgroundColor: COLORS.error,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  discardText: {
    fontSize: SIZES.md,
    color: COLORS.error,
  },
  saveText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: 20,
    marginBottom: 20,
    ...SHADOW_MEDIUM,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: 15,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoItem: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadius,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
});

export default ActivityTrackerScreen;
