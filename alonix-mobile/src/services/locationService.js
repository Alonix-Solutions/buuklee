import GOOGLE_MAPS_CONFIG from '../config/google';

/**
 * Location Service for Google Places API integration
 * Provides autocomplete, details, directions, and more using full Google Maps Platform capabilities.
 */

class LocationService {
  constructor() {
    this.sessionToken = this.generateSessionToken();
    this.config = GOOGLE_MAPS_CONFIG;
  }

  /**
   * Generate a unique session token for Places API requests
   * This helps with billing optimization
   */
  generateSessionToken() {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get Nearby Places (Hotels, Restaurants, etc.)
   * @param {string} type - 'lodging', 'restaurant', 'cafe', etc.
   * @param {object} location - { latitude, longitude }
   * @param {number} radius - search radius in meters
   * @returns {Promise<Array>} List of places
   */
  async getNearbyPlaces(type, location, radius = 5000) {
    try {
      if (!this.config.API_KEY) {
        console.warn('Google Places API key not configured for nearby search.');
        return [];
      }

      const url = this.config.ENDPOINTS.NEARBY_SEARCH;
      const params = new URLSearchParams({
        location: `${location.latitude},${location.longitude}`,
        radius: radius,
        type: type,
        key: this.config.API_KEY,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        return data.results.map(place => ({
          id: place.place_id,
          _id: place.place_id, // For backward compatibility
          name: place.name,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            address: place.vicinity,
          },
          rating: place.rating,
          reviewCount: place.user_ratings_total || 0, // Added reviewCount
          price: place.price_level ? place.price_level * 50 : 100, // Approximate price
          priceRange: place.price_level || 1,
          currency: 'USD', // Default currency
          amenities: place.types.slice(0, 3).map(t => t.replace('_', ' ')),
          photos: place.photos ? place.photos.map(p => this.getPhotoUrl(p.photo_reference)) : [],
          isOpen: place.opening_hours?.open_now,
          source: 'google', // specific flag to debug source
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error getting nearby ${type}:`, error);
      return [];
    }
  }

  /**
   * Search for places using Google Places Autocomplete API
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of place predictions
   */
  async searchPlaces(query, options = {}) {
    try {
      if (!this.config.API_KEY) {
        console.warn('Google Places API key is missing in config/google.js. Using fallback search.');
        return this.fallbackSearch(query);
      }

      if (!query || query.length < 2) {
        return [];
      }

      const {
        location = `${this.config.MAURITIUS.center.latitude},${this.config.MAURITIUS.center.longitude}`,
        radius = this.config.SEARCH.autocomplete.radius,
        strictbounds = this.config.SEARCH.autocomplete.strictbounds,
        types = this.config.SEARCH.autocomplete.types,
        components = this.config.SEARCH.autocomplete.components,
      } = options;

      const url = this.config.ENDPOINTS.AUTOCOMPLETE;
      const params = new URLSearchParams({
        input: query,
        key: this.config.API_KEY,
        sessiontoken: this.sessionToken,
        location,
        radius,
        strictbounds,
        // types, // Don't restrict types too much for broader search
        components,
      });

      console.log(`[LocationService] Searching places with query: "${query}"`);

      const response = await fetch(`${url}?${params.toString()}`);

      if (!response.ok) {
        console.error(`[LocationService] API HTTP Error: ${response.status} ${response.statusText}`);
        return this.fallbackSearch(query);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        return data.predictions.map(prediction => ({
          id: prediction.place_id,
          placeId: prediction.place_id,
          name: prediction.structured_formatting.main_text,
          address: prediction.structured_formatting.secondary_text || prediction.description,
          full_description: prediction.description,
          icon: this.getIconForType(prediction.types),
          types: prediction.types,
          distance_meters: prediction.distance_meters, // Available if origin is provided
        }));
      } else if (data.status === 'ZERO_RESULTS') {
        console.log(`[LocationService] No results found for query: "${query}"`);
        return [];
      } else {
        console.error('[LocationService] Google Places API Error Status:', data.status, data.error_message);
        return this.fallbackSearch(query);
      }
    } catch (error) {
      console.error('[LocationService] Critical Error searching places:', error);
      return this.fallbackSearch(query);
    }
  }

  /**
   * Get place details by place ID (Premium Data)
   * @param {string} placeId - Google Place ID
   * @returns {Promise<object>} Place details
   */
  async getPlaceDetails(placeId) {
    try {
      if (!this.config.API_KEY) return null;

      const url = this.config.ENDPOINTS.PLACE_DETAILS;
      // Requesting all useful fields
      const fields = 'name,formatted_address,geometry,place_id,types,rating,user_ratings_total,photos,opening_hours,website,international_phone_number,vicinity';

      const params = new URLSearchParams({
        place_id: placeId,
        key: this.config.API_KEY,
        sessiontoken: this.sessionToken,
        fields,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        return {
          id: place.place_id,
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          vicinity: place.vicinity,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          types: place.types,
          rating: place.rating,
          reviews: place.user_ratings_total,
          isOpen: place.opening_hours?.open_now,
          photos: place.photos ? place.photos.map(p => this.getPhotoUrl(p.photo_reference)) : [],
          phone: place.international_phone_number,
          website: place.website,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    } finally {
      this.sessionToken = this.generateSessionToken();
    }
  }

  /**
   * Get directions between two points (Advanced)
   * @param {object} origin - {latitude, longitude}
   * @param {object} destination - {latitude, longitude}
   * @param {string} mode - travel mode
   * @returns {Promise<object>} Route information
   */
  async getDirections(origin, destination, mode = 'driving') {
    try {
      if (!this.config.API_KEY) return null;

      const url = this.config.ENDPOINTS.DIRECTIONS;
      const params = new URLSearchParams({
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode,
        key: this.config.API_KEY,
        alternatives: 'true', // Get multiple routes
        region: 'mu',
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        // Return information for the best route
        const route = data.routes[0];
        const leg = route.legs[0];

        return {
          distance: {
            text: leg.distance.text,
            value: leg.distance.value,
          },
          duration: {
            text: leg.duration.text,
            value: leg.duration.value,
          },
          duration_in_traffic: leg.duration_in_traffic ? {
            text: leg.duration_in_traffic.text,
            value: leg.duration_in_traffic.value,
          } : null,
          polyline: route.overview_polyline.points,
          bounds: route.bounds,
          steps: leg.steps,
          start_address: leg.start_address,
          end_address: leg.end_address,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }

  /**
   * Get Distance Matrix (Multiple origins/destinations)
   * Essential for accurate ETA across multiple drivers
   */
  async getDistanceMatrix(origins, destinations) {
    try {
      if (!this.config.API_KEY) return null;

      const originStr = origins.map(o => `${o.latitude},${o.longitude}`).join('|');
      const destStr = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');

      const url = this.config.ENDPOINTS.DISTANCE_MATRIX;
      const params = new URLSearchParams({
        origins: originStr,
        destinations: destStr,
        key: this.config.API_KEY,
        mode: 'driving',
      });

      const response = await fetch(`${url}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      return null;
    }
  }

  /**
   * Reverse Geocode (Coordinates to Address)
   */
  async reverseGeocode(latitude, longitude) {
    try {
      if (!this.config.API_KEY) {
        // Fallback if no key (though we should have it)
        return 'Unknown Location';
      }

      const url = this.config.ENDPOINTS.REVERSE_GEOCODE;
      const params = new URLSearchParams({
        latlng: `${latitude},${longitude}`,
        key: this.config.API_KEY,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'Unknown Location';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Unknown Location';
    }
  }

  /**
   * Get Photo URL
   */
  getPhotoUrl(reference, maxWidth = 400) {
    if (!reference || !this.config.API_KEY) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${reference}&key=${this.config.API_KEY}`;
  }

  /**
   * Decode Google Maps Polyline
   */
  decodePolyline(encoded) {
    if (!encoded) return [];
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({ latitude: (lat / 1e5), longitude: (lng / 1e5) });
    }
    return poly;
  }

  /**
 * Calculate exact distance between two coordinates (Haversine formula)
 * Good for client-side estimations
 */
  calculateDistance(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Fallback for when API fails
   */
  fallbackSearch(query) {
    const mauritiusLocations = [
      { id: '1', name: 'Port Louis', address: 'Port Louis, Mauritius', icon: 'business', types: ['locality'] },
      { id: '2', name: 'Grand Baie', address: 'Grand Baie, Mauritius', icon: 'location', types: ['locality'] },
      // ... (Keep existing fallback logic)
    ];
    return mauritiusLocations.filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()));
  }

  getIconForType(types) {
    if (!types || !Array.isArray(types)) return 'location';
    if (types.includes('airport')) return 'airplane';
    if (types.includes('restaurant') || types.includes('food')) return 'restaurant';
    if (types.includes('lodging') || types.includes('hotel')) return 'bed';
    return 'location';
  }
}

export default new LocationService();
