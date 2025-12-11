import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM } from '../utils/shadows';

const CarCard = ({ car, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: car.image }}
        style={styles.image}
        resizeMode="cover"
      />

      {!car.available && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{car.make} {car.model}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.rating}>{car.rating}</Text>
          </View>
        </View>

        <Text style={styles.year}>{car.year} • {car.car_type}</Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={16} color={COLORS.gray} />
            <Text style={styles.featureText}>{car.seats} seats</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="settings" size={16} color={COLORS.gray} />
            <Text style={styles.featureText}>{car.transmission}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="water" size={16} color={COLORS.gray} />
            <Text style={styles.featureText}>{car.fuelType}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.price}>Rs {car.price}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
          <View style={styles.bookButton}>
            <Text style={styles.bookButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: SIZES.padding,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOW_MEDIUM,
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
  unavailableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.darkGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  unavailableText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  year: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  features: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.gray,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CarCard;
