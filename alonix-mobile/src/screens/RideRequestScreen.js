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
import driverService from '../services/driverService';

const RideRequestScreen = ({ route, navigation }) => {
  const { driverId, driver: passedDriver, pickup, dropoff, serviceType } = route.params || {};
  const [driver, setDriver] = useState(passedDriver || null);
  const [loading, setLoading] = useState(!passedDriver && driverId);
  const [selectedDuration, setSelectedDuration] = useState('hourly');
  const [isScheduled, setIsScheduled] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (!passedDriver && driverId) {
      loadDriver();
    }
  }, [driverId]);

  const loadDriver = async () => {
    try {
      setLoading(true);
      const loadedDriver = await driverService.getDriver(driverId);
      setDriver(loadedDriver);
    } catch (error) {
      console.error('Load driver error:', error);
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

  if (!driver) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Driver not found or invalid request</Text>
        <TouchableOpacity
          style={[styles.backButton, { marginTop: 20, backgroundColor: COLORS.lightGray }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>
    );
  }

  const calculatePrice = () => {
    if (selectedDuration === 'hourly') {
      return driver.pricePerHour;
    }
    return driver.pricePerDay;
  };

  const handleConfirmRide = () => {
    if (isScheduled && !pickupDate) {
      Alert.alert('Error', 'Please select a pickup date for your scheduled ride');
      return;
    }

    if (!isScheduled && !pickupTime) {
      Alert.alert('Error', 'Please enter pickup time');
      return;
    }

    if (!contactName || !contactPhone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Navigate to payment with booking details
    navigation.navigate('Payment', {
      bookingType: 'driver',
      item: driver,
      itemId: driver.id,
      itemName: driver.name,
      price: calculatePrice(),
      currency: 'Rs',
      bookingDetails: {
        pickup,
        dropoff,
        serviceType,
        duration: selectedDuration,
        isScheduled,
        pickupTime,
        pickupDate,
        passengers,
        contactName,
        contactPhone,
        specialRequests
      }
    });
  };

  const DurationButton = ({ duration, label, price }) => (
    <TouchableOpacity
      style={[styles.durationButton, selectedDuration === duration && styles.activeDurationButton]}
      onPress={() => setSelectedDuration(duration)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.durationLabel,
          selectedDuration === duration && styles.activeDurationLabel,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.durationPrice,
          selectedDuration === duration && styles.activeDurationPrice,
        ]}
      >
        Rs {price}
      </Text>
    </TouchableOpacity>
  );

  const FormField = ({ label, value, onChangeText, placeholder, icon, keyboardType = 'default', multiline = false }) => (
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
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
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
        <Text style={styles.headerTitle}>Book Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Driver Summary */}
        <View style={styles.driverSummary}>
          <Image
            source={{ uri: driver.avatar }}
            style={styles.driverAvatar}
            resizeMode="cover"
          />
          <View style={styles.driverInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.driverName}>{driver.name}</Text>
              {driver.verified && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.rating}>{driver.rating}</Text>
              <Text style={styles.reviewCount}>({driver.reviewCount})</Text>
            </View>
            <Text style={styles.vehicleInfo}>
              {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
            </Text>
          </View>
        </View>

        {/* Trip Details */}
        {pickup && dropoff && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            <View style={styles.tripDetail}>
              <View style={styles.tripIcon}>
                <Ionicons name="location" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.tripContent}>
                <Text style={styles.tripLabel}>Pickup</Text>
                <Text style={styles.tripValue}>{pickup}</Text>
              </View>
            </View>
            <View style={styles.tripDetail}>
              <View style={styles.tripIcon}>
                <Ionicons name="flag" size={16} color={COLORS.success} />
              </View>
              <View style={styles.tripContent}>
                <Text style={styles.tripLabel}>Drop-off</Text>
                <Text style={styles.tripValue}>{dropoff}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationButtons}>
            <DurationButton
              duration="hourly"
              label="Hourly"
              price={driver.pricePerHour}
            />
            <DurationButton
              duration="daily"
              label="Full Day"
              price={driver.pricePerDay}
            />
          </View>
        </View>

        {/* Ride Type Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When do you need the ride?</Text>
          <View style={styles.rideTypeButtons}>
            <TouchableOpacity
              style={[styles.rideTypeButton, !isScheduled && styles.activeRideTypeButton]}
              onPress={() => setIsScheduled(false)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="flash"
                size={20}
                color={!isScheduled ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.rideTypeButtonText,
                  !isScheduled && styles.activeRideTypeButtonText,
                ]}
              >
                Book Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rideTypeButton, isScheduled && styles.activeRideTypeButton]}
              onPress={() => setIsScheduled(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar"
                size={20}
                color={isScheduled ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.rideTypeButtonText,
                  isScheduled && styles.activeRideTypeButtonText,
                ]}
              >
                Schedule
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isScheduled ? 'Schedule Details' : 'Booking Information'}
          </Text>

          {isScheduled ? (
            <>
              <FormField
                label="Pickup Date *"
                value={pickupDate}
                onChangeText={setPickupDate}
                placeholder="DD/MM/YYYY"
                icon="calendar-outline"
              />
              <FormField
                label="Pickup Time *"
                value={pickupTime}
                onChangeText={setPickupTime}
                placeholder="HH:MM"
                icon="time-outline"
              />
            </>
          ) : (
            <FormField
              label="Pickup Time *"
              value={pickupTime}
              onChangeText={setPickupTime}
              placeholder="HH:MM (e.g., 14:30)"
              icon="time-outline"
            />
          )}

          <FormField
            label="Number of Passengers *"
            value={passengers}
            onChangeText={setPassengers}
            placeholder="1"
            icon="people-outline"
            keyboardType="numeric"
          />
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <FormField
            label="Full Name *"
            value={contactName}
            onChangeText={setContactName}
            placeholder="Enter your full name"
            icon="person-outline"
          />

          <FormField
            label="Phone Number *"
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="+230 5xxx xxxx"
            icon="call-outline"
            keyboardType="phone-pad"
          />
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>

          <FormField
            label="Additional Notes"
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="Any special requests or requirements?"
            icon="chatbubble-outline"
            multiline
          />
        </View>

        {/* Services Included */}
        <View style={styles.servicesBox}>
          <Text style={styles.servicesTitle}>Services Included</Text>
          {driver.services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>Rs {calculatePrice()}</Text>
          <Text style={styles.priceUnit}>/{selectedDuration === 'hourly' ? 'hr' : 'day'}</Text>
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmRide}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Confirm Ride</Text>
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
  driverSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 12,
    ...SHADOW_SMALL,
  },
  driverAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  vehicleInfo: {
    fontSize: 13,
    color: COLORS.gray,
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
  rideTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rideTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    backgroundColor: COLORS.white,
    gap: 8,
  },
  activeRideTypeButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rideTypeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activeRideTypeButtonText: {
    color: COLORS.white,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightestGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripContent: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  tripValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  activeDurationButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  activeDurationLabel: {
    color: COLORS.white,
  },
  durationPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  activeDurationPrice: {
    color: COLORS.white,
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
  servicesBox: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 12,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
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

export default RideRequestScreen;
