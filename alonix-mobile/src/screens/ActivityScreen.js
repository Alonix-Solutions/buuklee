import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { capitalize } from '../utils/helpers';
import ChallengeCard from '../components/ChallengeCard';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import clubService from '../services/clubService';
import bookingService from '../services/bookingService';
import { formatDateTime } from '../utils/helpers';

const ActivityScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('challenges');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [bookings, setBookings] = useState([]);

  const Tab = ({ title, value, count }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === value && styles.activeTab]}
      onPress={() => setActiveTab(value)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === value && styles.activeTabText,
        ]}
      >
        {title}
      </Text>
      {count > 0 && (
        <View style={[
          styles.badge,
          activeTab === value && styles.activeBadge
        ]}>
          <Text style={[
            styles.badgeText,
            activeTab === value && styles.activeBadgeText
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const RideShareCard = ({ ride }) => (
    <TouchableOpacity style={styles.rideCard} activeOpacity={0.9}>
      <View style={styles.rideHeader}>
        <Ionicons name="car" size={24} color={COLORS.primary} />
        <View style={styles.rideHeaderText}>
          <Text style={styles.rideTitle}>Ride to Challenge</Text>
          <Text style={styles.rideSubtitle}>
            {ride.availableSeats} of {ride.totalSeats} seats available
          </Text>
        </View>
        <Text style={styles.rideCost}>{ride.costPerPerson} MUR</Text>
      </View>

      <View style={styles.rideLocations}>
        <View style={styles.locationRow}>
          <Ionicons name="ellipse" size={12} color={COLORS.success} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.from.address}
          </Text>
        </View>
        <View style={styles.locationDivider} />
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={COLORS.error} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.to.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const BookingCard = ({ booking }) => {
    const getBookingTitle = () => {
      if (booking.itemId && typeof booking.itemId === 'object') {
        return booking.itemId.name || `${booking.type} Booking`;
      }
      return `${capitalize(booking.type)} Booking`;
    };

    const getBookingDate = () => {
      if (booking.details) {
        if (booking.details.checkIn) {
          return formatDateTime(booking.details.checkIn);
        }
        if (booking.details.reservationDate) {
          return formatDateTime(booking.details.reservationDate);
        }
        if (booking.details.rentalStart) {
          return formatDateTime(booking.details.rentalStart);
        }
      }
      return formatDateTime(booking.createdAt);
    };

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MyBookings')}
      >
        <View style={styles.bookingIcon}>
          <Ionicons
            name={booking.type === 'hotel' ? 'bed' : booking.type === 'restaurant' ? 'restaurant' : 'car'}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.bookingContent}>
          <Text style={styles.bookingTitle}>{getBookingTitle()}</Text>
          <Text style={styles.bookingDate}>{getBookingDate()}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: booking.status === 'confirmed' ? COLORS.success + '20' : COLORS.warning + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: booking.status === 'confirmed' ? COLORS.success : COLORS.warning }
            ]}>
              {capitalize(booking.status)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    );
  };

  // Load data
  useEffect(() => {
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (activeTab === 'challenges') {
        const result = await activityService.getUserActivities(user._id || user.id, 'all', 'upcoming');
        setActivities(result || []);
      } else if (activeTab === 'clubs') {
        const result = await clubService.getUserClubs(user._id || user.id);
        setClubs(result || []);
      } else if (activeTab === 'bookings') {
        const result = await bookingService.getUserBookings(user._id || user.id);
        setBookings(result || []);
      }
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <Tab title="My Challenges" value="challenges" count={activities.length} />
          <Tab title="Ride Shares" value="rides" count={0} />
          <Tab title="Bookings" value="bookings" count={bookings.length} />
          <Tab title="Clubs" value="clubs" count={clubs.length} />
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {activeTab === 'challenges' && (
              <>
                <Text style={styles.resultCount}>
                  {activities.length} upcoming {activities.length === 1 ? 'challenge' : 'challenges'}
                </Text>
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <ChallengeCard
                      key={activity._id || activity.id}
                      challenge={{
                        id: activity._id || activity.id,
                        title: activity.title,
                        description: activity.description,
                        activity: activity.activityType,
                        difficulty: activity.difficulty,
                        date: activity.date,
                        distance: activity.distance,
                        elevation: activity.elevation,
                        currentParticipants: activity.currentParticipants,
                        maxParticipants: activity.maxParticipants,
                        organizer: {
                          name: activity.organizerId?.name || 'Unknown',
                          photo: activity.organizerId?.profilePhoto,
                          rating: 4.5
                        },
                        coverPhoto: activity.photos?.[0] || 'https://via.placeholder.com/400x200',
                        rideSharingAvailable: activity.organizerServices?.transport?.available || false,
                        availableSeats: activity.organizerServices?.transport?.maxSeats - activity.organizerServices?.transport?.bookedSeats || 0
                      }}
                      onPress={() =>
                        navigation.navigate('ChallengeDetail', {
                          challengeId: activity._id || activity.id,
                          activity: activity
                        })
                      }
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="trophy-outline" size={64} color={COLORS.lightGray} />
                    <Text style={styles.emptyText}>No activities yet</Text>
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={() => navigation.navigate('Create')}
                    >
                      <Text style={styles.emptyButtonText}>Create Activity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.emptyButton, { marginTop: 12 }]}
                      onPress={() => navigation.navigate('ActivityTracker', { activityType: 'running' })}
                    >
                      <Text style={styles.emptyButtonText}>Start Run</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {activeTab === 'rides' && (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={64} color={COLORS.lightGray} />
                <Text style={styles.emptyText}>Ride sharing coming soon</Text>
                <Text style={styles.emptySubtext}>Check activities for organizer transport options</Text>
              </View>
            )}

            {activeTab === 'bookings' && (
              <>
                <Text style={styles.resultCount}>
                  {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
                </Text>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <BookingCard key={booking._id || booking.id} booking={booking} />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={64} color={COLORS.lightGray} />
                    <Text style={styles.emptyText}>No bookings yet</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Explore')}>
                      <Text style={styles.emptyButtonText}>Explore Options</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {activeTab === 'clubs' && (
              <>
                {clubs.length > 0 ? (
                  <>
                    <Text style={styles.resultCount}>
                      {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'}
                    </Text>
                    {clubs.map((club) => (
                      <TouchableOpacity
                        key={club._id || club.id}
                        style={styles.clubCard}
                        onPress={() => navigation.navigate('Explore', { screen: 'ClubDetail', params: { clubId: club._id || club.id } })}
                      >
                        <Text style={styles.clubName}>{club.name}</Text>
                        <Text style={styles.clubMembers}>{typeof club.memberCount === 'number' ? club.memberCount : (Array.isArray(club.members) ? club.members.length : 0)} members</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={64} color={COLORS.lightGray} />
                    <Text style={styles.emptyText}>No clubs yet</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Explore')}>
                      <Text style={styles.emptyButtonText}>Discover Clubs</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </>
        )}

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
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  tabs: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.lightestGray,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  badge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  activeBadge: {
    backgroundColor: COLORS.primaryDark,
  },
  badgeText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  activeBadgeText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
  },
  resultCount: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
  },
  rideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  rideTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  rideSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  rideCost: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  rideLocations: {
    paddingLeft: 36,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.darkGray,
    marginLeft: 8,
    flex: 1,
  },
  locationDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.lightGray,
    marginLeft: 5,
    marginVertical: 2,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingContent: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: SIZES.base,
    color: COLORS.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  clubCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clubName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  clubMembers: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  emptySubtext: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ActivityScreen;
