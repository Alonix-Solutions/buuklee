import { API_BASE_URL } from '../config/api';

/**
 * Hotel service - lightweight wrapper to call hotels endpoints
 * Usage examples are provided below (in comments).
 */
const buildUrl = (path, params = {}) => {
  const url = new URL(path, API_BASE_URL);
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) url.searchParams.append(k, params[k]);
  });
  return url.toString();
};

const hotelService = {
  /**
   * Get nearby hotels using either bbox (neLat/neLng/swLat/swLng) or centerLat/centerLng with radius (meters)
   * Returns: { success, count, data: [{id,name,latitude,longitude,thumbnail,rating,priceRange}] }
   */
  getNearby: async ({ neLat, neLng, swLat, swLng, centerLat, centerLng, radius = 5000, limit = 100 } = {}) => {
    const params = { neLat, neLng, swLat, swLng, centerLat, centerLng, radius, limit };
    const url = buildUrl('/hotels/near', params);
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch nearby hotels');
    }
    return res.json();
  }
  ,
  /**
   * Get clustered hotels for a viewport. Uses server-side grid clustering.
   * Caching: in-memory TTL cache (30s) keyed by bbox+zoom to reduce repeated requests.
   */
  getClusters: (() => {
    const cache = new Map();
    const TTL = 30 * 1000; // 30 seconds

    return async ({ neLat, neLng, swLat, swLng, zoom = 10, limit = 500 } = {}) => {
      const key = `clusters:${neLat},${neLng},${swLat},${swLng},${zoom},${limit}`;
      const now = Date.now();
      const cached = cache.get(key);
      if (cached && now - cached.ts < TTL) {
        return cached.value;
      }

      const url = buildUrl('/hotels/cluster', { neLat, neLng, swLat, swLng, zoom, limit });
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch hotel clusters');
      }
      const data = await res.json();
      cache.set(key, { ts: now, value: data });
      return data;
    };
  })()
};

export default hotelService;

/* Example usage (in a map screen):

import hotelService from '../services/hotelService';

const onRegionChangeComplete = async (region) => {
  // region: { latitude, longitude, latitudeDelta, longitudeDelta }
  const neLat = region.latitude + region.latitudeDelta / 2;
  const neLng = region.longitude + region.longitudeDelta / 2;
  const swLat = region.latitude - region.latitudeDelta / 2;
  const swLng = region.longitude - region.longitudeDelta / 2;

  try {
    const resp = await hotelService.getNearby({ neLat, neLng, swLat, swLng, limit: 200 });
    const markers = resp.data.map(h => ({
      id: h.id,
      coordinate: { latitude: h.latitude, longitude: h.longitude },
      title: h.name,
      thumbnail: h.thumbnail,
      rating: h.rating,
      priceRange: h.priceRange
    }));
    setMarkers(markers);
  } catch (e) {
    console.warn('Hotels nearby error', e.message);
  }
};

*/
