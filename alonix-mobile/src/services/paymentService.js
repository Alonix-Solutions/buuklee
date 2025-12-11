/**
 * Payment Service
 * Handles payment processing, payment methods, and receipt generation
 * This is a mock implementation for demonstration purposes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class PaymentService {
  constructor() {
    this.supportedMethods = ['credit_card', 'mobile_money', 'cash'];
    this.mobileMoneyProviders = ['MTN', 'Airtel', 'Vodafone', 'Tigo'];
  }

  /**
   * Process a payment
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.method - Payment method: 'credit_card', 'mobile_money', 'cash'
   * @param {number} paymentData.amount - Amount to charge
   * @param {string} paymentData.currency - Currency code (e.g., 'USD', 'GHS', 'NGN')
   * @param {Object} paymentData.details - Payment method specific details
   * @param {Object} paymentData.booking - Booking information
   */
  async processPayment(paymentData) {
    try {
      // Validate payment data
      const validation = this.validatePayment(paymentData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Simulate payment processing delay
      await this.simulateProcessing();

      // Generate transaction ID
      const transactionId = this.generateTransactionId();

      // Create payment record
      const payment = {
        id: transactionId,
        method: paymentData.method,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'completed',
        timestamp: new Date().toISOString(),
        booking: paymentData.booking,
        details: this.sanitizePaymentDetails(paymentData.details),
      };

      // Save payment record
      await this.savePayment(payment);

      // Generate receipt
      const receipt = await this.generateReceipt(payment);

      return {
        success: true,
        transactionId,
        payment,
        receipt,
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  }

  /**
   * Validate payment data
   */
  validatePayment(paymentData) {
    if (!paymentData.method) {
      return { valid: false, error: 'Payment method is required' };
    }

    if (!this.supportedMethods.includes(paymentData.method)) {
      return { valid: false, error: 'Invalid payment method' };
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      return { valid: false, error: 'Invalid payment amount' };
    }

    if (!paymentData.currency) {
      return { valid: false, error: 'Currency is required' };
    }

    // Method-specific validation
    switch (paymentData.method) {
      case 'credit_card':
        return this.validateCreditCard(paymentData.details);
      case 'mobile_money':
        return this.validateMobileMoney(paymentData.details);
      case 'cash':
        return { valid: true };
      default:
        return { valid: false, error: 'Unsupported payment method' };
    }
  }

  /**
   * Validate credit card details
   */
  validateCreditCard(details) {
    if (!details) {
      return { valid: false, error: 'Credit card details are required' };
    }

    if (!details.cardNumber || details.cardNumber.length < 13) {
      return { valid: false, error: 'Invalid card number' };
    }

    if (!details.expiryMonth || !details.expiryYear) {
      return { valid: false, error: 'Card expiry date is required' };
    }

    if (!details.cvv || details.cvv.length < 3) {
      return { valid: false, error: 'Invalid CVV' };
    }

    if (!details.cardholderName) {
      return { valid: false, error: 'Cardholder name is required' };
    }

    return { valid: true };
  }

  /**
   * Validate mobile money details
   */
  validateMobileMoney(details) {
    if (!details) {
      return { valid: false, error: 'Mobile money details are required' };
    }

    if (!details.provider) {
      return { valid: false, error: 'Mobile money provider is required' };
    }

    if (!this.mobileMoneyProviders.includes(details.provider)) {
      return { valid: false, error: 'Invalid mobile money provider' };
    }

    if (!details.phoneNumber || details.phoneNumber.length < 10) {
      return { valid: false, error: 'Invalid phone number' };
    }

    return { valid: true };
  }

  /**
   * Simulate payment processing delay
   */
  async simulateProcessing() {
    const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
    return new Promise((resolve) => setTimeout(resolve, processingTime));
  }

  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Sanitize payment details (remove sensitive information)
   */
  sanitizePaymentDetails(details) {
    if (!details) return {};

    const sanitized = { ...details };

    // Mask credit card number
    if (sanitized.cardNumber) {
      const last4 = sanitized.cardNumber.slice(-4);
      sanitized.cardNumber = `****${last4}`;
    }

    // Remove CVV
    delete sanitized.cvv;

    return sanitized;
  }

  /**
   * Save payment record to storage
   */
  async savePayment(payment) {
    try {
      const payments = await this.getPaymentHistory();
      payments.unshift(payment);
      await AsyncStorage.setItem('@payment_history', JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory() {
    try {
      const history = await AsyncStorage.getItem('@payment_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentById(transactionId) {
    try {
      const payments = await this.getPaymentHistory();
      return payments.find((p) => p.id === transactionId);
    } catch (error) {
      console.error('Error getting payment:', error);
      return null;
    }
  }

  /**
   * Generate payment receipt
   */
  async generateReceipt(payment) {
    const receipt = {
      receiptNumber: this.generateReceiptNumber(),
      transactionId: payment.id,
      date: new Date(payment.timestamp).toLocaleString(),
      method: this.getPaymentMethodName(payment.method),
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      booking: {
        reference: payment.booking?.bookingReference,
        type: payment.booking?.type,
        item: payment.booking?.item,
      },
      generatedAt: new Date().toISOString(),
    };

    return receipt;
  }

  /**
   * Generate receipt number
   */
  generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `RCP${year}${month}${random}`;
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodName(method) {
    const names = {
      credit_card: 'Credit Card',
      mobile_money: 'Mobile Money',
      cash: 'Cash',
    };
    return names[method] || method;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount, currency = 'USD') {
    const symbols = {
      USD: '$',
      GHS: 'GH₵',
      NGN: '₦',
      EUR: '€',
      GBP: '£',
      MUR: 'Rs ',
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  /**
   * Calculate service fee
   */
  calculateServiceFee(amount, method) {
    const feeRates = {
      credit_card: 0.029, // 2.9%
      mobile_money: 0.01, // 1%
      cash: 0, // No fee
    };

    const rate = feeRates[method] || 0;
    return amount * rate;
  }

  /**
   * Calculate total amount with fees
   */
  calculateTotal(amount, method) {
    const serviceFee = this.calculateServiceFee(amount, method);
    return amount + serviceFee;
  }

  /**
   * Request refund
   */
  async requestRefund(transactionId, reason) {
    try {
      // Simulate refund processing
      await this.simulateProcessing();

      const payment = await this.getPaymentById(transactionId);
      if (!payment) {
        return {
          success: false,
          error: 'Payment not found',
        };
      }

      const refund = {
        id: this.generateTransactionId(),
        originalTransactionId: transactionId,
        amount: payment.amount,
        currency: payment.currency,
        reason,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };

      return {
        success: true,
        refund,
        message: 'Refund request submitted successfully',
      };
    } catch (error) {
      console.error('Refund request error:', error);
      return {
        success: false,
        error: error.message || 'Refund request failed',
      };
    }
  }

  /**
   * Mock payment methods for testing
   */
  getMockPaymentMethods() {
    return {
      creditCard: {
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'John Doe',
      },
      mobileMoney: {
        provider: 'MTN',
        phoneNumber: '+233244000000',
      },
    };
  }

  /**
   * Get supported mobile money providers
   */
  getMobileMoneyProviders() {
    return this.mobileMoneyProviders;
  }
}

export default new PaymentService();
