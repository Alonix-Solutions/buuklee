import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import ChallengeCard from '../components/ChallengeCard';
import ClubCard from '../components/ClubCard';
import HotelCard from '../components/HotelCard';
import activityService from '../services/activityService';
import clubService from '../services/clubService';
import placeService from '../services/placeService';
import locationService from '../services/locationService';

const ExploreScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('challenges');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -200],
    extrapolate: 'clamp',
  });

  const Tab = ({ title, value, icon }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === value && styles.activeTab]}
      onPress={() => setActiveTab(value)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, activeTab === value && styles.activeIconContainer]}>
        <Ionicons
          name={icon}
          size={18}
          color={activeTab === value ? COLORS.white : COLORS.primary}
        />
      </View>
      <Text
        style={[
          styles.tabText,
          activeTab === value && styles.activeTabText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const FilterButton = ({ label, icon }) => (
    <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
      <Ionicons name={icon} size={14} color={COLORS.darkGray} />
      <Text style={styles.filterButtonText}>{label}</Text>
      <Ionicons name="chevron-down" size={12} color={COLORS.gray} />
    </TouchableOpacity>
  );

  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);


  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'challenges') {
        const result = await activityService.getActivities({ status: 'upcoming' });
        setActivities(result.activities || []);
      } else if (activeTab === 'clubs') {
        const result = await clubService.getClubs();
        setClubs(result.clubs || []);
      } else if (activeTab === 'hotels') {
        // Use Google Places for Hotels
        const mauritiusCenter = { latitude: -20.1609, longitude: 57.5012 };
        // Use user location if available, otherwise default
        const results = await locationService.getNearbyPlaces('lodging', mauritiusCenter, 10000);
        setHotels(results);
      } else if (activeTab === 'restaurants') {
        // Use Google Places for Restaurants
        const mauritiusCenter = { latitude: -20.1609, longitude: 57.5012 };
        const results = await locationService.getNearbyPlaces('restaurant', mauritiusCenter, 10000);
        setRestaurants(results);
      }
    } catch (error) {
      console.error('Load data error:', error);
      // Fallback/Silent fail for robust UI
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
      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerHeight }] }]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search-outline" size={18} color={COLORS.gray} />
            <Text style={styles.searchPlaceholder}>Search {activeTab}...</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          <Tab title="Challenges" value="challenges" icon="trophy" />
          <Tab title="Clubs" value="clubs" icon="people" />
          <Tab title="Hotels" value="hotels" icon="business" />
          <Tab title="Restaurants" value="restaurants" icon="restaurant" />
          <Tab title="Attractions" value="attractions" icon="location" />
        </ScrollView>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <FilterButton label="Date" icon="calendar-outline" />
          <FilterButton label="Distance" icon="navigate-outline" />
          <FilterButton label="Difficulty" icon="barbell-outline" />
          <FilterButton label="Price" icon="cash-outline" />
          <FilterButton label="More" icon="options-outline" />
        </ScrollView>
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
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
                <Text style={styles.resultCount}>{activities.length} {activities.length === 1 ? 'challenge' : 'challenges'} found</Text>
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
                        availableSeats: Math.max(0, (activity.organizerServices?.transport?.maxSeats || 0) - (activity.organizerServices?.transport?.bookedSeats || 0))
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
                    <Text style={styles.emptyText}>No challenges found</Text>
                    <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                  </View>
                )}
              </>
            )}

            {activeTab === 'clubs' && (
              <>
                <Text style={styles.resultCount}>{clubs.length} {clubs.length === 1 ? 'club' : 'clubs'} found</Text>
                {clubs.length > 0 ? (
                  clubs.map((club) => (
                    <ClubCard
                      key={club._id || club.id}
                      club={{
                        id: club._id || club.id,
                        name: club.name,
                        description: club.description,
                        members: typeof club.memberCount === 'number' ? club.memberCount : (Array.isArray(club.members) ? club.members.length : 0),
                        logo: club.photo || 'https://via.placeholder.com/100',
                        coverPhoto: club.photo || 'https://via.placeholder.com/400x200',
                        type: club.type || 'multi-sport',
                        location: club.location?.address || 'Mauritius'
                      }}
                      onPress={() =>
                        navigation.navigate('ClubDetail', { clubId: club._id || club.id })
                      }
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={64} color={COLORS.lightGray} />
                    <Text style={styles.emptyText}>No clubs found</Text>
                    <Text style={styles.emptySubtext}>Be the first to create a club!</Text>
                  </View>
                )}
              </>
            )}

            {activeTab === 'hotels' && (
              <View>
                <View style={styles.mapViewButton}>
                  <Ionicons name="map-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.mapViewText}>View on Map</Text>
                </View>
                <Text style={styles.resultCount}>
                  {String(hotels.length)} hotels found {hotels.length > 0 && hotels[0].source === 'google' ? '(via Google Places)' : ''}
                </Text>
                {hotels.map((hotel, index) => (
                  <HotelCard
                    key={`${hotel._id || hotel.id || 'hotel'}-${index}`}
                    hotel={hotel}
                    onPress={() =>
                      navigation.navigate('HotelDetail', { hotel })
                    }
                  />
                ))}
              </View>
            )}

            {activeTab === 'restaurants' && (
              <View>
                <View style={styles.mapViewButton}>
                  <Ionicons name="map-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.mapViewText}>View on Map</Text>
                </View>
                <Text style={styles.resultCount}>
                  {String(restaurants.length)} restaurants found {restaurants.length > 0 && restaurants[0].source === 'google' ? '(via Google Places)' : ''}
                </Text>
                {restaurants.map((restaurant, index) => (
                  <HotelCard
                    key={`${restaurant._id || restaurant.id || 'restaurant'}-${index}`}
                    hotel={{
                      ...restaurant,
                      id: restaurant._id || restaurant.id,
                      price: restaurant.priceRange?.min || 0,
                      currency: restaurant.priceRange?.currency || 'MUR',
                      amenities: restaurant.specialties
                    }}
                    onPress={() =>
                      navigation.navigate('RestaurantDetail', { restaurant: restaurant })
                    }
                  />
                ))}
              </View>
            )}

            {activeTab === 'attractions' && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="location" size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyText}>Attractions coming soon!</Text>
                <Text style={styles.emptySubtext}>Discover the best places to visit</Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </>
        )}
        {/* End of loading check */}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightestGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  tabsContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightestGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Consistent liquid glass
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: COLORS.white,
  },
  filtersContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 6,
    backgroundColor: COLORS.white,
  },
  filterButtonText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 170,
  },
  resultCount: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
  },
  mapViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    marginHorizontal: SIZES.padding,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapViewText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: SIZES.padding,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.lightestGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

import withTabBarToggle from '../components/withTabBarToggle';
export default withTabBarToggle(ExploreScreen);
