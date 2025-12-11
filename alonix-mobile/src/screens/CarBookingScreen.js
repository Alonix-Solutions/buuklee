import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_LARGE } from '../utils/shadows';
import vehicleService from '../services/vehicleService';

const CarBookingScreen = ({ route, navigation }) => {
  const { carId, car: passedCar, period } = route.params || {};
  const [car, setCar] = useState(passedCar || null);
  const [loading, setLoading] = useState(!passedCar && carId);

  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

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
  const selectedListing = listings.find(l => l.period === period) || listings[1];

  const handleBooking = () => {
    // Validate form
    if (!pickupDate || !dropoffDate || !pickupLocation || !fullName || !email || !phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Navigate to payment with booking details
    navigation.navigate('Payment', {
      bookingType: 'car_rental',
      item: car,
      itemId: car.id,
      itemName: `${car.make} ${car.model}`,
      price: selectedListing?.price,
      currency: 'Rs',
      bookingDetails: {
        pickupDate,
        dropoffDate,
        pickupLocation,
        dropoffLocation,
        fullName,
        email,
        phone,
        specialRequests,
        period
      }
    });
  };

  const FormField = ({ label, value, onChangeText, placeholder, icon, multiline = false, keyboardType = 'default' }) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color={COLORS.gray} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
        />
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Book Car</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Car Summary */}
        <View style={styles.carSummary}>
          <Image
            source={{ uri: car.image }}
            style={styles.carImage}
            resizeMode="cover"
          />
          <View style={styles.carInfo}>
            <Text style={styles.carName}>{car.make} {car.model}</Text>
            <Text style={styles.carDetails}>{car.year} • {car.car_type}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>Rs {selectedListing?.price}</Text>
              <Text style={styles.priceUnit}>/{period}</Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Details</Text>

          <FormField
            label="Pickup Date & Time *"
            value={pickupDate}
            onChangeText={setPickupDate}
            placeholder="DD/MM/YYYY HH:MM"
            icon="calendar-outline"
          />

          <FormField
            label="Drop-off Date & Time *"
            value={dropoffDate}
            onChangeText={setDropoffDate}
            placeholder="DD/MM/YYYY HH:MM"
            icon="calendar-outline"
          />

          <FormField
            label="Pickup Location *"
            value={pickupLocation}
            onChangeText={setPickupLocation}
            placeholder="Enter pickup address"
            icon="location-outline"
          />

          <FormField
            label="Drop-off Location"
            value={dropoffLocation}
            onChangeText={setDropoffLocation}
            placeholder="Same as pickup (optional)"
            icon="location-outline"
          />
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <FormField
            label="Full Name *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            icon="person-outline"
          />

          <FormField
            label="Email Address *"
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            icon="mail-outline"
            keyboardType="email-address"
          />

          <FormField
            label="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            placeholder="+230 5xxx xxxx"
            icon="call-outline"
            keyboardType="phone-pad"
          />
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <FormField
            label="Special Requests"
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Any special requests or requirements?"
            icon="chatbubble-outline"
            multiline
          />
        </View>

        {/* Important Information */}
        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoHeaderText}>Important Information</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>Valid driver's license required</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>Minimum age: 21 years</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>Fuel: Return with same level</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>Free cancellation up to 24 hours before</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>Rs {selectedListing?.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleBooking}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightestGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  content: {
    flex: 1,
  },
  carSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 12,
    ...SHADOW_SMALL,
  },
  carImage: {
    width: 100,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  carInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  carName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  carDetails: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 2,
    marginLeft: 2,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightestGray,
    borderRadius: 12,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    paddingLeft: 8,
    fontSize: 15,
    color: COLORS.darkGray,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 8,
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
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    ...SHADOW_LARGE,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CarBookingScreen;
