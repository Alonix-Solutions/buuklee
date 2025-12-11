import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const BookingContext = createContext({});

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookings from AsyncStorage on mount
  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    try {
      if (!user) {
        setBookings([]);
        setIsLoading(false);
        return;
      }

      const savedBookings = await AsyncStorage.getItem(`@bookings_${user.id}`);
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBookings = async (updatedBookings) => {
    try {
      if (!user) return;
      await AsyncStorage.setItem(
        `@bookings_${user.id}`,
        JSON.stringify(updatedBookings)
      );
    } catch (error) {
      console.error('Error saving bookings:', error);
    }
  };

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking details
   * @param {string} bookingData.type - Type of booking: 'hotel', 'car', 'driver', 'challenge'
   * @param {Object} bookingData.item - The item being booked (hotel, car, driver, or challenge)
   * @param {Object} bookingData.details - Additional booking details (dates, passengers, etc.)
   * @param {Object} bookingData.payment - Payment information
   */
  const createBooking = async (bookingData) => {
    try {
      if (!user) {
        throw new Error('User must be logged in to create booking');
      }

      const newBooking = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        type: bookingData.type, // 'hotel', 'car', 'driver', 'challenge'
        item: bookingData.item,
        details: bookingData.details,
        payment: bookingData.payment,
        status: 'pending', // pending, confirmed, cancelled, completed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookingReference: generateBookingReference(),
      };

      const updatedBookings = [newBooking, ...bookings];
      setBookings(updatedBookings);
      await saveBookings(updatedBookings);

      return { success: true, booking: newBooking };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to create booking',
      };
    }
  };

  /**
   * Cancel a booking
   * @param {string} bookingId - ID of the booking to cancel
   */
  const cancelBooking = async (bookingId) => {
    try {
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled', updatedAt: new Date().toISOString() }
          : booking
      );

      setBookings(updatedBookings);
      await saveBookings(updatedBookings);

      return { success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel booking',
      };
    }
  };

  /**
   * Update booking status
   * @param {string} bookingId - ID of the booking to update
   * @param {string} status - New status: 'pending', 'confirmed', 'cancelled', 'completed'
   */
  const updateBookingStatus = async (bookingId, status) => {
    try {
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status, updatedAt: new Date().toISOString() }
          : booking
      );

      setBookings(updatedBookings);
      await saveBookings(updatedBookings);

      return { success: true };
    } catch (error) {
      console.error('Error updating booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to update booking',
      };
    }
  };

  /**
   * Update booking details
   * @param {string} bookingId - ID of the booking to update
   * @param {Object} updates - Object containing fields to update
   */
  const updateBooking = async (bookingId, updates) => {
    try {
      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
          : booking
      );

      setBookings(updatedBookings);
      await saveBookings(updatedBookings);

      return { success: true };
    } catch (error) {
      console.error('Error updating booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to update booking',
      };
    }
  };

  /**
   * Get bookings filtered by type and/or status
   * @param {Object} filters - Filter criteria
   * @param {string} filters.type - Filter by booking type
   * @param {string} filters.status - Filter by booking status
   */
  const getBookings = (filters = {}) => {
    let filteredBookings = [...bookings];

    if (filters.type) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.type === filters.type
      );
    }

    if (filters.status) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === filters.status
      );
    }

    return filteredBookings;
  };

  /**
   * Get a single booking by ID
   * @param {string} bookingId - ID of the booking
   */
  const getBookingById = (bookingId) => {
    return bookings.find((booking) => booking.id === bookingId);
  };

  /**
   * Get booking statistics
   */
  const getBookingStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      byType: {
        hotel: bookings.filter((b) => b.type === 'hotel').length,
        car: bookings.filter((b) => b.type === 'car').length,
        driver: bookings.filter((b) => b.type === 'driver').length,
        challenge: bookings.filter((b) => b.type === 'challenge').length,
      },
    };
  };

  /**
   * Clear all bookings (mainly for testing)
   */
  const clearBookings = async () => {
    try {
      if (!user) return;
      await AsyncStorage.removeItem(`@bookings_${user.id}`);
      setBookings([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing bookings:', error);
      return {
        success: false,
        error: error.message || 'Failed to clear bookings',
      };
    }
  };

  const value = {
    bookings,
    isLoading,
    createBooking,
    cancelBooking,
    updateBooking,
    updateBookingStatus,
    getBookings,
    getBookingById,
    getBookingStats,
    clearBookings,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }

  return context;
};

// Helper function to generate booking reference
const generateBookingReference = () => {
  const prefix = 'ALX';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export default BookingContext;
