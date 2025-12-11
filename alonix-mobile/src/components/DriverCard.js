import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM } from '../utils/shadows';

const DriverCard = ({ driver, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        {/* Driver Info */}
        <View style={styles.driverSection}>
          <Image
            source={{ uri: driver.avatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.driverInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{driver.name}</Text>
              {driver.verified && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.rating}>{driver.rating}</Text>
              <Text style={styles.reviewCount}>({driver.reviewCount})</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.experience}>{driver.experience_years} yrs exp</Text>
            </View>
            <Text style={styles.location} numberOfLines={1}>
              <Ionicons name="location" size={12} color={COLORS.gray} /> {driver.location.address}
            </Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleSection}>
          <View style={styles.vehicleIcon}>
            <Ionicons
              name={driver.vehicle.type === 'suv' ? 'car' : 'car-sport'}
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>
              {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
            </Text>
            <Text style={styles.vehicleDetails}>
              {driver.vehicle.color} • {driver.vehicle.plateNumber}
            </Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.servicesSection}>
          {driver.services.slice(0, 3).map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.price}>Rs {driver.pricePerHour}/hr</Text>
          </View>
          <View style={[styles.statusBadge, !driver.available && styles.unavailableBadge]}>
            <View style={[styles.statusDot, !driver.available && styles.unavailableDot]} />
            <Text style={[styles.statusText, !driver.available && styles.unavailableText]}>
              {driver.available ? 'Available' : 'Busy'}
            </Text>
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
    ...SHADOW_MEDIUM,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
  },
  content: {
    padding: 16,
  },
  driverSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.lightGray,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 2,
  },
  separator: {
    fontSize: 13,
    color: COLORS.gray,
    marginHorizontal: 6,
  },
  experience: {
    fontSize: 13,
    color: COLORS.gray,
  },
  location: {
    fontSize: 13,
    color: COLORS.gray,
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightestGray,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 13,
    color: COLORS.gray,
    textTransform: 'capitalize',
  },
  servicesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  serviceTag: {
    backgroundColor: COLORS.lightestGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  unavailableBadge: {
    backgroundColor: COLORS.gray + '15',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  unavailableDot: {
    backgroundColor: COLORS.gray,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  unavailableText: {
    color: COLORS.gray,
  },
});

export default DriverCard;
