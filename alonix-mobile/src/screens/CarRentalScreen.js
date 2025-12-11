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
import vehicleService from '../services/vehicleService';
import CarCard from '../components/CarCard';

const CarRentalScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -150],
    extrapolate: 'clamp',
  });

  const carTypes = [
    { label: 'All', value: 'all', icon: 'car' },
    { label: 'Sedan', value: 'sedan', icon: 'car-sport' },
    { label: 'SUV', value: 'suv', icon: 'car' },
    { label: 'Coupe', value: 'coupe', icon: 'car-sport-outline' },
    { label: 'Truck', value: 'truck', icon: 'car-outline' },
  ];

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const result = await vehicleService.getVehicles();
      setVehicles(result.vehicles || []);
    } catch (error) {
      console.error('Load vehicles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };

  const filteredCars = vehicles.filter(car => {
    const make = car.make || '';
    const model = car.model || '';
    const carType = car.car_type || car.type || '';

    const matchesSearch = make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || carType === selectedType;
    return matchesSearch && matchesType;
  });

  const TypeButton = ({ label, value, icon }) => (
    <TouchableOpacity
      style={[styles.typeButton, selectedType === value && styles.activeTypeButton]}
      onPress={() => setSelectedType(value)}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIconContainer, selectedType === value && styles.activeTypeIconContainer]}>
        <Ionicons
          name={icon}
          size={16}
          color={selectedType === value ? COLORS.white : COLORS.primary}
        />
      </View>
      <Text
        style={[
          styles.typeButtonText,
          selectedType === value && styles.activeTypeButtonText,
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cars..."
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

        {/* Car Types */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typesContainer}
        >
          {carTypes.map((type) => (
            <TypeButton
              key={type.value}
              label={type.label}
              value={type.value}
              icon={type.icon}
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
        <View style={styles.headerInfo}>
          <Text style={styles.resultCount}>
            {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} available
          </Text>
          <TouchableOpacity style={styles.sortButton} activeOpacity={0.7}>
            <Ionicons name="swap-vertical" size={16} color={COLORS.primary} />
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : filteredCars.length > 0 ? (
          filteredCars.map((car, index) => (
            <CarCard
              key={car._id || car.id || index}
              car={car}
              onPress={() =>
                navigation.navigate('CarDetail', { carId: car._id || car.id, car })
              }
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="car-outline" size={48} color={COLORS.gray} />
            </View>
            <Text style={styles.emptyText}>No cars found</Text>
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
  typesContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
  },
  activeTypeButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.lightestGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTypeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  typeButtonText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTypeButtonText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 120,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
  },
  resultCount: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  sortButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
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

export default CarRentalScreen;
