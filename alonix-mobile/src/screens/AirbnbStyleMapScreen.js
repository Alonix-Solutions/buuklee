import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import placeService from '../services/placeService';
import hotelService from '../services/hotelService';
import locationService from '../services/locationService';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = 140;
const SPACING = 10;

const AirbnbStyleMapScreen = ({ navigation }) => {
  // State management
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -20.1644, // Port Louis, Mauritius
    longitude: 57.5046,
    latitudeDelta: 0.5, // ~10km radius view
    longitudeDelta: 0.5,
  });
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 300],
    propertyTypes: [],
    amenities: [],
  });
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);

  // Refs
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const markerScale = useRef({});

  // Load hotels from API
  useEffect(() => {
    loadHotels();
    // initial cluster load for initial map region
    fetchClustersForRegion(mapRegion);
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      // Use Google Places API via locationService
      const result = await locationService.getNearbyPlaces(
        'lodging',
        mapRegion, // Use current map region
        5000 // 5km radius
      );

      const loadedHotels = result || [];
      setHotels(loadedHotels);
      setFilteredHotels(loadedHotels);

      // Initialize marker animations
      loadedHotels.forEach((hotel) => {
        markerScale.current[hotel.id] = new Animated.Value(1);
      });
    } catch (error) {
      console.error('Load hotels error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple Filter Modal (minimal placeholder to avoid missing symbol)
  const FilterModal = () => (
    <Modal visible={showFilters} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Filters</Text>
          <Text style={{ color: '#666', marginBottom: 12 }}>Basic filters placeholder</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)} style={[styles.applyButton, { alignSelf: 'flex-end' }]}>
            <Text style={styles.applyButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const regionToZoom = (region) => {
    // approximate zoom from longitudeDelta
    const lngDelta = region.longitudeDelta || 0.5;
    const zoom = Math.round(Math.log2(360 / lngDelta));
    return Math.max(1, Math.min(20, zoom));
  };

  const fetchClustersForRegion = async (region) => {
    try {
      setMapLoading(true);
      // Refresh hotels list from Google Places for new region
      const result = await locationService.getNearbyPlaces(
        'lodging',
        region,
        10000 // 10km search
      );
      if (result && result.length > 0) {
        setHotels(result);
        setFilteredHotels(result);
        // Re-init animations for new markers
        result.forEach((hotel) => {
          if (!markerScale.current[hotel.id]) {
            markerScale.current[hotel.id] = new Animated.Value(1);
          }
        });
      }
    } catch (e) {
      console.warn('Place fetch error', e.message);
    } finally {
      setMapLoading(false);
    }
  };

  // Filter hotels based on selected filters
  useEffect(() => {
    let filtered = hotels;

    // Price filter
    filtered = filtered.filter(
      (hotel) =>
        hotel.price >= filters.priceRange[0] &&
        hotel.price <= filters.priceRange[1]
    );

    // Property type filter
    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter((hotel) =>
        filters.propertyTypes.includes(hotel.priceRange)
      );
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((hotel) =>
        filters.amenities.every((amenity) => hotel.amenities.includes(amenity))
      );
    }

    setFilteredHotels(filtered);
  }, [filters]);

  // Animate marker when selected
  const animateMarker = (hotelId, toValue) => {
    if (markerScale.current[hotelId]) {
      Animated.spring(markerScale.current[hotelId], {
        toValue,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }
  };

  // Handle hotel selection from map marker
  const handleMarkerPress = (hotel, index) => {
    setSelectedHotel(hotel);

    // Animate to hotel location
    mapRef.current?.animateToRegion(
      {
        latitude: hotel.location.latitude,
        longitude: hotel.location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
      350
    );

    // Scroll to corresponding card
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });

    // Animate marker
    animateMarker(hotel.id, 1.3);

    // Reset other markers
    filteredHotels.forEach((h) => {
      if (h.id !== hotel.id) {
        animateMarker(h.id, 1);
      }
    });
  };

  // Handle card scroll
  const handleCardScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + SPACING));

    if (index >= 0 && index < filteredHotels.length) {
      const hotel = filteredHotels[index];

      if (selectedHotel?.id !== hotel.id) {
        setSelectedHotel(hotel);

        // Animate to hotel
        mapRef.current?.animateToRegion(
          {
            latitude: hotel.location.latitude,
            longitude: hotel.location.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          350
        );

        // Animate marker
        animateMarker(hotel.id, 1.3);

        // Reset other markers
        filteredHotels.forEach((h) => {
          if (h.id !== hotel.id) {
            animateMarker(h.id, 1);
          }
        });
      }
    }
  };

  // Toggle wishlist
  const toggleWishlist = (hotelId) => {
    setWishlist((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  // Handle map region change
  const handleRegionChangeComplete = (region) => {
    setMapRegion(region);
    setShowSearchArea(true);
    // fetch clusters on region change (debounce could be added)
    fetchClustersForRegion(region);
  };

  // Search current area
  const searchThisArea = () => {
    setShowSearchArea(false);
    // In real app, this would trigger API call with current map bounds
    console.log('Searching area:', mapRegion);
  };

  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Custom marker component
  const CustomMarker = ({ hotel, isSelected }) => {
    const scale = markerScale.current[hotel.id] || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.markerContainer,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={[
            styles.priceMarker,
            isSelected && styles.priceMarkerSelected,
          ]}
        >
          <Text
            style={[
              styles.priceText,
              isSelected && styles.priceTextSelected,
            ]}
          >
            ${hotel.price}
          </Text>
        </View>
        <View
          style={[
            styles.markerArrow,
            isSelected && styles.markerArrowSelected,
          ]}
        />
      </Animated.View>
    );
  };

  const ClusterMarker = ({ cluster }) => {
    return (
      <View style={styles.clusterMarker}>
        <Text style={styles.clusterCount}>{cluster.count}</Text>
      </View>
    );
  };

  // Property card component (simplified)
  const PropertyCard = ({ hotel }) => {
    const isInWishlist = wishlist.includes(hotel.id || hotel._id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('HotelDetails', { hotel })}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: hotel.photos?.[0] || null }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(hotel.id || hotel._id)}
        >
          <Ionicons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={24}
            color={isInWishlist ? '#FF385C' : '#FFF'}
          />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.hotelName} numberOfLines={1}>
              {hotel.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FF385C" />
              <Text style={styles.rating}>{hotel.rating}</Text>
            </View>
          </View>
          <Text style={styles.location} numberOfLines={1}>
            {typeof hotel.location === 'string' ? hotel.location : hotel.location?.address || ''}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.price}>${hotel.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // List view component
  const ListView = () => (
    <ScrollView style={styles.listView}>
      {filteredHotels.map((hotel) => {
        const isInWishlist = wishlist.includes(hotel.id);
        return (
          <TouchableOpacity
            key={hotel.id}
            style={styles.listCard}
            onPress={() => navigation.navigate('HotelDetails', { hotel })}
          >
            <Image
              source={{ uri: hotel.photos[0] }}
              style={styles.listCardImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.listWishlistButton}
              onPress={() => toggleWishlist(hotel.id)}
            >
              <Ionicons
                name={isInWishlist ? 'heart' : 'heart-outline'}
                size={22}
                color={isInWishlist ? '#FF385C' : '#FFF'}
              />
            </TouchableOpacity>
            <View style={styles.listCardContent}>
              <View style={styles.listCardHeader}>
                <Text style={styles.listHotelName} numberOfLines={1}>
                  {hotel.name}
                </Text>
                <View style={styles.listRatingContainer}>
                  <Ionicons name="star" size={14} color="#FF385C" />
                  <Text style={styles.listRating}>{hotel.rating}</Text>
                </View>
              </View>
              <Text style={styles.listLocation} numberOfLines={1}>
                {hotel.location.address}
              </Text>
              <View style={styles.listAmenities}>
                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.listCardFooter}>
                <Text style={styles.listDistance}>
                  {hotel.distance} km from beach
                </Text>
                <View style={styles.listPriceContainer}>
                  <Text style={styles.listPrice}>${hotel.price}</Text>
                  <Text style={styles.listPriceLabel}> / night</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {viewMode === 'map' ? (
        <>
          {/* Map View */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={mapRegion}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation
            showsMyLocationButton={false}
            loadingEnabled={true}
            loadingIndicatorColor="#FF385C"
            loadingBackgroundColor="#FFFFFF"
            cacheEnabled={true}
          >
            {filteredHotels.map((hotel, index) => (
              <Marker
                key={hotel.id}
                coordinate={{
                  latitude: hotel.location.latitude,
                  longitude: hotel.location.longitude,
                }}
                onPress={() => handleMarkerPress(hotel, index)}
                tracksViewChanges={false}
              >
                <CustomMarker
                  hotel={hotel}
                  isSelected={selectedHotel?.id === hotel.id}
                />
              </Marker>
            ))}
          </MapView>

          {/* Floating Search Bar */}
          <View style={styles.searchBarContainer}>
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => console.log('Search pressed')}
            >
              <Ionicons name="search" size={20} color="#666" />
              <Text style={styles.searchText}>Search hotels...</Text>
              <TouchableOpacity
                style={styles.filterIconButton}
                onPress={() => setShowFilters(true)}
              >
                <Ionicons name="options-outline" size={20} color="#222" />
                {(filters.propertyTypes.length > 0 ||
                  filters.amenities.length > 0) && (
                    <View style={styles.filterBadge} />
                  )}
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Search This Area Button */}
          {showSearchArea && (
            <Animated.View style={styles.searchAreaButton}>
              <TouchableOpacity
                style={styles.searchAreaButtonInner}
                onPress={searchThisArea}
              >
                <Ionicons name="refresh" size={16} color="#FFF" />
                <Text style={styles.searchAreaText}>Search this area</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Bottom Card Carousel */}
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={filteredHotels}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <PropertyCard hotel={item} />}
              onScroll={handleCardScroll}
              scrollEventThrottle={16}
              getItemLayout={(data, index) => ({
                length: CARD_WIDTH + SPACING,
                offset: (CARD_WIDTH + SPACING) * index,
                index,
              })}
            />
          </View>

          {/* View Toggle Button */}
          <TouchableOpacity
            style={styles.viewToggleButton}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={20} color="#FFF" />
            <Text style={styles.viewToggleText}>List</Text>
          </TouchableOpacity>

          {/* My Location Button */}
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={() => {
              mapRef.current?.animateToRegion(
                {
                  latitude: -20.1644,
                  longitude: 57.5046,
                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                },
                1000
              );
            }}
          >
            <Ionicons name="navigate" size={24} color="#222" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* List View */}
          <View style={styles.listHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setViewMode('map')}
            >
              <Ionicons name="map" size={20} color="#222" />
              <Text style={styles.backButtonText}>Map</Text>
            </TouchableOpacity>
            <Text style={styles.listHeaderTitle}>
              {filteredHotels.length} Properties
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(true)}>
              <Ionicons name="options-outline" size={24} color="#222" />
              {(filters.propertyTypes.length > 0 ||
                filters.amenities.length > 0) && (
                  <View style={styles.filterBadge} />
                )}
            </TouchableOpacity>
          </View>
          <ListView />
        </>
      )}

      {/* Filter Modal */}
      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  map: {
    width: '100%',
    height: '100%',
  },

  // Marker Styles
  markerContainer: {
    alignItems: 'center',
  },
  priceMarker: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  priceMarkerSelected: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },
  priceTextSelected: {
    color: '#FFF',
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
    marginTop: -1,
  },
  markerArrowSelected: {
    borderTopColor: '#222',
  },

  // Search Bar Styles
  searchBarContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  filterIconButton: {
    padding: 4,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF385C',
  },

  // Search Area Button
  searchAreaButton: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    zIndex: 1,
  },
  searchAreaButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchAreaText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Card Carousel Styles
  carouselContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  carouselContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: SPACING / 2,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: 120,
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    position: 'absolute',
    left: 130,
    right: 10,
    top: 10,
    bottom: 10,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },

  // View Toggle Button
  viewToggleButton: {
    position: 'absolute',
    bottom: CARD_HEIGHT + 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewToggleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // My Location Button
  myLocationButton: {
    position: 'absolute',
    bottom: CARD_HEIGHT + 40,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // List View Styles
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginLeft: 6,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  listView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listCardImage: {
    width: '100%',
    height: 200,
  },
  listWishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardContent: {
    padding: 16,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  listHotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 12,
  },
  listRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginLeft: 4,
  },
  listLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  listAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenityTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
    color: '#666',
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  listDistance: {
    fontSize: 13,
    color: '#999',
  },
  listPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  listPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  listPriceLabel: {
    fontSize: 13,
    color: '#666',
  },

  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  priceSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#666',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  chipSelected: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#FFF',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default AirbnbStyleMapScreen;
