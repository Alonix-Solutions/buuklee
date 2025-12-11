import { Linking, Platform } from 'react-native';

/**
 * Opens WhatsApp with a pre-filled message
 * @param {string} phoneNumber - The phone number to send message to (with country code, no + or spaces)
 * @param {string} message - The message to send
 */
export const openWhatsApp = async (phoneNumber, message) => {
  // Clean phone number (remove + and spaces)
  const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  try {
    // Universal links handle app opening or browser fallback automatically
    await Linking.openURL(url);
  } catch (error) {
    console.error("An error occurred", error);
    alert('Could not open WhatsApp');
  }
};
