/**
 * WhatsApp integration utilities
 */

/**
 * Generate WhatsApp deep link URL
 * @param {string} phoneNumber - Phone number in international format (e.g., +23012345678)
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp deep link URL
 */
function generateWhatsAppLink(phoneNumber, message = '') {
  // Remove any non-digit characters except +
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure phone starts with +
  const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Generate WhatsApp link
  return `https://wa.me/${formattedPhone.replace(/\+/g, '')}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Generate WhatsApp booking message template
 * @param {Object} bookingData - Booking details
 * @param {string} type - Booking type ('hotel', 'restaurant', etc.)
 * @returns {string} Formatted message
 */
function generateBookingMessage(bookingData, type) {
  let message = '';

  switch (type) {
    case 'hotel':
      message = `Hello! I would like to make a hotel reservation.\n\n`;
      message += `Check-in: ${new Date(bookingData.checkIn).toLocaleDateString()}\n`;
      message += `Check-out: ${new Date(bookingData.checkOut).toLocaleDateString()}\n`;
      message += `Guests: ${bookingData.guests}\n`;
      if (bookingData.roomType) {
        message += `Room Type: ${bookingData.roomType}\n`;
      }
      if (bookingData.notes) {
        message += `\nNotes: ${bookingData.notes}`;
      }
      break;

    case 'restaurant':
      message = `Hello! I would like to make a restaurant reservation.\n\n`;
      message += `Date: ${new Date(bookingData.reservationDate).toLocaleDateString()}\n`;
      message += `Time: ${bookingData.reservationTime}\n`;
      message += `Party Size: ${bookingData.partySize} people\n`;
      if (bookingData.specialRequests) {
        message += `\nSpecial Requests: ${bookingData.specialRequests}`;
      }
      break;

    default:
      message = 'Hello! I would like to make a booking.';
  }

  return message;
}

/**
 * Generate WhatsApp inquiry message for discovery
 * @param {string} itemName - Name of hotel/restaurant
 * @param {string} inquiryType - Type of inquiry
 * @returns {string} Formatted message
 */
function generateInquiryMessage(itemName, inquiryType = 'general') {
  const messages = {
    general: `Hello! I'm interested in ${itemName}. Could you please provide more information?`,
    availability: `Hello! I'm interested in ${itemName}. Do you have availability?`,
    pricing: `Hello! I'm interested in ${itemName}. Could you please share your pricing?`,
    booking: `Hello! I would like to make a booking at ${itemName}.`
  };

  return messages[inquiryType] || messages.general;
}

module.exports = {
  generateWhatsAppLink,
  generateBookingMessage,
  generateInquiryMessage
};

