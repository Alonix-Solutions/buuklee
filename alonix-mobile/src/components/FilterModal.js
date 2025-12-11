import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import Slider from '@react-native-community/slider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.85;

const FilterModal = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  resultCount = 0,
}) => {
  // Filter states
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 1000]);
  const [distance, setDistance] = useState(initialFilters.distance || 50);
  const [difficulty, setDifficulty] = useState(initialFilters.difficulty || []);
  const [activityTypes, setActivityTypes] = useState(initialFilters.activityTypes || []);
  const [rating, setRating] = useState(initialFilters.rating || 0);
  const [startDate, setStartDate] = useState(initialFilters.startDate || null);
  const [endDate, setEndDate] = useState(initialFilters.endDate || null);
  const [amenities, setAmenities] = useState(initialFilters.amenities || []);

  // Animation values
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const difficultyOptions = [
    { id: 'easy', label: 'Easy', icon: 'happy-outline', color: COLORS.easy },
    { id: 'moderate', label: 'Moderate', icon: 'sunny-outline', color: COLORS.medium },
    { id: 'hard', label: 'Hard', icon: 'flame-outline', color: COLORS.hard },
    { id: 'extreme', label: 'Extreme', icon: 'thunderstorm-outline', color: COLORS.extreme },
  ];

  const activityTypeOptions = [
    { id: 'running', label: 'Running', icon: 'walk', color: COLORS.running },
    { id: 'cycling', label: 'Cycling', icon: 'bicycle', color: COLORS.cycling },
    { id: 'hiking', label: 'Hiking', icon: 'trending-up', color: COLORS.hiking },
    { id: 'swimming', label: 'Swimming', icon: 'water', color: COLORS.swimming },
  ];

  const amenitiesOptions = [
    { id: 'parking', label: 'Parking', icon: 'car-outline' },
    { id: 'restrooms', label: 'Restrooms', icon: 'home-outline' },
    { id: 'water', label: 'Water Stations', icon: 'water-outline' },
    { id: 'wifi', label: 'WiFi', icon: 'wifi-outline' },
    { id: 'food', label: 'Food & Drinks', icon: 'restaurant-outline' },
    { id: 'lockers', label: 'Lockers', icon: 'lock-closed-outline' },
  ];

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const toggleDifficulty = (id) => {
    setDifficulty((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleActivityType = (id) => {
    setActivityTypes((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleAmenity = (id) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setPriceRange([0, 1000]);
    setDistance(50);
    setDifficulty([]);
    setActivityTypes([]);
    setRating(0);
    setStartDate(null);
    setEndDate(null);
    setAmenities([]);
  };

  const handleApply = () => {
    const filters = {
      priceRange,
      distance,
      difficulty,
      activityTypes,
      rating,
      startDate,
      endDate,
      amenities,
    };
    onApply(filters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    if (distance < 50) count++;
    if (difficulty.length > 0) count++;
    if (activityTypes.length > 0) count++;
    if (rating > 0) count++;
    if (startDate || endDate) count++;
    if (amenities.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop with blur effect */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: overlayAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Filters</Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterCountBadge}>
                  <Text style={styles.filterCountText}>{activeFilterCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearAllButton}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Filters Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <Text style={styles.priceLabel}>
                  ${priceRange[0]} - ${priceRange[1]}
                </Text>
              </View>
              <View style={styles.dualSliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  value={priceRange[0]}
                  onValueChange={(value) => setPriceRange([Math.round(value), priceRange[1]])}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.lightGray}
                  thumbTintColor={COLORS.primary}
                  step={10}
                />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  value={priceRange[1]}
                  onValueChange={(value) => setPriceRange([priceRange[0], Math.round(value)])}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.lightGray}
                  thumbTintColor={COLORS.primary}
                  step={10}
                />
              </View>
            </View>

            {/* Distance */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Distance Radius</Text>
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>{distance} km</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={100}
                value={distance}
                onValueChange={(value) => setDistance(Math.round(value))}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.lightGray}
                thumbTintColor={COLORS.primary}
                step={1}
              />
            </View>

            {/* Difficulty */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Difficulty Level</Text>
              <View style={styles.chipContainer}>
                {difficultyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chip,
                      difficulty.includes(option.id) && {
                        backgroundColor: option.color,
                        borderColor: option.color,
                      },
                    ]}
                    onPress={() => toggleDifficulty(option.id)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={difficulty.includes(option.id) ? COLORS.white : COLORS.gray}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        difficulty.includes(option.id) && styles.chipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Activity Types */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Activity Type</Text>
              <View style={styles.chipContainer}>
                {activityTypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chip,
                      activityTypes.includes(option.id) && {
                        backgroundColor: option.color,
                        borderColor: option.color,
                      },
                    ]}
                    onPress={() => toggleActivityType(option.id)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={activityTypes.includes(option.id) ? COLORS.white : COLORS.gray}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        activityTypes.includes(option.id) && styles.chipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? COLORS.warning : COLORS.lightGray}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>{rating}.0 and above</Text>
              )}
            </View>

            {/* Amenities */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenitiesOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.amenityChip,
                      amenities.includes(option.id) && styles.amenityChipActive,
                    ]}
                    onPress={() => toggleAmenity(option.id)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={amenities.includes(option.id) ? COLORS.white : COLORS.gray}
                    />
                    <Text
                      style={[
                        styles.amenityText,
                        amenities.includes(option.id) && styles.amenityTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>
                Apply Filters {resultCount > 0 && `(${resultCount} results)`}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOW_LARGE,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  filterCountBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  clearAllButton: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  priceRangeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dualSliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  distanceContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceLabel: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 6,
  },
  chipText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 6,
    minWidth: '45%',
  },
  amenityChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  amenityText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  amenityTextActive: {
    color: COLORS.white,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.buttonRadius,
    paddingVertical: 16,
    alignItems: 'center',
    ...SHADOW_MEDIUM,
  },
  applyButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default FilterModal;
