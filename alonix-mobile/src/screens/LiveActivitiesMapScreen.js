import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    ActivityIndicator,
    PanResponder,
} from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import socketService from '../services/socketService';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

// Mauritius coordinates
const MAURITIUS_CENTER = {
    latitude: -20.1609,
    longitude: 57.5012,
    latitudeDelta: 0.8,
    longitudeDelta: 0.8,
};

const LiveActivitiesMapScreen = ({ navigation }) => {
    const { user } = useAuth();
    const mapRef = useRef(null);

    // State
    const [liveActivities, setLiveActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapType, setMapType] = useState('standard');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        running: true,
        cycling: true,
        hiking: true,
        swimming: true,
    });
    const [userLocation, setUserLocation] = useState(null);
    const [participants, setParticipants] = useState({});

    // Animations
    const slideAnim = useRef(new Animated.Value(height)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Sheet positions
    const SHEET_POSITIONS = {
        CLOSED: height,
        HALF: height * 0.5,
        FULL: height * 0.15,
    };

    // PanResponder for draggable sheet
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Respond to any vertical movement
                return Math.abs(gestureState.dy) > 2;
            },
            onPanResponderGrant: () => {
                slideAnim.setOffset(slideAnim._value);
                slideAnim.setValue(0);
            },
            onPanResponderMove: Animated.event(
                [null, { dy: slideAnim }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                slideAnim.flattenOffset();
                const currentPosition = slideAnim._value;
                const velocity = gestureState.vy;

                let targetPosition;

                // Determine target based on velocity and position
                if (velocity > 0.5) {
                    // Fast swipe down
                    if (currentPosition < SHEET_POSITIONS.HALF) {
                        targetPosition = SHEET_POSITIONS.HALF;
                    } else {
                        targetPosition = SHEET_POSITIONS.CLOSED;
                    }
                } else if (velocity < -0.5) {
                    // Fast swipe up
                    if (currentPosition > SHEET_POSITIONS.HALF) {
                        targetPosition = SHEET_POSITIONS.HALF;
                    } else {
                        targetPosition = SHEET_POSITIONS.FULL;
                    }
                } else {
                    // Slow drag - snap to nearest
                    const distances = {
                        FULL: Math.abs(currentPosition - SHEET_POSITIONS.FULL),
                        HALF: Math.abs(currentPosition - SHEET_POSITIONS.HALF),
                        CLOSED: Math.abs(currentPosition - SHEET_POSITIONS.CLOSED),
                    };
                    const nearest = Object.keys(distances).reduce((a, b) =>
                        distances[a] < distances[b] ? a : b
                    );
                    targetPosition = SHEET_POSITIONS[nearest];
                }

                // Animate to target
                Animated.spring(slideAnim, {
                    toValue: targetPosition,
                    useNativeDriver: false,
                    tension: 50,
                    friction: 8,
                }).start(() => {
                    // Close sheet if swiped to CLOSED position
                    if (targetPosition === SHEET_POSITIONS.CLOSED) {
                        setSelectedActivity(null);
                    }
                });
            },
        })
    ).current;

    useEffect(() => {
        initializeMap();
        startPulseAnimation();

        return () => {
            socketService.disconnect();
        };
    }, []);

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const initializeMap = async () => {
        try {
            setLoading(true);

            // Connect to socket for real-time updates
            const token = await require('../services/api').default.getToken();
            if (token) {
                await socketService.connect(token);
            }

            // Load live activities
            await loadLiveActivities();

            // Setup real-time listeners
            setupSocketListeners();

            setLoading(false);
        } catch (error) {
            console.error('Initialize map error:', error);
            setLoading(false);
        }
    };

    const loadLiveActivities = async () => {
        try {
            // Get all active/live activities
            const response = await activityService.getActivities({
                status: 'active',
                limit: 50,
            });

            const activities = response.activities || [];

            // Filter activities that are happening now
            const now = moment();
            const liveNow = activities.filter(activity => {
                const startTime = moment(activity.startDate || activity.date);
                const endTime = activity.endDate ? moment(activity.endDate) : startTime.clone().add(4, 'hours');
                return now.isBetween(startTime, endTime);
            });

            setLiveActivities(liveNow);

            // Join all activity rooms for real-time updates
            liveNow.forEach(activity => {
                socketService.joinActivity(activity._id, user?._id || user?.id);
            });

        } catch (error) {
            console.error('Load live activities error:', error);
        }
    };

    const setupSocketListeners = () => {
        // Listen for participant location updates
        socketService.on('participant:location', (data) => {
            setParticipants(prev => ({
                ...prev,
                [data.userId]: {
                    ...data,
                    timestamp: Date.now(),
                },
            }));
        });

        // Listen for activity updates
        socketService.on('activity:update', (data) => {
            setLiveActivities(prev =>
                prev.map(activity =>
                    activity._id === data.activityId
                        ? { ...activity, ...data.updates }
                        : activity
                )
            );
        });

        // Listen for new participants
        socketService.on('participant:joined', (data) => {
            console.log('New participant joined:', data);
        });
    };

    const handleMarkerPress = (activity) => {
        setSelectedActivity(activity);

        // Animate bottom sheet to HALF position
        Animated.spring(slideAnim, {
            toValue: SHEET_POSITIONS.HALF,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
        }).start();

        // Center map on activity
        if (activity.meetingPoint?.coordinates) {
            mapRef.current?.animateToRegion({
                latitude: activity.meetingPoint.coordinates[1],
                longitude: activity.meetingPoint.coordinates[0],
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }
    };

    const closeBottomSheet = () => {
        Animated.timing(slideAnim, {
            toValue: SHEET_POSITIONS.CLOSED,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setSelectedActivity(null);
        });
    };

    const getActivityColor = (type) => {
        const colors = {
            running: COLORS.running,
            cycling: COLORS.cycling,
            hiking: COLORS.hiking,
            swimming: COLORS.swimming,
            gym: COLORS.secondary,
            mixed: COLORS.primary,
        };
        return colors[type] || COLORS.primary;
    };

    const getActivityIcon = (type) => {
        const icons = {
            running: 'footsteps',
            cycling: 'bicycle',
            hiking: 'trail-sign',
            swimming: 'water',
            gym: 'barbell',
            mixed: 'fitness',
        };
        return icons[type] || 'location';
    };

    const toggleFilter = (type) => {
        setActiveFilters(prev => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const filteredActivities = liveActivities.filter(
        activity => activeFilters[activity.activityType]
    );

    const renderMarker = (activity) => {
        if (!activity.meetingPoint?.coordinates) return null;

        const color = getActivityColor(activity.activityType);
        const icon = getActivityIcon(activity.activityType);
        const participantCount = activity.participants?.length || 0;

        return (
            <Marker
                key={activity._id}
                coordinate={{
                    latitude: activity.meetingPoint.coordinates[1],
                    longitude: activity.meetingPoint.coordinates[0],
                }}
                onPress={() => handleMarkerPress(activity)}
            >
                <Animated.View
                    style={[
                        styles.markerContainer,
                        {
                            transform: [
                                {
                                    scale: selectedActivity?._id === activity._id ? 1.2 : pulseAnim,
                                },
                            ],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[color, color + 'CC']}
                        style={styles.markerGradient}
                    >
                        <Ionicons name={icon} size={20} color={COLORS.white} />
                        {participantCount > 0 && (
                            <View style={styles.participantBadge}>
                                <Text style={styles.participantCount}>{participantCount}</Text>
                            </View>
                        )}
                    </LinearGradient>

                    {/* Pulse ring */}
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            {
                                backgroundColor: color + '30',
                                transform: [{ scale: pulseAnim }],
                            },
                        ]}
                    />
                </Animated.View>
            </Marker>
        );
    };

    const renderParticipantMarkers = () => {
        return Object.entries(participants).map(([userId, data]) => {
            if (!data.location) return null;

            return (
                <Marker
                    key={userId}
                    coordinate={{
                        latitude: data.location.latitude,
                        longitude: data.location.longitude,
                    }}
                >
                    <View style={styles.participantMarker}>
                        <View style={styles.participantDot} />
                    </View>
                </Marker>
            );
        });
    };

    const renderBottomSheet = () => {
        if (!selectedActivity) return null;

        const color = getActivityColor(selectedActivity.activityType);
        const icon = getActivityIcon(selectedActivity.activityType);
        const participantCount = selectedActivity.participants?.length || 0;
        const startTime = moment(selectedActivity.startDate || selectedActivity.date);

        return (
            <Animated.View
                style={[
                    styles.bottomSheet,
                    {
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                {/* Draggable Handle */}
                <View style={styles.handleContainer}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.dragHint}>Drag to expand or close</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.sheetHeader}>
                        <LinearGradient
                            colors={[color, color + 'CC']}
                            style={styles.sheetIconContainer}
                        >
                            <Ionicons name={icon} size={32} color={COLORS.white} />
                        </LinearGradient>

                        <View style={styles.sheetHeaderText}>
                            <Text style={styles.sheetTitle} numberOfLines={2}>
                                {selectedActivity.title}
                            </Text>
                            <Text style={styles.sheetSubtitle}>
                                Started {startTime.fromNow()}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeBottomSheet}
                        >
                            <Ionicons name="close" size={24} color={COLORS.darkGray} />
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <StatItem
                            icon="people"
                            label="Participants"
                            value={participantCount}
                            color={color}
                        />
                        <StatItem
                            icon="location"
                            label="Distance"
                            value={selectedActivity.distance ? `${selectedActivity.distance} km` : 'N/A'}
                            color={color}
                        />
                        <StatItem
                            icon="time"
                            label="Duration"
                            value={selectedActivity.duration ? `${selectedActivity.duration} min` : 'N/A'}
                            color={color}
                        />
                    </View>

                    {/* Description */}
                    {selectedActivity.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.description}>
                                {selectedActivity.description}
                            </Text>
                        </View>
                    )}

                    {/* Organizer */}
                    {selectedActivity.organizer && (
                        <View style={styles.organizerSection}>
                            <Text style={styles.sectionTitle}>Organizer</Text>
                            <View style={styles.organizerCard}>
                                <View style={styles.organizerAvatar}>
                                    <Ionicons name="person" size={20} color={COLORS.primary} />
                                </View>
                                <Text style={styles.organizerName}>
                                    {selectedActivity.organizer.name || 'Unknown'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => {
                                closeBottomSheet();
                                navigation.navigate('ChallengeDetail', {
                                    challengeId: selectedActivity._id,
                                });
                            }}
                        >
                            <LinearGradient
                                colors={[color, color + 'CC']}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>View Details</Text>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => {
                                closeBottomSheet();
                                navigation.navigate('LiveTracking', {
                                    activityId: selectedActivity._id,
                                });
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>Track Live</Text>
                            <Ionicons name="navigate" size={20} color={color} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading live activities...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={MAURITIUS_CENTER}
                mapType={mapType}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass
                showsScale
            >
                {/* Activity markers */}
                {filteredActivities.map(renderMarker)}

                {/* Participant markers */}
                {renderParticipantMarkers()}
            </MapView>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Live Activities</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredActivities.length} happening now
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.mapTypeButton}
                    onPress={() =>
                        setMapType(prev => (prev === 'standard' ? 'satellite' : 'standard'))
                    }
                >
                    <Ionicons name="layers" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
            >
                <FilterPill
                    icon="footsteps"
                    label="Running"
                    active={activeFilters.running}
                    color={COLORS.running}
                    onPress={() => toggleFilter('running')}
                />
                <FilterPill
                    icon="bicycle"
                    label="Cycling"
                    active={activeFilters.cycling}
                    color={COLORS.cycling}
                    onPress={() => toggleFilter('cycling')}
                />
                <FilterPill
                    icon="trail-sign"
                    label="Hiking"
                    active={activeFilters.hiking}
                    color={COLORS.hiking}
                    onPress={() => toggleFilter('hiking')}
                />
                <FilterPill
                    icon="water"
                    label="Swimming"
                    active={activeFilters.swimming}
                    color={COLORS.swimming}
                    onPress={() => toggleFilter('swimming')}
                />
            </ScrollView>

            {/* My Location Button */}
            <TouchableOpacity
                style={styles.myLocationButton}
                onPress={() => {
                    mapRef.current?.animateToRegion(MAURITIUS_CENTER, 1000);
                }}
            >
                <Ionicons name="locate" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Bottom Sheet */}
            {renderBottomSheet()}
        </View>
    );
};

const StatItem = ({ icon, label, value, color }) => (
    <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const FilterPill = ({ icon, label, active, color, onPress }) => (
    <TouchableOpacity
        style={[
            styles.filterPill,
            active && { backgroundColor: color + '20', borderColor: color },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons
            name={icon}
            size={16}
            color={active ? color : COLORS.gray}
        />
        <Text style={[styles.filterLabel, active && { color }]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundGray,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    loadingText: {
        marginTop: 16,
        fontSize: SIZES.md,
        color: COLORS.gray,
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOW_MEDIUM,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    headerCenter: {
        flex: 1,
        marginHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 22,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        ...SHADOW_MEDIUM,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    headerTitle: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.darkGray,
    },
    headerSubtitle: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        marginTop: 2,
    },
    mapTypeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOW_MEDIUM,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    filterContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 130 : 120,
        left: 0,
        right: 0,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        gap: 8,
        ...SHADOW_SMALL,
    },
    filterLabel: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.gray,
    },
    myLocationButton: {
        position: 'absolute',
        bottom: 120,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOW_MEDIUM,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
        shadowColor: COLORS.darkGray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    participantBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    participantCount: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
    },
    pulseRing: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        opacity: 0.5,
    },
    participantMarker: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    participantDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        paddingBottom: 40,
        maxHeight: height * 0.7,
        ...SHADOW_MEDIUM,
    },
    handleContainer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.lightGray,
        borderRadius: 2,
    },
    dragHint: {
        fontSize: 10,
        color: COLORS.gray,
        marginTop: 4,
        fontWeight: '500',
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sheetIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sheetHeaderText: {
        flex: 1,
    },
    sheetTitle: {
        fontSize: SIZES.xl,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    sheetSubtitle: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.lightestGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGray,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
        marginBottom: 4,
    },
    statValue: {
        fontSize: SIZES.md,
        fontWeight: '700',
        color: COLORS.darkGray,
    },
    descriptionSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginBottom: 12,
    },
    description: {
        fontSize: SIZES.base,
        color: COLORS.gray,
        lineHeight: 22,
    },
    organizerSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    organizerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGray,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    organizerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    organizerName: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.darkGray,
    },
    actionsSection: {
        paddingHorizontal: 20,
        gap: 12,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOW_MEDIUM,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    buttonText: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.white,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.darkGray,
    },
});

import withTabBarToggle from '../components/withTabBarToggle';
export default withTabBarToggle(LiveActivitiesMapScreen);
