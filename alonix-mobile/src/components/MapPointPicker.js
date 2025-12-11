import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

import locationService from '../services/locationService';

const MapPointPicker = ({ initialLocation, onLocationSelect, onClose, title = 'Select Location' }) => {
    const [selectedLocation, setSelectedLocation] = useState(
        initialLocation || {
            latitude: -20.1609,
            longitude: 57.5012,
            address: '',
        }
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const mapRef = useRef(null);

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        // In a real app with API key, we would reverse geocode here too
        setSelectedLocation({
            latitude,
            longitude,
            address: selectedLocation.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
    };

    const handleConfirm = () => {
        onLocationSelect(selectedLocation);
        onClose();
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const results = await locationService.searchPlaces(searchQuery);

            if (results && results.length > 0) {
                const firstResult = results[0];
                // Get details to get coordinates (searchPlaces might not return coords depending on API)
                // If searchPlaces returns predictions without coords, we need getPlaceDetails.
                // Assuming searchPlaces or a helper gets us coords, or we do a follow up.
                // Let's assume for this step we might need to fetch details if coords are missing.

                // Correction: locationService.searchPlaces returns predictions. 
                // We need to fetch details for the first prediction to get lat/lng.
                const details = await locationService.getPlaceDetails(firstResult.placeId);

                if (details && details.location) {
                    const newLocation = {
                        latitude: details.location.latitude,
                        longitude: details.location.longitude,
                        address: details.address || details.name,
                    };
                    setSelectedLocation(newLocation);

                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: newLocation.latitude,
                            longitude: newLocation.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }, 1000);
                    }
                }
            } else {
                // Fallback/Mock for testing if API fails or returns nothing
                console.log('No results found, using fallback search/mock');
                const newLocation = {
                    latitude: -20.1609,
                    longitude: 57.5012,
                    address: searchQuery,
                };
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: newLocation.latitude,
                        longitude: newLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={24} color={COLORS.darkGray} />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.gray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a location..."
                        placeholderTextColor={COLORS.gray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searching && <ActivityIndicator size="small" color={COLORS.primary} />}
                </View>
            </View>

            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                onPress={handleMapPress}
            >
                <Marker
                    coordinate={{
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                    }}
                    draggable
                    onDragEnd={(e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setSelectedLocation({
                            latitude,
                            longitude,
                            address: selectedLocation.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                        });
                    }}
                >
                    <View style={styles.customMarker}>
                        <Ionicons name="location" size={40} color={COLORS.error} />
                    </View>
                </Marker>
            </MapView>

            {/* Location Info */}
            <View style={styles.locationInfo}>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                    <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>Selected Location</Text>
                        <Text style={styles.infoValue}>
                            {selectedLocation.address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
                        </Text>
                    </View>
                </View>

                <TextInput
                    style={styles.addressInput}
                    placeholder="Add a description (e.g., 'Parking lot near beach')"
                    placeholderTextColor={COLORS.gray}
                    value={selectedLocation.address}
                    onChangeText={(text) => setSelectedLocation({ ...selectedLocation, address: text })}
                />
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
            >
                <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>

            {/* Helper Text */}
            <View style={styles.helperContainer}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.gray} />
                <Text style={styles.helperText}>
                    Tap anywhere on the map or drag the marker to select a location
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.lightestGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: SIZES.xl,
        fontWeight: '700',
        color: COLORS.darkGray,
    },
    placeholder: {
        width: 40,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightestGray,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.base,
        color: COLORS.darkGray,
    },
    map: {
        flex: 1,
    },
    customMarker: {
        alignItems: 'center',
    },
    locationInfo: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: SIZES.base,
        fontWeight: '600',
        color: COLORS.darkGray,
    },
    addressInput: {
        backgroundColor: COLORS.lightestGray,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: SIZES.base,
        color: COLORS.darkGray,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        marginHorizontal: 20,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    confirmButtonText: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.white,
    },
    helperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 6,
    },
    helperText: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
        textAlign: 'center',
    },
});

export default MapPointPicker;
