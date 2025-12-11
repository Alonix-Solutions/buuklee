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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import driverService from '../services/driverService';
import DriverCard from '../components/DriverCard';

const DriverSelectionScreen = ({ navigation, route }) => {
  const { pickup, dropoff, serviceType } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -120],
    extrapolate: 'clamp',
  });

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Top Rated', value: 'top_rated' },
    { label: 'Sedan', value: 'sedan' },
    { label: 'SUV', value: 'suv' },
  ];

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const result = await driverService.getDrivers();
      setDrivers(result.drivers || []);
    } catch (error) {
      console.error('Load drivers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrivers();
    setRefreshing(false);
  };

  const filteredDrivers = drivers.filter(driver => {
    const name = driver.name || '';
    const address = driver.location?.address || '';
    const vehicleType = driver.vehicle?.type || '';

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === 'available') {
      matchesFilter = driver.available;
    } else if (selectedFilter === 'top_rated') {
      matchesFilter = (driver.rating || 0) >= 4.8;
    } else if (selectedFilter === 'sedan' || selectedFilter === 'suv') {
      matchesFilter = vehicleType === selectedFilter;
    }

    return matchesSearch && matchesFilter;
  });

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === value && styles.activeFilterButton]}
      onPress={() => setSelectedFilter(value)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === value && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerHeight }] }]}>
        {/* Trip Info */}
        {pickup && dropoff && (
          <View style={styles.tripInfo}>
            <View style={styles.tripRow}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.tripText} numberOfLines={1}>
                {pickup} → {dropoff}
              </Text>
            </View>
            {serviceType && (
              <Text style={styles.serviceType}>{serviceType}</Text>
            )}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search drivers..."
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <FilterButton
              key={filter.value}
              label={filter.label}
              value={filter.value}
            />
          ))}
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
        <Text style={styles.resultCount}>
          {filteredDrivers.length} {filteredDrivers.length === 1 ? 'driver' : 'drivers'} available
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map((driver, index) => (
            <DriverCard
              key={driver._id || driver.id || index}
              driver={driver}
              onPress={() =>
                navigation.navigate('RideRequest', {
                  driverId: driver._id || driver.id,
                  driver,
                  pickup,
                  dropoff,
                  serviceType
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="car-outline" size={48} color={COLORS.gray} />
            </View>
            <Text style={styles.emptyText}>No drivers found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
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
  tripInfo: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.lightestGray,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  serviceType: {
    fontSize: 12,
    color: COLORS.gray,
    textTransform: 'capitalize',
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
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
  },
  filtersContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 180,
  },
  resultCount: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: SIZES.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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

export default DriverSelectionScreen;
