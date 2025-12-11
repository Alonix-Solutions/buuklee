import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_LARGE } from '../utils/shadows';
import { useBooking } from '../context/BookingContext';
import paymentService from '../services/paymentService';

const PaymentScreen = ({ route, navigation }) => {
  const { bookingData } = route.params || {};
  const { createBooking } = useBooking();

  if (!bookingData) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.gray }}>Invalid booking data</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const [selectedMethod, setSelectedMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Credit Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Mobile Money State
  const [selectedProvider, setSelectedProvider] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: 'card-outline',
      description: 'Pay with credit or debit card',
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: 'phone-portrait-outline',
      description: 'Pay with mobile money',
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: 'cash-outline',
      description: 'Pay in cash on arrival',
    },
  ];

  const mobileMoneyProviders = paymentService.getMobileMoneyProviders();

  const calculateTotal = () => {
    const amount = bookingData.amount;
    const serviceFee = paymentService.calculateServiceFee(amount, selectedMethod);
    return {
      subtotal: amount,
      serviceFee,
      total: amount + serviceFee,
    };
  };

  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substr(0, 19); // Max 16 digits + 3 spaces
  };

  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const validateInputs = () => {
    if (selectedMethod === 'credit_card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
        Alert.alert('Error', 'Please enter a valid card number');
        return false;
      }
      if (!cardholderName || cardholderName.trim().length < 3) {
        Alert.alert('Error', 'Please enter cardholder name');
        return false;
      }
      if (!expiryMonth || !expiryYear) {
        Alert.alert('Error', 'Please enter card expiry date');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        Alert.alert('Error', 'Please enter valid CVV');
        return false;
      }
    } else if (selectedMethod === 'mobile_money') {
      if (!phoneNumber || phoneNumber.length < 10) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsProcessing(true);

    try {
      const { total } = calculateTotal();

      // Prepare payment details based on method
      let paymentDetails = {};
      if (selectedMethod === 'credit_card') {
        paymentDetails = {
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardholderName,
          expiryMonth,
          expiryYear,
          cvv,
        };
      } else if (selectedMethod === 'mobile_money') {
        paymentDetails = {
          provider: selectedProvider,
          phoneNumber,
        };
      }

      // Process payment
      const paymentResult = await paymentService.processPayment({
        method: selectedMethod,
        amount: total,
        currency: bookingData.currency || 'USD',
        details: paymentDetails,
        booking: {
          bookingReference: 'TEMP-' + Date.now(),
          type: bookingData.type,
          item: bookingData.item,
        },
      });

      if (!paymentResult.success) {
        Alert.alert('Payment Failed', paymentResult.error);
        setIsProcessing(false);
        return;
      }

      // Create booking
      const bookingResult = await createBooking({
        type: bookingData.type,
        item: bookingData.item,
        details: bookingData.details,
        payment: paymentResult.payment,
      });

      setIsProcessing(false);

      if (bookingResult.success) {
        // Navigate to confirmation screen
        navigation.replace('BookingConfirmation', {
          booking: bookingResult.booking,
          payment: paymentResult.payment,
          receipt: paymentResult.receipt,
        });
      } else {
        Alert.alert('Booking Failed', bookingResult.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  const renderPaymentMethodForm = () => {
    if (selectedMethod === 'credit_card') {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Card Information</Text>

          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                maxLength={19}
              />
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Expiry and CVV */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <View style={styles.expiryRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM"
                    keyboardType="numeric"
                    value={expiryMonth}
                    onChangeText={(text) => setExpiryMonth(text.substr(0, 2))}
                    maxLength={2}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="YY"
                    keyboardType="numeric"
                    value={expiryYear}
                    onChangeText={(text) => setExpiryYear(text.substr(0, 2))}
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  keyboardType="numeric"
                  value={cvv}
                  onChangeText={(text) => setCvv(text.substr(0, 4))}
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        </View>
      );
    } else if (selectedMethod === 'mobile_money') {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Mobile Money Details</Text>

          {/* Provider Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Provider</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.providerScroll}
            >
              {mobileMoneyProviders.map((provider) => (
                <TouchableOpacity
                  key={provider}
                  style={[
                    styles.providerChip,
                    selectedProvider === provider && styles.providerChipActive,
                  ]}
                  onPress={() => setSelectedProvider(provider)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.providerChipText,
                      selectedProvider === provider && styles.providerChipTextActive,
                    ]}
                  >
                    {provider}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="phone-portrait-outline" size={20} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="+233 24 000 0000"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
            <Text style={styles.infoText}>
              You will receive a prompt on your phone to approve the payment
            </Text>
          </View>
        </View>
      );
    } else if (selectedMethod === 'cash') {
      return (
        <View style={styles.formContainer}>
          <View style={styles.cashInfo}>
            <Ionicons name="cash-outline" size={64} color={COLORS.success} />
            <Text style={styles.cashTitle}>Pay on Arrival</Text>
            <Text style={styles.cashText}>
              You can pay in cash when you arrive. Please have the exact amount ready.
            </Text>
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Your booking may be subject to cancellation if payment is not received on time
              </Text>
            </View>
          </View>
        </View>
      );
    }
  };

  const costs = calculateTotal();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive,
              ]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.methodLeft}>
                <View
                  style={[
                    styles.methodIcon,
                    selectedMethod === method.id && styles.methodIconActive,
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={24}
                    color={
                      selectedMethod === method.id ? COLORS.white : COLORS.primary
                    }
                  />
                </View>
                <View>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === method.id && styles.radioButtonActive,
                ]}
              >
                {selectedMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Form */}
        {renderPaymentMethodForm()}

        {/* Cost Breakdown */}
        <View style={styles.section}>
          <View style={styles.costCard}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Subtotal</Text>
              <Text style={styles.costValue}>
                {paymentService.formatAmount(costs.subtotal, bookingData.currency)}
              </Text>
            </View>
            {costs.serviceFee > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Service Fee</Text>
                <Text style={styles.costValue}>
                  {paymentService.formatAmount(costs.serviceFee, bookingData.currency)}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.costRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                {paymentService.formatAmount(costs.total, bookingData.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color={COLORS.white} />
              <Text style={styles.payButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.white} />
              <Text style={styles.payButtonText}>
                Pay {paymentService.formatAmount(costs.total, bookingData.currency)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  section: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    ...SHADOW_SMALL,
  },
  methodCardActive: {
    borderColor: COLORS.primary,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodIconActive: {
    backgroundColor: COLORS.primary,
  },
  methodName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  formContainer: {
    padding: SIZES.padding,
    paddingTop: 0,
  },
  formTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
  },
  expiryRow: {
    flexDirection: 'row',
  },
  providerScroll: {
    marginTop: 8,
  },
  providerChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.lightestGray,
    marginRight: 8,
    borderWidth: 2,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
  },
  providerChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  providerChipText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray,
  },
  providerChipTextActive: {
    color: COLORS.white,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.info,
    marginLeft: 12,
  },
  cashInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  cashTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  cashText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '10',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.warning,
    marginLeft: 12,
  },
  costCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOW_SMALL,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  costValue: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // Neutral divider
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  totalValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    ...SHADOW_LARGE,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 24,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 12,
  },
});

export default PaymentScreen;
