import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import { formatPrice, formatDistance } from '../utils/helpers';
import { openWhatsApp } from '../utils/linking';

const { width } = Dimensions.get('window');

const HotelDetailScreen = ({ route, navigation }) => {
  const { hotel } = route.params || {};
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!hotel) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.gray }}>Hotel details not available</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Normalize hotel data to avoid runtime errors
  const photos = Array.isArray(hotel.photos) ? hotel.photos : [];
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const location = hotel.location || {};
  const geoCoords = Array.isArray(location.coordinates) ? location.coordinates : null; // [lng, lat]

  const markerLat = geoCoords
    ? geoCoords[1]
    : location.latitude || location.lat || -20.1644;
  const markerLng = geoCoords
    ? geoCoords[0]
    : location.longitude || location.lng || 57.5046;

  const locationText = typeof location === 'string'
    ? location
    : location.address || location.name || 'Mauritius';

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color={COLORS.warning} />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        <View style={styles.photoGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActivePhotoIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.photo}
              />
            ))}
          </ScrollView>

          {/* Photo Indicators */}
          <View style={styles.photoIndicators}>
            {photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  activePhotoIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Name and Rating */}
          <Text style={styles.name}>{hotel.name}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.stars}>{renderStars(hotel.rating)}</View>
            <Text style={styles.ratingText}>
              {hotel.rating} ({hotel.reviewCount} reviews)
            </Text>
            <Text style={styles.priceRange}>
              {' • '}
              {typeof hotel.priceRange === 'string'
                ? hotel.priceRange
                : (hotel.priceRange?.min && hotel.priceRange?.max
                  ? `${hotel.priceRange.currency || 'Rs'} ${hotel.priceRange.min}-${hotel.priceRange.max}`
                  : '$$')}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.gray} />
            <Text style={styles.locationText}>{locationText}</Text>
          </View>
          {hotel.distance && (
            <View style={styles.distanceRow}>
              <Ionicons name="walk-outline" size={18} color={COLORS.gray} />
              <Text style={styles.distanceText}>
                {formatDistance(hotel.distance)} to beach
              </Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>{hotel.description}</Text>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Map View */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: markerLat,
                  longitude: markerLng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                loadingEnabled={true}
                loadingIndicatorColor={COLORS.primary}
                loadingBackgroundColor={COLORS.backgroundGray}
                cacheEnabled={true}
              >
                <Marker
                  coordinate={{
                    latitude: markerLat,
                    longitude: markerLng,
                  }}
                  title={hotel.name}
                  description={location.address}
                  tracksViewChanges={false}
                >
                  <View style={styles.customMarker}>
                    <Ionicons name="location" size={32} color={COLORS.primary} />
                  </View>
                </Marker>
              </MapView>
              <TouchableOpacity
                style={styles.mapOverlay}
                activeOpacity={1}
                onPress={() => {
                  // Open full-screen map or navigate to map screen
                  const lat = markerLat;
                  const lng = markerLng;
                  const label = encodeURIComponent(hotel.name);
                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
                  Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.directionsButton}
              activeOpacity={0.8}
              onPress={() => {
                const lat = markerLat;
                const lng = markerLng;
                const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                Linking.openURL(url).catch(err => console.error('Error opening directions:', err));
              }}
            >
              <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all {hotel.reviewCount}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.comingSoonText}>Review section coming soon...</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.price}>{formatPrice(hotel.price, hotel.currency)}</Text>
          <Text style={styles.priceNight}>/night</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={() => {
            const message = `Hi, I would like to book a room at ${hotel.name} for...`;
            openWhatsApp(hotel.whatsappNumber, message);
          }}
        >
          <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
          <Text style={styles.bookButtonText}>Book via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  photoGallery: {
    height: 300,
    backgroundColor: COLORS.lightGray,
  },
  photo: {
    width: width,
    height: 300,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white + '60',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_MEDIUM,
  },
  content: {
    padding: SIZES.padding,
  },
  name: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  priceRange: {
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    marginLeft: 8,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  distanceText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    marginLeft: 8,
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_MEDIUM,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  directionsText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 80, // Adjusted to sit above floating navigation
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    borderRadius: 20,
    marginHorizontal: 16,
    ...SHADOW_LARGE,
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginRight: 6,
  },
  price: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceNight: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 2,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    ...SHADOW_MEDIUM,
  },
  bookButtonText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default HotelDetailScreen;
