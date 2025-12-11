import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM } from '../utils/shadows';
import { formatDateTime } from '../utils/helpers';
import rideService from '../services/rideService';

const RideSharingScreen = ({ route, navigation }) => {
  const { challengeId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRides();
  }, [challengeId]);

  const loadRides = async () => {
    try {
      setLoading(true);
      const data = await rideService.getRides(challengeId);
      setRides(data);
    } catch (error) {
      console.error('Load rides error:', error);
      Alert.alert('Error', 'Failed to load rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleJoinRide = async (ride) => {
    try {
      Alert.alert(
        'Confirm Seat Request',
        `Do you want to book a seat for ${ride.price} ${ride.currency}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              await rideService.joinRide(ride._id || ride.id);
              Alert.alert('Success', 'Seat booked successfully!');
              loadRides(); // Refresh list
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to book seat');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const CostSplitCard = () => (
    <View style={styles.costSplitCard}>
      <View style={styles.costSplitHeader}>
        <Ionicons name="cash-outline" size={24} color={COLORS.success} />
        <Text style={styles.costSplitTitle}>Save Money Together</Text>
      </View>
      <Text style={styles.costSplitDescription}>
        Share rides to challenges and split costs. Typical savings: 50-70%!
      </Text>
    </View>
  );

  const RideCard = ({ ride }) => (
    <TouchableOpacity style={styles.rideCard} activeOpacity={0.9}>
      {/* Driver Info */}
      <View style={styles.driverSection}>
        <Image
          source={{ uri: ride.driverId?.profilePhoto || 'https://via.placeholder.com/50' }}
          style={styles.driverPhoto}
        />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{ride.driverId?.name || 'Driver'}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.rating}>
              {ride.driverId?.rating || 'New'} ({ride.driverId?.vehicle?.model || 'Car'})
            </Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{ride.price}</Text>
          <Text style={styles.currency}>{ride.currency}</Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeSection}>
        <View style={styles.routeLine}>
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.locationText} numberOfLines={1}>
              {ride.origin?.address}
            </Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: COLORS.error }]} />
            <Text style={styles.locationText} numberOfLines={1}>
              {ride.destination?.address}
            </Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>
            {formatDateTime(ride.date)} • {ride.time}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color={COLORS.gray} />
          <Text style={styles.detailText}>
            {ride.availableSeats} seats left
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.requestButton, ride.availableSeats === 0 && styles.disabledButton]}
        activeOpacity={0.8}
        onPress={() => handleJoinRide(ride)}
        disabled={ride.availableSeats === 0}
      >
        <Text style={styles.requestButtonText}>
          {ride.availableSeats === 0 ? 'Full' : 'Book Seat'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CostSplitCard />

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Available Rides</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreateRide')}>
              <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Offer Ride</Text>
            </TouchableOpacity>
          </View>

          {rides.length > 0 ? (
            rides.map((ride, index) => (
              <RideCard key={ride._id || index} ride={ride} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-sport-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>No rides found</Text>
              <TouchableOpacity
                style={{ marginTop: 10 }}
                onPress={() => navigation.navigate('CreateRide')}
              >
                <Text style={{ color: COLORS.primary, fontSize: 16 }}>Be the first to offer a ride!</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button for easy creation */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateRide')}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  costSplitCard: {
    backgroundColor: COLORS.success + '10',
    borderRadius: 16,
    padding: SIZES.padding,
    margin: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  costSplitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  costSplitTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginLeft: 12,
  },
  costSplitDescription: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  rideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOW_MEDIUM,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  driverPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  currency: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  routeSection: {
    marginBottom: 16,
  },
  routeLine: {
    paddingLeft: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  locationText: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    flex: 1,
  },
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.lightGray,
    marginLeft: 5,
    marginVertical: 4,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 8,
  },
  requestButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  requestButtonText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
    elevation: 5,
  }
});

export default RideSharingScreen;
