import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

const MyBookingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const result = await bookingService.getUserBookings(user._id || user.id);
      setBookings(result.bookings || result || []);
    } catch (error) {
      console.error('Load bookings error:', error);
      Alert.alert('Error', error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadBookings();
    setIsRefreshing(false);
  };

  const cancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings();
      return { success: true };
    } catch (error) {
      console.error('Cancel booking error:', error);
      return { success: false, error: error.message };
    }
  };

  const getBookingStats = () => {
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length,
    };
  };

  const bookingTypes = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'hotel', label: 'Hotels', icon: 'bed-outline' },
    { id: 'car', label: 'Cars', icon: 'car-outline' },
    { id: 'driver', label: 'Drivers', icon: 'car-sport-outline' },
    { id: 'challenge', label: 'Challenges', icon: 'trophy-outline' },
  ];

  const bookingStatuses = [
    { id: 'all', label: 'All', color: COLORS.gray },
    { id: 'pending', label: 'Pending', color: COLORS.warning },
    { id: 'confirmed', label: 'Confirmed', color: COLORS.success },
    { id: 'completed', label: 'Completed', color: COLORS.info },
    { id: 'cancelled', label: 'Cancelled', color: COLORS.error },
  ];



  const getFilteredBookings = () => {
    let filtered = [...bookings];

    if (selectedType !== 'all') {
      filtered = filtered.filter((b) => b.bookingType === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === selectedStatus);
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const handleCancelBooking = (booking) => {
    if (booking.status === 'cancelled') {
      Alert.alert('Already Cancelled', 'This booking has already been cancelled');
      return;
    }

    if (booking.status === 'completed') {
      Alert.alert('Cannot Cancel', 'Completed bookings cannot be cancelled');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelBooking(booking._id || booking.id);
            if (result.success) {
              Alert.alert('Success', 'Booking cancelled successfully');
            } else {
              Alert.alert('Error', result.error || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (booking) => {
    navigation.navigate('MyBookings'); // Can navigate to detail screen if exists
  };

  const getItemName = (booking) => {
    if (booking.bookingType === 'hotel' || booking.bookingType === 'restaurant') {
      return booking.bookingDetails?.name || `${booking.bookingType} Booking`;
    } else if (booking.bookingType === 'vehicle') {
      return `${booking.bookingDetails?.make || ''} ${booking.bookingDetails?.model || ''}`.trim() || 'Vehicle Booking';
    } else if (booking.bookingType === 'driver') {
      return booking.bookingDetails?.name || 'Driver Booking';
    } else if (booking.bookingType === 'activity_transport' || booking.bookingType === 'activity_accommodation') {
      return `Activity ${booking.bookingType === 'activity_transport' ? 'Transport' : 'Accommodation'}`;
    }
    return 'Booking';
  };

  const getBookingIcon = (type) => {
    const icons = {
      hotel: 'bed-outline',
      restaurant: 'restaurant-outline',
      vehicle: 'car-outline',
      driver: 'car-sport-outline',
      activity_transport: 'car-outline',
      activity_accommodation: 'bed-outline',
    };
    return icons[type] || 'document-outline';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: COLORS.warning,
      confirmed: COLORS.success,
      completed: COLORS.info,
      cancelled: COLORS.error,
    };
    return colors[status] || COLORS.gray;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredBookings = getFilteredBookings();
  const stats = getBookingStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {stats.confirmed}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>
            {stats.pending}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {bookingTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterChip,
              selectedType === type.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(type.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={type.icon}
              size={18}
              color={selectedType === type.id ? COLORS.white : COLORS.gray}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedType === type.id && styles.filterChipTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusScroll}
        contentContainerStyle={styles.filterContent}
      >
        {bookingStatuses.map((status) => (
          <TouchableOpacity
            key={status.id}
            style={[
              styles.statusChip,
              selectedStatus === status.id && {
                backgroundColor: status.color + '20',
                borderColor: status.color,
              },
            ]}
            onPress={() => setSelectedStatus(status.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.statusChipText,
                selectedStatus === status.id && { color: status.color },
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateTitle}>No bookings found</Text>
            <Text style={styles.emptyStateText}>
              {selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Start exploring and make your first booking!'}
            </Text>
            {selectedType === 'all' && selectedStatus === 'all' && (
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Explore')}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreButtonText}>Explore Now</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking._id || booking.id} style={styles.bookingCard}>
              {/* Header */}
              <View style={styles.bookingHeader}>
                <View style={styles.bookingHeaderLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={getBookingIcon(booking.bookingType)}
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.bookingHeaderText}>
                    <Text style={styles.bookingType}>
                      {booking.bookingType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                    <Text style={styles.bookingDate}>
                      {formatDate(booking.createdAt)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(booking.status) },
                    ]}
                  >
                    {capitalize(booking.status)}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.bookingContent}>
                <Text style={styles.bookingItemName}>{getItemName(booking)}</Text>
                <View style={styles.bookingDetails}>
                  <View style={styles.bookingDetail}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={COLORS.gray}
                    />
                    <Text style={styles.bookingDetailText}>
                      {booking._id?.toString().substring(0, 8) || 'N/A'}
                    </Text>
                  </View>
                  {booking.totalPrice && (
                    <View style={styles.bookingDetail}>
                      <Ionicons name="card-outline" size={16} color={COLORS.gray} />
                      <Text style={styles.bookingDetailText}>
                        {booking.totalPrice} {booking.currency || 'MUR'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.bookingActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewDetails(booking)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelBooking(booking)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  filterScroll: {
    marginTop: 16,
  },
  statusScroll: {
    marginTop: 12,
  },
  filterContent: {
    paddingHorizontal: SIZES.padding,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.lightestGray,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray,
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: COLORS.lightestGray,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
    marginRight: 8,
  },
  statusChipText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray,
  },
  listContent: {
    padding: SIZES.padding,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  exploreButtonText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOW_SMALL,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingHeaderText: {
    flex: 1,
  },
  bookingType: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  bookingContent: {
    marginBottom: 12,
  },
  bookingItemName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  bookingDetailText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  bookingActions: {
    flexDirection: 'row',
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  cancelButton: {
    backgroundColor: COLORS.error + '10',
  },
  cancelButtonText: {
    color: COLORS.error,
  },
});

export default MyBookingsScreen;
