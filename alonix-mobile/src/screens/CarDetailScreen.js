import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_LARGE } from '../utils/shadows';
import vehicleService from '../services/vehicleService';

const { width } = Dimensions.get('window');

const CarDetailScreen = ({ route, navigation }) => {
  const { carId, car: passedCar } = route.params || {};
  const [car, setCar] = useState(passedCar || null);
  const [loading, setLoading] = useState(!passedCar);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  useEffect(() => {
    if (!passedCar && carId) {
      loadCar();
    }
  }, [carId]);

  const loadCar = async () => {
    try {
      setLoading(true);
      const loadedCar = await vehicleService.getVehicle(carId);
      setCar(loadedCar);
    } catch (error) {
      console.error('Load car error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Car not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const listings = car.listings || [
    { period: 'hourly', price: car.pricePerHour || Math.round((car.price || 50) / 3) },
    { period: 'daily', price: car.pricePerDay || car.price || 50 },
    { period: 'weekly', price: car.pricePerWeek || (car.price || 50) * 6 },
  ];
  const selectedListing = listings.find(l => l.period === selectedPeriod) || listings[0];

  const FeatureItem = ({ icon, label, value }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureLabel}>{label}</Text>
        <Text style={styles.featureValue}>{value}</Text>
      </View>
    </View>
  );

  const PeriodButton = ({ period, label }) => (
    <TouchableOpacity
      style={[styles.periodButton, selectedPeriod === period && styles.activePeriodButton]}
      onPress={() => setSelectedPeriod(period)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.activePeriodButtonText,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.periodPrice,
          selectedPeriod === period && styles.activePeriodPrice,
        ]}
      >
        Rs {car.listings.find(l => l.period === period)?.price}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Car Image */}
        <Image
          source={{ uri: car.image }}
          style={styles.carImage}
          resizeMode="cover"
        />

        {!car.available && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Currently Unavailable</Text>
          </View>
        )}

        {/* Car Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleContent}>
              <Text style={styles.carName}>{car.make} {car.model}</Text>
              <Text style={styles.carYear}>{car.year} • {car.car_type}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color={COLORS.warning} />
              <Text style={styles.rating}>{car.rating}</Text>
              <Text style={styles.reviewCount}>({car.reviewCount})</Text>
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <FeatureItem icon="people" label="Seats" value={`${car.seats} seats`} />
            <FeatureItem icon="settings" label="Transmission" value={car.transmission} />
            <FeatureItem icon="water" label="Fuel Type" value={car.fuelType} />
            <FeatureItem icon="speedometer" label="Mileage" value={`${(car.mileage || 0).toLocaleString()} km`} />
          </View>

          {/* Rental Period Selection */}
          <View style={styles.periodSection}>
            <Text style={styles.sectionTitle}>Rental Period</Text>
            <View style={styles.periodButtons}>
              <PeriodButton period="hourly" label="Hourly" />
              <PeriodButton period="daily" label="Daily" />
              <PeriodButton period="weekly" label="Weekly" />
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this car</Text>
            <Text style={styles.description}>{car.description}</Text>
          </View>

          {/* Additional Features */}
          <View style={styles.additionalFeaturesSection}>
            <Text style={styles.sectionTitle}>Features & Amenities</Text>
            <View style={styles.featuresList}>
              {car.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.featureTagText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews Preview */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.reviewerAvatar}>
                    <Ionicons name="person" size={20} color={COLORS.white} />
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>John Doe</Text>
                    <Text style={styles.reviewDate}>2 days ago</Text>
                  </View>
                </View>
                <View style={styles.reviewRating}>
                  <Ionicons name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.reviewRatingText}>4.5</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>
                Great car! Clean, comfortable, and perfect for touring around Mauritius.
                Highly recommend for families.
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>Rs {selectedListing?.price}</Text>
          <Text style={styles.priceUnit}>/{selectedPeriod}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, !car.available && styles.disabledButton]}
          onPress={() => navigation.navigate('CarBooking', { carId: car.id, period: selectedPeriod })}
          disabled={!car.available}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>
            {car.available ? 'Book Now' : 'Unavailable'}
          </Text>
          {car.available && (
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  content: {
    flex: 1,
  },
  carImage: {
    width: width,
    height: 300,
    backgroundColor: COLORS.lightGray,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 260,
    left: SIZES.padding,
    backgroundColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  unavailableText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  infoSection: {
    padding: SIZES.padding,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContent: {
    flex: 1,
  },
  carName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  carYear: {
    fontSize: 15,
    color: COLORS.gray,
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightestGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rating: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  featureItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.lightestGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  periodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  activePeriodButtonText: {
    color: COLORS.white,
  },
  periodPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  activePeriodPrice: {
    color: COLORS.white,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
  },
  additionalFeaturesSection: {
    marginBottom: 24,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightestGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureTagText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: COLORS.lightestGray,
    padding: 16,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 80, // Adjusted to sit above floating navigation
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    borderRadius: 20,
    marginHorizontal: 16,
    ...SHADOW_LARGE,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginRight: 6,
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
    marginLeft: 2,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CarDetailScreen;
