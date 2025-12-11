import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const LiveChallengeCard = ({ activity, onPress, onAction, isActionLoading }) => {
    const isLive = activity.status === 'live';
    const fadeAnim = useRef(new Animated.Value(0.4)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const participantCount = activity.currentParticipants || activity.participants?.length || 0;
    const participants = activity.participants || [];

    // Format stats
    const distanceLabel = activity.distance ? `${(activity.distance / 1000).toFixed(1)} km` : null;
    const typeLabel = activity.activityType
        ? activity.activityType.charAt(0).toUpperCase() + activity.activityType.slice(1)
        : 'Activity';

    useEffect(() => {
        if (isLive) {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                        Animated.timing(fadeAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(scaleAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                        Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                    ])
                ])
            ).start();
        }
    }, [isLive]);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.card}>
                {/* Background Image/Gradient */}
                <View style={styles.backgroundContainer}>
                    {activity.photos && activity.photos.length > 0 ? (
                        <Image source={{ uri: activity.photos[0] }} style={styles.backgroundImage} />
                    ) : (
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.primaryDark]}
                            style={styles.backgroundImage}
                        />
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
                        style={styles.gradientOverlay}
                    />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={[styles.badge, isLive ? styles.liveBadge : styles.upcomingBadge]}>
                            {isLive && (
                                <Animated.View
                                    style={[
                                        styles.liveDot,
                                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                                    ]}
                                />
                            )}
                            <Text style={[styles.badgeText, isLive ? styles.liveText : styles.upcomingText]}>
                                {isLive ? 'LIVE NOW' : 'UPCOMING'}
                            </Text>
                        </View>

                        <View style={styles.participantBadge}>
                            <Ionicons name="people" size={12} color={COLORS.white} />
                            <Text style={styles.participantCount}>{participantCount}</Text>
                        </View>
                    </View>

                    <View style={styles.mainInfo}>
                        <Text style={styles.title} numberOfLines={2}>{activity.title}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Ionicons name="fitness-outline" size={14} color={COLORS.lightGray} />
                                <Text style={styles.metaText}>{typeLabel}</Text>
                            </View>
                            {distanceLabel && (
                                <>
                                    <View style={styles.divider} />
                                    <View style={styles.metaItem}>
                                        <Ionicons name="navigate-outline" size={14} color={COLORS.lightGray} />
                                        <Text style={styles.metaText}>{distanceLabel}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onAction}
                        disabled={isActionLoading}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionGradient}
                        >
                            <Text style={styles.actionText}>
                                {isLive ? 'Join Live Tracking' : 'Start Session'}
                            </Text>
                            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginRight: 16,
        height: 220,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)', // Neutral Glass Border
        shadowColor: COLORS.darkGray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)', // Works on iOS
    },
    liveBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    upcomingBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        marginRight: 6,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    liveText: {
        color: '#EF4444',
    },
    upcomingText: {
        color: COLORS.white,
    },
    participantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    participantCount: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
    },
    mainInfo: {
        marginTop: 'auto',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        color: COLORS.lightGray,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    divider: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.lightGray,
        marginHorizontal: 8,
        opacity: 0.6,
    },
    actionButton: {
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOW_MEDIUM,
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    actionText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
        marginRight: 8,
    },
});

export default LiveChallengeCard;
