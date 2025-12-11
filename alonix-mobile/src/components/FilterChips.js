import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';

const FilterChips = ({
  activeFilters = [],
  onRemoveFilter,
  onAddFilter,
  onChipPress,
}) => {
  const filterChipCategories = [
    { id: 'price', label: 'Price', icon: 'cash-outline' },
    { id: 'distance', label: 'Distance', icon: 'location-outline' },
    { id: 'difficulty', label: 'Difficulty', icon: 'flame-outline' },
    { id: 'activity', label: 'Activity', icon: 'bicycle-outline' },
    { id: 'rating', label: 'Rating', icon: 'star-outline' },
    { id: 'date', label: 'Date', icon: 'calendar-outline' },
  ];

  const formatFilterLabel = (filter) => {
    switch (filter.type) {
      case 'price':
        return `$${filter.value[0]}-$${filter.value[1]}`;
      case 'distance':
        return `${filter.value}km`;
      case 'difficulty':
        return filter.value;
      case 'activity':
        return filter.value;
      case 'rating':
        return `${filter.value}+ stars`;
      case 'date':
        return filter.value;
      default:
        return filter.value;
    }
  };

  const getFilterIcon = (type) => {
    const category = filterChipCategories.find((c) => c.id === type);
    return category?.icon || 'options-outline';
  };

  const getFilterColor = (type) => {
    const colors = {
      price: COLORS.success,
      distance: COLORS.info,
      difficulty: COLORS.warning,
      activity: COLORS.cycling,
      rating: COLORS.warning,
      date: COLORS.primary,
    };
    return colors[type] || COLORS.primary;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Filter Chips */}
        {activeFilters.map((filter, index) => (
          <FilterChip
            key={`${filter.type}-${index}`}
            label={formatFilterLabel(filter)}
            icon={getFilterIcon(filter.type)}
            color={getFilterColor(filter.type)}
            onPress={() => onChipPress && onChipPress(filter)}
            onRemove={() => onRemoveFilter(filter)}
          />
        ))}

        {/* Add Filter Button */}
        <TouchableOpacity
          style={styles.addFilterChip}
          onPress={onAddFilter}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={20} color={COLORS.primary} />
          <Text style={styles.addFilterText}>Add Filter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const FilterChip = ({ label, icon, color, onPress, onRemove }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 5,
    }).start();
  }, []);

  const handleRemove = () => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start(() => {
      onRemove();
    });
  };

  return (
    <Animated.View
      style={[
        styles.chipWrapper,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.chip, { backgroundColor: color }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={icon} size={16} color={COLORS.white} />
        <Text style={styles.chipLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chipWrapper: {
    marginRight: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    ...SHADOW_SMALL,
  },
  chipLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  removeButton: {
    marginLeft: 2,
    padding: 2,
  },
  addFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: 6,
  },
  addFilterText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default FilterChips;
