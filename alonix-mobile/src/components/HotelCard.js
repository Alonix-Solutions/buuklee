import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM } from '../utils/shadows';
import { formatPrice, formatDistance } from '../utils/helpers';

const HotelCard = ({ hotel, onPress, compact = false }) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={12} color={COLORS.warning} />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={12} color={COLORS.warning} />
      );
    }
    return stars;
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: hotel.photos[0] }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>
            {hotel.name}
          </Text>
          <View style={styles.compactRating}>
            {renderStars(hotel.rating)}
            <Text style={styles.compactRatingText}>
              {hotel.rating} ({hotel.reviewCount})
            </Text>
          </View>
          <View style={styles.compactPriceRow}>
            <Text style={styles.compactPrice}>{formatPrice(hotel.price, hotel.currency)}</Text>
            <Text style={styles.compactPriceLabel}>/night</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Main Photo */}
      <Image source={{ uri: hotel.photos[0] }} style={styles.image} />

      {/* Price Badge */}
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>{formatPrice(hotel.price, hotel.currency)}</Text>
        <Text style={styles.priceLabel}>/night</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>
          {hotel.name}
        </Text>

        {/* Rating and Reviews */}
        <View style={styles.ratingRow}>
          <View style={styles.stars}>{renderStars(hotel.rating)}</View>
          <Text style={styles.ratingText}>
            {hotel.rating} ({hotel.reviewCount} reviews)
          </Text>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.gray} />
          <Text style={styles.locationText} numberOfLines={1}>
            {typeof hotel.location === 'string'
              ? hotel.location
              : (hotel.location?.address || hotel.location?.name || 'Mauritius')}
          </Text>
        </View>

        {/* Distance to Beach */}
        {!!hotel.distance && (
          <View style={styles.distanceRow}>
            <Ionicons name="walk-outline" size={14} color={COLORS.gray} />
            <Text style={styles.distanceText}>
              {formatDistance(hotel.distance)} to beach
            </Text>
          </View>
        )}

        {/* Amenities */}
        <View style={styles.amenitiesRow}>
          {(hotel.amenities || []).slice(0, 4).map((amenity, index) => (
            <View key={index} style={styles.amenity}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
          {(hotel.amenities || []).length > 4 && (
            <Text style={styles.moreAmenities}>
              +{(hotel.amenities || []).length - 4} more
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
    ...SHADOW_MEDIUM,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    ...SHADOW_MEDIUM,
  },
  priceText: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginLeft: 2,
  },
  content: {
    padding: SIZES.padding,
  },
  name: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distanceText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  amenity: {
    backgroundColor: COLORS.lightestGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  amenityText: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
  },
  moreAmenities: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    paddingVertical: 4,
  },
  // Compact card styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginHorizontal: SIZES.padding,
    marginBottom: 12,
    ...SHADOW_SMALL,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
  },
  compactImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.lightGray,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  compactName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactRatingText: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginLeft: 4,
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  compactPrice: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  compactPriceLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginLeft: 2,
  },
});

export default HotelCard;
