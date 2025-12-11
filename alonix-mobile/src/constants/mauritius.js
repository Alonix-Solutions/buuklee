// Mauritius Geographic Constants

// Default center of Mauritius (Port Louis area)
export const MAURITIUS_CENTER = {
  latitude: -20.1644,
  longitude: 57.5046,
  latitudeDelta: 0.5, // Covers most of the island
  longitudeDelta: 0.5,
};

// Common locations in Mauritius
export const MAURITIUS_LOCATIONS = {
  PORT_LOUIS: {
    latitude: -20.1644,
    longitude: 57.5046,
    name: 'Port Louis',
  },
  GRAND_BAIE: {
    latitude: -20.0092,
    longitude: 57.5761,
    name: 'Grand Baie',
  },
  LE_MORNE: {
    latitude: -20.4552,
    longitude: 57.3218,
    name: 'Le Morne',
  },
  FLIC_EN_FLAC: {
    latitude: -20.3484,
    longitude: 57.3606,
    name: 'Flic en Flac',
  },
  BLACK_RIVER_GORGES: {
    latitude: -20.4167,
    longitude: 57.4333,
    name: 'Black River Gorges',
  },
  TROU_AUX_BICHES: {
    latitude: -20.0344,
    longitude: 57.5489,
    name: 'Trou aux Biches',
  },
};

// Mauritius island boundaries (approximate)
export const MAURITIUS_BOUNDS = {
  north: -19.98,
  south: -20.53,
  east: 57.79,
  west: 57.30,
};

/**
 * Check if coordinates are within Mauritius
 */
export const isInMauritius = (latitude, longitude) => {
  return (
    latitude >= MAURITIUS_BOUNDS.south &&
    latitude <= MAURITIUS_BOUNDS.north &&
    longitude >= MAURITIUS_BOUNDS.west &&
    longitude <= MAURITIUS_BOUNDS.east
  );
};

/**
 * Get region that fits coordinates, or default to Mauritius center
 */
export const getMapRegion = (latitude, longitude, latitudeDelta = 0.05, longitudeDelta = 0.05) => {
  // If coordinates are provided and within Mauritius, use them
  if (latitude && longitude && isInMauritius(latitude, longitude)) {
    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };
  }

  // Otherwise, default to Mauritius center
  return MAURITIUS_CENTER;
};

/**
 * Calculate distance between two coordinates (in km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
