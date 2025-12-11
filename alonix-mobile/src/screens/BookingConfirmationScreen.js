import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_LARGE } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import paymentService from '../services/paymentService';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { booking, payment, receipt } = route.params || {};

  if (!booking || !booking.type) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Invalid booking details</Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.doneButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleShareBooking = async () => {
    try {
      const message = generateShareMessage();
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing booking:', error);
      Alert.alert('Error', 'Failed to share booking details');
    }
  };

  const generateShareMessage = () => {
    const itemName = getItemName();
    return `
🎉 Booking Confirmed!

${getBookingTypeEmoji()} ${capitalize(booking.type)} Booking
${itemName}

📋 Booking Reference: ${booking.bookingReference}
💳 Transaction ID: ${payment.transactionId}
💰 Amount: ${paymentService.formatAmount(payment.amount, payment.currency)}

Thank you for booking with Alonix! 🚀
    `.trim();
  };

  const getBookingTypeEmoji = () => {
    const emojis = {
      hotel: '🏨',
      car: '🚗',
      driver: '🚕',
      challenge: '🏆',
    };
    return emojis[booking.type] || '📦';
  };

  const getItemName = () => {
    if (booking.type === 'hotel') {
      return booking.item.name;
    } else if (booking.type === 'car') {
      return `${booking.item.brand} ${booking.item.model}`;
    } else if (booking.type === 'driver') {
      return booking.item.name;
    } else if (booking.type === 'challenge') {
      return booking.item.title;
    }
    return 'Unknown';
  };

  const getBookingDetails = () => {
    const details = [];

    if (booking.type === 'hotel') {
      details.push({ label: 'Check-in', value: booking.details.checkIn });
      details.push({ label: 'Check-out', value: booking.details.checkOut });
      details.push({ label: 'Guests', value: booking.details.guests });
      details.push({ label: 'Rooms', value: booking.details.rooms });
    } else if (booking.type === 'car') {
      details.push({ label: 'Pick-up Date', value: booking.details.pickupDate });
      details.push({ label: 'Return Date', value: booking.details.returnDate });
      details.push({ label: 'Pick-up Location', value: booking.details.pickupLocation });
      details.push({ label: 'Return Location', value: booking.details.returnLocation || 'Same as pick-up' });
    } else if (booking.type === 'driver') {
      details.push({ label: 'Date', value: booking.details.date });
      details.push({ label: 'Time', value: booking.details.time });
      details.push({ label: 'Pick-up', value: booking.details.pickupLocation });
      details.push({ label: 'Drop-off', value: booking.details.dropoffLocation });
      details.push({ label: 'Passengers', value: booking.details.passengers });
    } else if (booking.type === 'challenge') {
      details.push({ label: 'Challenge Date', value: booking.details.date });
      details.push({ label: 'Participants', value: booking.details.participants });
      if (booking.details.teamName) {
        details.push({ label: 'Team Name', value: booking.details.teamName });
      }
    }

    return details;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your booking has been successfully confirmed
          </Text>
        </View>

        {/* Booking Reference */}
        <View style={styles.section}>
          <View style={styles.referenceCard}>
            <Text style={styles.referenceLabel}>Booking Reference</Text>
            <Text style={styles.referenceNumber}>{booking.bookingReference}</Text>
            <Text style={styles.referenceHint}>
              Save this reference for future inquiries
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name={getBookingTypeIcon()}
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>Booking Details</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {capitalize(booking.type)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Item</Text>
              <Text style={styles.detailValue}>{getItemName()}</Text>
            </View>
            {getBookingDetails().map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={24} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Payment Details</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValueSmall}>{payment.transactionId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>
                {paymentService.getPaymentMethodName(payment.method)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={[styles.detailValue, styles.amountText]}>
                {paymentService.formatAmount(payment.amount, payment.currency)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Completed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Receipt Number */}
        {receipt && (
          <View style={styles.section}>
            <View style={styles.receiptCard}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.gray} />
              <Text style={styles.receiptText}>
                Receipt: {receipt.receiptNumber}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareBooking}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={20} color={COLORS.primary} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('MyBookings')}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getBookingTypeIcon = (type) => {
  const icons = {
    hotel: 'bed-outline',
    car: 'car-outline',
    driver: 'car-sport-outline',
    challenge: 'trophy-outline',
  };
  return icons[type] || 'document-outline';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginTop: 16,
  },
  referenceCard: {
    backgroundColor: COLORS.primary + '10',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  referenceLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 8,
  },
  referenceNumber: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  referenceHint: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOW_SMALL,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // Neutral divider
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    flex: 1,
  },
  detailValue: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  detailValueSmall: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  amountText: {
    color: COLORS.primary,
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    ...SHADOW_SMALL,
  },
  receiptText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    marginLeft: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    ...SHADOW_LARGE,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 12,
  },
  shareButtonText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  doneButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 24,
  },
});

export default BookingConfirmationScreen;
