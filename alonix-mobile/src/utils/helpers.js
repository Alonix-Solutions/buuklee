// Helper functions for formatting and calculations

// Safely capitalize a string (handles undefined/null)
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDistance = (km) => {
  if (km === undefined || km === null) return '0m';
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

export const formatElevation = (meters) => {
  return `${Math.round(meters)}m`;
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const formatPace = (secondsPerKm) => {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
};

export const formatSpeed = (kmh) => {
  if (kmh === undefined || kmh === null) return '0.0 km/h';
  return `${kmh.toFixed(1)} km/h`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  if (diffDays < 7) {
    return `In ${diffDays} days`;
  }

  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const formatDateTime = (dateString) => {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const formatPrice = (price, currency = 'USD') => {
  if (price === undefined || price === null || isNaN(price)) {
    return currency === 'MUR' ? 'Rs 0' : '$0';
  }
  const priceValue = Number(price);
  if (currency === 'MUR') {
    return `Rs ${priceValue.toLocaleString()}`;
  }
  return `$${priceValue.toLocaleString()}`;
};

export const calculateSavings = (normalPrice, sharedPrice) => {
  const savings = ((normalPrice - sharedPrice) / normalPrice) * 100;
  return Math.round(savings);
};

export const formatCalories = (calories) => {
  return `${Math.round(calories)} kcal`;
};

export const getActivityColor = (activity) => {
  const colors = {
    running: '#FF6B6B',
    cycling: '#4ECDC4',
    hiking: '#95E1D3',
    swimming: '#38B2AC',
  };
  return colors[activity] || '#6B7280';
};

export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444',
    extreme: '#7C2D12',
  };
  return colors[difficulty] || '#6B7280';
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula for calculating distance between two coordinates
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => {
  return (degrees * Math.PI) / 180;
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
};
