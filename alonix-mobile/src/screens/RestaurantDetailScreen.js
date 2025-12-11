import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import { formatPrice, formatDistance } from '../utils/helpers';
import { openWhatsApp } from '../utils/linking';

const { width } = Dimensions.get('window');

const RestaurantDetailScreen = ({ route, navigation }) => {
    const { restaurant } = route.params || {};
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    if (!restaurant) {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.gray }}>Restaurant details not available</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                        <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                        {restaurant.photos && restaurant.photos.map((photo, index) => (
                            <Image
                                key={index}
                                source={{ uri: photo }}
                                style={styles.photo}
                            />
                        ))}
                    </ScrollView>

                    {/* Photo Indicators */}
                    <View style={styles.photoIndicators}>
                        {restaurant.photos && restaurant.photos.map((_, index) => (
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
                    <Text style={styles.name}>{restaurant.name}</Text>
                    <View style={styles.ratingRow}>
                        <View style={styles.stars}>{renderStars(restaurant.rating)}</View>
                        <Text style={styles.ratingText}>
                            {restaurant.rating} ({restaurant.reviewCount || 0} reviews)
                        </Text>
                        <Text style={styles.priceRange}>
                            {' • '}
                            {typeof restaurant.priceRange === 'string'
                                ? restaurant.priceRange
                                : (restaurant.priceRange?.min && restaurant.priceRange?.max
                                    ? `${restaurant.priceRange.currency || 'Rs'} ${restaurant.priceRange.min}-${restaurant.priceRange.max}`
                                    : '$$')}
                        </Text>
                    </View>

                    {/* Location */}
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={18} color={COLORS.gray} />
                        <Text style={styles.locationText}>
                            {typeof restaurant.location === 'string'
                                ? restaurant.location
                                : (restaurant.location?.address || restaurant.location?.name || 'Mauritius')}
                        </Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>{restaurant.description}</Text>

                    {/* Cuisine */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cuisine</Text>
                        <View style={styles.amenitiesGrid}>
                            {restaurant.cuisine && restaurant.cuisine.map((item, index) => (
                                <View key={index} style={styles.amenityItem}>
                                    <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
                                    <Text style={styles.amenityText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Map Placeholder */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.mapPlaceholder}>
                            <Ionicons name="map" size={48} color={COLORS.lightGray} />
                            <Text style={styles.mapPlaceholderText}>Restaurant Location</Text>
                            <Text style={styles.mapSubtext}>
                                {typeof restaurant.location === 'string'
                                    ? restaurant.location
                                    : (restaurant.location?.address || restaurant.location?.name || 'Mauritius')}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.directionsButton} activeOpacity={0.8}>
                            <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.directionsText}>Get Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Price Range</Text>
                    <Text style={styles.price}>
                        {typeof restaurant.priceRange === 'string'
                            ? restaurant.priceRange
                            : (restaurant.priceRange?.min && restaurant.priceRange?.max
                                ? `${restaurant.priceRange.currency || 'Rs'} ${restaurant.priceRange.min}-${restaurant.priceRange.max}`
                                : '$$')}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.bookButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        const message = `Hi, I would like to make a reservation at ${restaurant.name} for...`;
                        openWhatsApp(restaurant.whatsappNumber, message);
                    }}
                >
                    <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
                    <Text style={styles.bookButtonText}>Book Table</Text>
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
    description: {
        fontSize: SIZES.base,
        color: COLORS.darkGray,
        lineHeight: 22,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginBottom: 16,
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
    mapPlaceholder: {
        height: 200,
        borderRadius: 12,
        backgroundColor: COLORS.backgroundGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    mapPlaceholderText: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.gray,
        marginTop: 12,
    },
    mapSubtext: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 20,
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
    bottomBar: {
        position: 'absolute',
        bottom: 80, // Float above navigation bar (60px height + 10px bottom + 10px margin)
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.padding,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Glass effect
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass border
        borderRadius: 20,
        marginHorizontal: 16,
        ...SHADOW_LARGE,
        shadowColor: COLORS.darkGray,
        shadowOpacity: 0.15,
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    price: {
        fontSize: SIZES.xl,
        fontWeight: '700',
        color: COLORS.primary,
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

export default RestaurantDetailScreen;
