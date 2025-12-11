import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import PropTypes from 'prop-types';
import { MAURITIUS_CENTER } from '../constants/mauritius';
import locationService from '../services/locationService';

const { width, height } = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 120;
const BOTTOM_SHEET_MAX_HEIGHT = height * 0.65;
// Use Mauritius center instead of Nairobi
const MAP_CENTER = {
  ...MAURITIUS_CENTER,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const UberStyleRideScreen = ({ navigation }) => {
  // State management
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedRideType, setSelectedRideType] = useState(null);
  const [showRoutePolyline, setShowRoutePolyline] = useState(false);
  const [currentLocation] = useState(MAP_CENTER);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  // Search State
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState(null); // 'pickup' or 'destination'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animation refs
  const bottomSheetAnimation = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const searchContainerAnimation = useRef(new Animated.Value(0)).current; // 0: collapsed, 1: expanded
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const buttonAnimation = useRef(new Animated.Value(1)).current;

  // Map ref
  const mapRef = useRef(null);

  // Gesture tracking refs
  const lastGestureY = useRef(BOTTOM_SHEET_MIN_HEIGHT);

  // Ride types with pricing and ETA
  const rideTypes = [
    {
      id: 'economy',
      name: 'Economy',
      description: 'Affordable rides',
      icon: '🚗',
      carType: 'Sedan',
      capacity: '4 seats',
      priceRange: { min: 300, max: 500 },
      eta: '3 min',
      color: COLORS.primary,
    },
    {
      id: 'comfort',
      name: 'Comfort',
      description: 'Extra space & comfort',
      icon: '🚙',
      carType: 'SUV',
      capacity: '6 seats',
      priceRange: { min: 500, max: 800 },
      eta: '4 min',
      color: COLORS.accent,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Luxury experience',
      icon: '🚘',
      carType: 'Luxury',
      capacity: '4 seats',
      priceRange: { min: 1000, max: 1500 },
      eta: '5 min',
      color: COLORS.secondary,
    },
  ];

  // Generate random nearby drivers
  useEffect(() => {
    const generateNearbyDrivers = () => {
      const drivers = [];
      const radiusInDegrees = 0.02; // Approximately 2km

      for (let i = 0; i < 5; i++) {
        const randomAngle = Math.random() * 2 * Math.PI;
        const randomRadius = Math.random() * radiusInDegrees;

        const driver = {
          id: `driver_${i}`,
          latitude: MAP_CENTER.latitude + randomRadius * Math.cos(randomAngle),
          longitude: MAP_CENTER.longitude + randomRadius * Math.sin(randomAngle),
          rotation: Math.random() * 360,
          type: rideTypes[Math.floor(Math.random() * rideTypes.length)].id,
        };
        drivers.push(driver);
      }
      setNearbyDrivers(drivers);
    };

    generateNearbyDrivers();
  }, []);

  // Keyboard listeners - essential for UI adjustment
  useEffect(() => {
    // We strictly use keyboard listeners to toggle the search view expansion
    // This gives a much smoother experience than relying on focus
  }, []);

  // Google Places API Location Search
  const handleSearch = async (text) => {
    setSearchQuery(text);
    setIsSearching(true);

    try {
      if (text.length > 1) {
        // Use Google Places API for autocomplete
        const results = await locationService.searchPlaces(text, {
          location: `${currentLocation.latitude},${currentLocation.longitude}`,
          radius: 50000, // 50km radius
          components: 'country:mu', // Restrict to Mauritius
        });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const openSearch = (field) => {
    setActiveSearchField(field);
    setSearchQuery(field === 'pickup' ? pickup : destination);
    setSearchResults([]);
    setShowSearchModal(true);

    // Animate to full screen search mode
    Animated.timing(searchContainerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Hide bottom sheet
    collapseBottomSheet(0); // Collapse to 0 (hidden)
  };

  const closeSearch = () => {
    setShowSearchModal(false);
    setActiveSearchField(null);
    setSearchQuery('');

    // Animate back to normal
    Animated.timing(searchContainerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Restore bottom sheet if we have a destination
    if (destination) {
      expandBottomSheet();
    } else {
      collapseBottomSheet(BOTTOM_SHEET_MIN_HEIGHT);
    }
  };

  const selectLocation = (location) => {
    if (activeSearchField === 'pickup') {
      setPickup(location.name);
    } else {
      setDestination(location.name);
    }
    closeSearch();
  };

  // Pulsing animation for current location
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Expand bottom sheet when destination is entered
  useEffect(() => {
    if (showSearchModal) {
      // Hide bottom sheet completely when searching
      collapseBottomSheet(0);
    } else if (destination.length > 0) {
      expandBottomSheet();
      setShowRoutePolyline(true);
    } else {
      collapseBottomSheet(BOTTOM_SHEET_MIN_HEIGHT);
      setShowRoutePolyline(false);
    }
  }, [destination, showSearchModal]);

  const expandBottomSheet = () => {
    Animated.spring(bottomSheetAnimation, {
      toValue: BOTTOM_SHEET_MAX_HEIGHT,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  const collapseBottomSheet = (toValue = BOTTOM_SHEET_MIN_HEIGHT) => {
    Animated.spring(bottomSheetAnimation, {
      toValue: toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  // Gesture handlers for manual sliding
  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      const newHeight = lastGestureY.current - translationY;

      // Determine if should expand or collapse based on gesture
      if (newHeight > (BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_MAX_HEIGHT) / 2) {
        expandBottomSheet();
        lastGestureY.current = BOTTOM_SHEET_MAX_HEIGHT;
      } else {
        collapseBottomSheet(destination ? BOTTOM_SHEET_MIN_HEIGHT : 0);
        lastGestureY.current = destination ? BOTTOM_SHEET_MIN_HEIGHT : 0;
      }
    }
  };

  const onGestureHandlerEvent = (event) => {
    const { translationY } = event.nativeEvent;
    // Don't allow dragging if hidden (search mode)
    if (showSearchModal) return;

    const newHeight = Math.max(
      BOTTOM_SHEET_MIN_HEIGHT,
      Math.min(BOTTOM_SHEET_MAX_HEIGHT, lastGestureY.current - translationY)
    );

    bottomSheetAnimation.setValue(newHeight);
  };

  const handleRideTypeSelect = (rideType) => {
    setSelectedRideType(rideType);
    // Animate button
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleConfirmPickup = () => {
    if (!selectedRideType || !destination) {
      return;
    }

    // Animate button press
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to driver selection or tracking screen
      navigation.navigate('DriverSelection', {
        rideType: selectedRideType,
        pickup,
        destination,
      });
    });
  };

  // Generate mock route coordinates
  const getRouteCoordinates = () => {
    if (!showRoutePolyline) return [];

    const destinationCoord = {
      latitude: MAP_CENTER.latitude + 0.015,
      longitude: MAP_CENTER.longitude + 0.015,
    };

    return [
      currentLocation,
      {
        latitude: (currentLocation.latitude + destinationCoord.latitude) / 2,
        longitude: (currentLocation.longitude + destinationCoord.longitude) / 2 + 0.005,
      },
      destinationCoord,
    ];
  };

  const renderDriverMarker = (driver) => {
    const rideType = rideTypes.find(rt => rt.id === driver.type);
    return (
      <Marker
        key={driver.id}
        coordinate={{
          latitude: driver.latitude,
          longitude: driver.longitude,
        }}
        anchor={{ x: 0.5, y: 0.5 }}
        rotation={driver.rotation}
        tracksViewChanges={false}
      >
        <View style={styles.driverMarker}>
          <View style={[styles.driverIconContainer, { backgroundColor: rideType?.color || COLORS.primary }]}>
            <Text style={styles.driverIcon}>🚗</Text>
          </View>
        </View>
      </Marker>
    );
  };

  const renderRideTypeCard = (rideType) => {
    const isSelected = selectedRideType?.id === rideType.id;
    const estimatedPrice = Math.round((rideType.priceRange.min + rideType.priceRange.max) / 2);

    return (
      <TouchableOpacity
        key={rideType.id}
        style={[
          styles.rideTypeCard,
          isSelected && styles.rideTypeCardSelected,
        ]}
        onPress={() => handleRideTypeSelect(rideType)}
        activeOpacity={0.7}
      >
        <View style={styles.rideTypeHeader}>
          <View style={styles.rideTypeIconContainer}>
            <Text style={styles.rideTypeIcon}>{rideType.icon}</Text>
          </View>
          <View style={styles.rideTypeInfo}>
            <Text style={[styles.rideTypeName, isSelected && styles.rideTypeNameSelected]}>
              {rideType.name}
            </Text>
            <Text style={styles.rideTypeDescription}>{rideType.carType}</Text>
          </View>
        </View>

        <View style={styles.rideTypeDetails}>
          <View style={styles.rideTypeDetailRow}>
            <Ionicons name="people-outline" size={14} color={COLORS.gray} />
            <Text style={styles.rideTypeDetailText}>{rideType.capacity}</Text>
          </View>
          <View style={styles.rideTypeDetailRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.gray} />
            <Text style={styles.rideTypeDetailText}>{rideType.eta}</Text>
          </View>
        </View>

        <View style={styles.rideTypePriceContainer}>
          <Text style={[styles.rideTypePrice, isSelected && styles.rideTypePriceSelected]}>
            Rs {estimatedPrice}
          </Text>
          <Text style={styles.rideTypePriceRange}>
            ({rideType.priceRange.min}-{rideType.priceRange.max})
          </Text>
        </View>

        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={MAP_CENTER}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor={COLORS.primary}
        loadingBackgroundColor={COLORS.white}
        minZoomLevel={10}
        maxZoomLevel={18}
      >
        {/* Current Location Marker with Pulse */}
        <Marker
          coordinate={currentLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={styles.currentLocationContainer}>
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: pulseAnimation }],
                  opacity: pulseAnimation.interpolate({
                    inputRange: [1, 1.3],
                    outputRange: [0.5, 0],
                  }),
                },
              ]}
            />
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </View>
        </Marker>

        {/* Nearby Drivers */}
        {nearbyDrivers.map(driver => renderDriverMarker(driver))}

        {/* Route Polyline */}
        {showRoutePolyline && (
          <Polyline
            coordinates={getRouteCoordinates()}
            strokeColor={COLORS.primary}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Header Overlay - Hidden when searching */}
      {!showSearchModal && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('MyBookings')}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>
      )}

      {/* Search Input Overlay - Animated */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            top: searchContainerAnimation.interpolate({
              inputRange: [0, 1],
              // Use fallback for undefined SatusBar.currentHeight
              outputRange: [Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight || 24) + 60, 0]
            }),
            left: searchContainerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [SIZES.padding, 0]
            }),
            right: searchContainerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [SIZES.padding, 0]
            }),
            // Use state-based layout for properties that can't be interpolated smoothly from 'auto'/'undefined'
            height: showSearchModal ? '100%' : 'auto',
            bottom: showSearchModal ? 0 : undefined,

            backgroundColor: searchContainerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', COLORS.white]
            }),
            padding: searchContainerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, SIZES.padding]
            }),
            paddingTop: searchContainerAnimation.interpolate({
              inputRange: [0, 1],
              // Use fallback here too
              outputRange: [0, Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 20]
            }),
          }
        ]}
      >
        <View style={[styles.searchCard, showSearchModal && styles.searchCardExpanded]}>
          {/* Pickup Input */}
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <View style={styles.pickupDot} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              placeholderTextColor={COLORS.gray}
              value={showSearchModal && activeSearchField === 'pickup' ? searchQuery : pickup}
              onChangeText={showSearchModal ? handleSearch : setPickup}
              onFocus={() => openSearch('pickup')}
              autoFocus={activeSearchField === 'pickup'}
            />
            {pickup.length > 0 && !showSearchModal && (
              <TouchableOpacity onPress={() => setPickup('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
            {showSearchModal && activeSearchField === 'pickup' && searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputDivider} />

          {/* Destination Input */}
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="location" size={16} color={COLORS.error} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Where to?"
              placeholderTextColor={COLORS.gray}
              value={showSearchModal && activeSearchField === 'destination' ? searchQuery : destination}
              onChangeText={showSearchModal ? handleSearch : setDestination}
              onFocus={() => openSearch('destination')}
              autoFocus={activeSearchField === 'destination'}
            />
            {destination.length > 0 && !showSearchModal && (
              <TouchableOpacity onPress={() => setDestination('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
            {showSearchModal && activeSearchField === 'destination' && searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>

          {/* Connecting Line */}
          <View style={styles.connectingLine} />
        </View>

        {/* Search Results List - Only visible when expanded */}
        {showSearchModal ? (
          <View style={styles.searchResultsContainer}>
            <ScrollView style={styles.searchResultsList} keyboardShouldPersistTaps="always">
              {isSearching ? (
                <View style={styles.searchingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.searchingText}>Searching...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.searchResultItem}
                    onPress={() => selectLocation(item)}
                  >
                    <View style={styles.searchResultIcon}>
                      <Ionicons name={item.icon || 'location'} size={20} color={COLORS.darkGray} />
                    </View>
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultTitle}>{item.name}</Text>
                      <Text style={styles.searchResultSubtitle}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : searchQuery.length > 1 ? (
                <View style={styles.searchingContainer}>
                  <Text style={styles.searchingText}>No results found</Text>
                </View>
              ) : null}

              {/* Saved Places */}
              {!isSearching && searchQuery.length === 0 && (
                <View style={styles.savedPlacesList}>
                  <Text style={styles.sectionHeaderTitle}>Saved Places</Text>
                  <TouchableOpacity style={styles.searchResultItem} onPress={() => selectLocation({ name: 'Home', address: 'Grand Baie, Mauritius' })}>
                    <View style={[styles.searchResultIcon, { backgroundColor: COLORS.primary }]}>
                      <Ionicons name="home" size={18} color={COLORS.white} />
                    </View>
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultTitle}>Home</Text>
                      <Text style={styles.searchResultSubtitle}>Grand Baie, Mauritius</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.searchResultItem} onPress={() => selectLocation({ name: 'Work', address: 'Port Louis, Mauritius' })}>
                    <View style={[styles.searchResultIcon, { backgroundColor: COLORS.secondary }]}>
                      <Ionicons name="briefcase" size={18} color={COLORS.white} />
                    </View>
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultTitle}>Work</Text>
                      <Text style={styles.searchResultSubtitle}>Port Louis, Mauritius</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.closeSearchButton} onPress={closeSearch}>
                <Text style={styles.closeSearchText}>Close Search</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : (
          /* Saved Places Chips (Original) */
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.savedPlacesContainer}
            contentContainerStyle={styles.savedPlacesContent}
          >
            <TouchableOpacity style={styles.savedPlaceChip} activeOpacity={0.7} onPress={() => { setDestination('Home'); expandBottomSheet(); }}>
              <Ionicons name="home" size={16} color={COLORS.primary} />
              <Text style={styles.savedPlaceText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.savedPlaceChip} activeOpacity={0.7} onPress={() => { setDestination('Work'); expandBottomSheet(); }}>
              <Ionicons name="briefcase" size={16} color={COLORS.primary} />
              <Text style={styles.savedPlaceText}>Work</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.savedPlaceChip} activeOpacity={0.7}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <Text style={styles.savedPlaceText}>Favorites</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>

      {/* Animated Bottom Sheet */}
      {/* Animated Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: bottomSheetAnimation,
          },
        ]}
      >
        {/* Handle - Only this part is draggable */}
        <PanGestureHandler
          onGestureEvent={onGestureHandlerEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <View style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}>
            <View style={styles.bottomSheetHandle} />
          </View>
        </PanGestureHandler>

        {/* Content - Scrollable */}
        <ScrollView
          style={styles.bottomSheetContent}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Ride Types Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose a ride</Text>
            {destination.length > 0 && (
              <View style={styles.nearbyDriversBadge}>
                <View style={styles.nearbyDriversDot} />
                <Text style={styles.nearbyDriversText}>{nearbyDrivers.length} nearby</Text>
              </View>
            )}
          </View>

          {/* Ride Type Cards */}
          <View style={styles.rideTypesContainer}>
            {rideTypes.map(rideType => renderRideTypeCard(rideType))}
          </View>

          {/* Confirm Button */}
          {selectedRideType && destination.length > 0 && (
            <Animated.View
              style={{
                transform: [{ scale: buttonAnimation }],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: selectedRideType.color },
                ]}
                onPress={handleConfirmPickup}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>
                  Confirm {selectedRideType.name}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Payment Method */}
          {selectedRideType && (
            <TouchableOpacity style={styles.paymentMethod} activeOpacity={0.7}>
              <View style={styles.paymentMethodLeft}>
                <Ionicons name="card-outline" size={20} color={COLORS.darkGray} />
                <Text style={styles.paymentMethodText}>Cash</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}

          {/* Safety Info */}
          <View style={styles.safetyInfo}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.accent} />
            <Text style={styles.safetyInfoText}>
              All rides are insured and tracked for your safety
            </Text>
          </View>
        </ScrollView>
      </Animated.View>


      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={() => {
          mapRef.current?.animateToRegion(MAP_CENTER, 500);
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

UberStyleRideScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.object,
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  map: {
    width,
    height,
  },

  // Header
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
  },

  // Search Container
  searchContainer: {
    position: 'absolute',
    zIndex: 30, // Higher than bottom sheet (25)
    elevation: 30, // Ensure strictly higher elevation for Android
    overflow: 'hidden',
  },
  searchContainerExpanded: {
    // These are handled by animation
  },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    ...SHADOW_LARGE,
    elevation: 10,
  },
  searchCardExpanded: {
    borderRadius: 0,
    // Remove double padding - container handles paddingTop
    backgroundColor: COLORS.white,
    shadowOpacity: 0,
    elevation: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  inputIconContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.darkGray,
  },
  input: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.darkGray,
    fontWeight: '600',
    height: '100%',
  },
  inputDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 4,
    marginLeft: 40, // Align with text start
  },
  connectingLine: {
    position: 'absolute',
    left: 31, // Centered in icon container (padding + icon center)
    top: 38,
    bottom: 38,
    width: 2,
    backgroundColor: COLORS.lightGray,
    zIndex: -1,
  },

  // Search Results
  searchResultsContainer: {
    flex: 1,
    marginTop: 16,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightestGray,
  },
  searchResultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  searchingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  searchingText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: SIZES.sm,
  },

  // Saved Places List inside Search
  savedPlacesList: {
    marginTop: 20,
  },
  sectionHeaderTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 12,
  },

  closeSearchButton: {
    marginVertical: 20,
    alignItems: 'center',
    padding: 15,
  },
  closeSearchText: {
    color: COLORS.gray,
    fontSize: SIZES.md,
    fontWeight: '600',
  },

  // Saved Places Chips (Original)
  savedPlacesContainer: {
    marginTop: 12,
  },
  savedPlacesContent: {
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 4, // Space for shadow
  },
  savedPlaceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    ...SHADOW_SMALL,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  savedPlaceText: {
    fontSize: SIZES.sm,
    color: COLORS.darkGray,
    fontWeight: '600',
  },

  // Current Location Marker
  currentLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(74, 144, 226, 0.2)', // Primary color opacity
  },
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  // Driver Marker
  driverMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  driverIcon: {
    fontSize: 18,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOW_LARGE,
    elevation: 25,
    zIndex: 15, // Lower than search (20) but higher than map (0)
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  nearbyDriversBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.backgroundGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nearbyDriversDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  nearbyDriversText: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    fontWeight: '600',
  },

  // Ride Type Cards
  rideTypesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  rideTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...SHADOW_SMALL,
    marginBottom: 2, // Space for shadow
  },
  rideTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(74, 144, 226, 0.05)', // Primary color opacity
  },
  rideTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rideTypeIcon: {
    fontSize: 24,
  },
  rideTypeInfo: {
    flex: 1,
  },
  rideTypeName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  rideTypeNameSelected: {
    color: COLORS.primary,
  },
  rideTypeDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  rideTypeDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  rideTypeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rideTypeDetailText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  rideTypePriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    justifyContent: 'flex-end',
  },
  rideTypePrice: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  rideTypePriceSelected: {
    color: COLORS.primary,
  },
  rideTypePriceRange: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },

  // Confirm Button
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28, // SIZES.buttonRadius
    gap: 8,
    marginBottom: 16,
    ...SHADOW_MEDIUM,
    elevation: 8,
  },
  confirmButtonText: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Payment Method
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: SIZES.borderRadius,
    marginBottom: 16,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },

  // Safety Info
  safetyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)', // Light accent
    borderRadius: SIZES.borderRadius,
    marginBottom: 80, // Extra space at bottom
  },
  safetyInfoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Current Location Button
  currentLocationButton: {
    position: 'absolute',
    bottom: BOTTOM_SHEET_MIN_HEIGHT + 20, // Position above collapsed sheet
    right: SIZES.padding,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
    zIndex: 5, // Above map, below bottom sheet
  },
});

export default UberStyleRideScreen;
