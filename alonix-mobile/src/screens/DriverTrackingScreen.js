import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import driverService from '../services/driverService';

const { width, height } = Dimensions.get('window');

const DriverTrackingScreen = ({ route, navigation }) => {
  const { driverId, driver: passedDriver, pickup, dropoff } = route.params || {};
  const [driver, setDriver] = useState(passedDriver || null);
  const [loading, setLoading] = useState(!passedDriver && driverId);
  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!passedDriver && driverId) {
      loadDriver();
    }
  }, [driverId]);

  const loadDriver = async () => {
    try {
      setLoading(true);
      const loadedDriver = await driverService.getDriver(driverId);
      setDriver(loadedDriver);
    } catch (error) {
      console.error('Load driver error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate driver movement
  const [driverLocation, setDriverLocation] = useState(driver?.location || passedDriver?.location || {
    latitude: -20.1609,
    longitude: 57.5012,
  });

  const [rideStatus, setRideStatus] = useState('on_way'); // on_way, arrived, in_progress, completed

  // Mauritius center coordinates
  const mauritiusRegion = {
    latitude: -20.1609,
    longitude: 57.5012,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  // Destination coordinates (simulated dropoff location in Mauritius)
  const destination = {
    latitude: -20.1745,
    longitude: 57.5125,
  };

  // Pickup location (simulated)
  const pickupLocation = {
    latitude: -20.1689,
    longitude: 57.5089,
  };

  useEffect(() => {
    // Animate driver info card
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Simulate driver movement every 3 seconds
    const interval = setInterval(() => {
      setDriverLocation((prevLocation) => ({
        latitude: prevLocation.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prevLocation.longitude + (Math.random() - 0.5) * 0.001,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Center map on driver
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...driverLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [driverLocation]);

  if (!driver) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Driver not found</Text>
      </View>
    );
  }

  const getStatusConfig = () => {
    switch (rideStatus) {
      case 'on_way':
        return {
          title: 'Driver is on the way',
          subtitle: 'Estimated arrival: 5 mins',
          icon: 'car',
          color: COLORS.primary,
        };
      case 'arrived':
        return {
          title: 'Driver has arrived',
          subtitle: 'Waiting at pickup location',
          icon: 'checkmark-circle',
          color: COLORS.success,
        };
      case 'in_progress':
        return {
          title: 'Trip in progress',
          subtitle: 'Estimated arrival: 15 mins',
          icon: 'navigate',
          color: COLORS.warning,
        };
      case 'completed':
        return {
          title: 'Trip completed',
          subtitle: 'Thank you for riding with us',
          icon: 'checkmark-done-circle',
          color: COLORS.success,
        };
      default:
        return {
          title: 'Tracking driver',
          subtitle: '',
          icon: 'location',
          color: COLORS.primary,
        };
    }
  };

  const statusConfig = getStatusConfig();

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mauritiusRegion}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsTraffic
      >
        {/* Driver Marker */}
        <Marker
          coordinate={driverLocation}
          title={driver.name}
          description={`${driver.vehicle.make} ${driver.vehicle.model}`}
          rotation={45}
        >
          <View style={styles.driverMarker}>
            <View style={styles.driverMarkerInner}>
              <Ionicons name="car" size={20} color={COLORS.white} />
            </View>
          </View>
        </Marker>

        {/* Pickup Marker */}
        <Marker
          coordinate={pickupLocation}
          title="Pickup Location"
          description={pickup}
          pinColor={COLORS.primary}
        >
          <View style={styles.pickupMarker}>
            <Ionicons name="location" size={30} color={COLORS.primary} />
          </View>
        </Marker>

        {/* Destination Marker */}
        <Marker
          coordinate={destination}
          title="Destination"
          description={dropoff}
          pinColor={COLORS.success}
        >
          <View style={styles.destinationMarker}>
            <Ionicons name="flag" size={30} color={COLORS.success} />
          </View>
        </Marker>

        {/* Route Polyline */}
        <Polyline
          coordinates={[pickupLocation, driverLocation, destination]}
          strokeColor={COLORS.primary}
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <View style={styles.statusBadge}>
          <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.title}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      {/* Driver Info Card */}
      <Animated.View style={[styles.driverCard, { transform: [{ translateY }] }]}>
        <View style={styles.dragHandle} />

        <View style={styles.driverCardHeader}>
          <Image
            source={{ uri: driver.avatar }}
            style={styles.driverAvatar}
            resizeMode="cover"
          />
          <View style={styles.driverInfo}>
            <View style={styles.driverNameRow}>
              <Text style={styles.driverName}>{driver.name}</Text>
              {driver.verified && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.rating}>{driver.rating}</Text>
              <Text style={styles.reviewCount}>({driver.reviewCount} reviews)</Text>
            </View>
            <Text style={styles.vehicleInfo}>
              {driver.vehicle.make} {driver.vehicle.model} • {driver.vehicle.plateNumber}
            </Text>
          </View>
        </View>

        <View style={styles.statusSection}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>{statusConfig.subtitle}</Text>
            {rideStatus === 'on_way' && (
              <Text style={styles.statusDetail}>Distance: 2.3 km</Text>
            )}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={styles.actionIcon}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={styles.actionIcon}>
              <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <View style={[styles.actionIcon, styles.cancelIcon]}>
              <Ionicons name="close" size={20} color={COLORS.error} />
            </View>
            <Text style={[styles.actionLabel, styles.cancelLabel]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_SMALL,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...SHADOW_SMALL,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_SMALL,
  },
  driverMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
  },
  driverMarkerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupMarker: {
    alignItems: 'center',
  },
  destinationMarker: {
    alignItems: 'center',
  },
  driverCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    ...SHADOW_LARGE,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // Neutral divider
    alignSelf: 'center',
    marginBottom: 16,
  },
  driverCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGray,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 2,
  },
  vehicleInfo: {
    fontSize: 13,
    color: COLORS.gray,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightestGray,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  statusDetail: {
    fontSize: 12,
    color: COLORS.gray,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  cancelButton: {
    // Additional styles for cancel button
  },
  cancelIcon: {
    backgroundColor: COLORS.error + '15',
  },
  cancelLabel: {
    color: COLORS.error,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
});

export default DriverTrackingScreen;
