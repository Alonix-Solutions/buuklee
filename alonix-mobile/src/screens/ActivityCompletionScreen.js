import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM } from '../utils/shadows';
import { formatDistance, formatDuration, formatPace } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';

const ActivityCompletionScreen = ({ route, navigation }) => {
    const { activityId, sessionId } = route.params || {};
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState(null);
    const [myStats, setMyStats] = useState(null);
    const [rating, setRating] = useState(0);

    const scaleAnim = new Animated.Value(0);

    useEffect(() => {
        loadResults();
        // Celebration animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, []);

    const loadResults = async () => {
        try {
            setLoading(true);
            const sessionResults = await activityService.getSessionResults(sessionId || activityId);
            setResults(sessionResults);

            // Find my stats
            const userId = user._id || user.id;
            const myData = sessionResults.participants?.find(
                p => (p.userId?._id || p.userId) === userId
            );
            setMyStats(myData);
        } catch (error) {
            console.error('Load results error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            const message = `🎉 Activity Complete!

${results?.activityTitle || 'Activity'}

My Stats:
📏 Distance: ${formatDistance(myStats?.stats?.totalDistance || 0)}
⏱️ Time: ${formatDuration(myStats?.stats?.totalTime || 0)}
🏃 Pace: ${formatPace(myStats?.stats?.averagePace || 0)}/km
🔥 Calories: ${myStats?.stats?.calories || 0} kcal

Rank: ${myStats?.rank || '-'} / ${results?.participants?.length || 0}

#Alonix #FitnessChallenge`;

            await Share.share({ message });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleRating = async (stars) => {
        setRating(stars);
        try {
            await activityService.rateActivity(activityId, stars);
        } catch (error) {
            console.error('Rating error:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading results...</Text>
            </View>
        );
    }

    const getRankColor = (rank) => {
        if (rank === 1) return COLORS.warning; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return COLORS.primary;
    };

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '🏃';
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View
                    style={[
                        styles.header,
                        { transform: [{ scale: scaleAnim }] }
                    ]}
                >
                    <Text style={styles.celebrationEmoji}>🎉</Text>
                    <Text style={styles.title}>Activity Complete!</Text>
                    <Text style={styles.subtitle}>
                        {results?.activityTitle || 'Great job!'}
                    </Text>
                </Animated.View>

                {/* Rank Badge */}
                {myStats?.rank && (
                    <View style={[styles.rankBadge, { borderColor: getRankColor(myStats.rank) }]}>
                        <Text style={styles.rankEmoji}>{getRankEmoji(myStats.rank)}</Text>
                        <Text style={[styles.rankText, { color: getRankColor(myStats.rank) }]}>
                            {myStats.rank === 1 ? '1st Place!' :
                                myStats.rank === 2 ? '2nd Place!' :
                                    myStats.rank === 3 ? '3rd Place!' :
                                        `${myStats.rank}th Place`}
                        </Text>
                        <Text style={styles.rankSubtext}>
                            out of {results?.participants?.length || 0} participants
                        </Text>
                    </View>
                )}

                {/* Stats Grid */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Your Performance</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Ionicons name="fitness" size={32} color={COLORS.primary} />
                            <Text style={styles.statValue}>
                                {formatDistance(myStats?.stats?.totalDistance || 0)}
                            </Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Ionicons name="time" size={32} color={COLORS.secondary} />
                            <Text style={styles.statValue}>
                                {formatDuration(myStats?.stats?.totalTime || 0)}
                            </Text>
                            <Text style={styles.statLabel}>Time</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Ionicons name="speedometer" size={32} color={COLORS.accent} />
                            <Text style={styles.statValue}>
                                {formatPace(myStats?.stats?.averagePace || 0)}
                            </Text>
                            <Text style={styles.statLabel}>Avg Pace</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Ionicons name="flame" size={32} color={COLORS.error} />
                            <Text style={styles.statValue}>
                                {String(myStats?.stats?.calories || 0)}
                            </Text>
                            <Text style={styles.statLabel}>Calories</Text>
                        </View>
                    </View>
                </View>

                {/* Additional Stats */}
                {myStats?.stats?.topSpeed && (
                    <View style={styles.additionalStats}>
                        <View style={styles.additionalStatRow}>
                            <Text style={styles.additionalStatLabel}>Top Speed</Text>
                            <Text style={styles.additionalStatValue}>
                                {String(((myStats.stats.topSpeed || 0) * 3.6).toFixed(1))} km/h
                            </Text>
                        </View>
                        {myStats?.stats?.steps && (
                            <View style={styles.additionalStatRow}>
                                <Text style={styles.additionalStatLabel}>Steps</Text>
                                <Text style={styles.additionalStatValue}>
                                    {String(myStats.stats.steps || 0).toLocaleString()}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Rate Activity */}
                <View style={styles.ratingSection}>
                    <Text style={styles.sectionTitle}>How was the activity?</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => handleRating(star)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={40}
                                    color={star <= rating ? COLORS.warning : COLORS.lightGray}
                                    style={styles.star}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {rating > 0 && (
                        <Text style={styles.ratingThankYou}>Thank you for your feedback!</Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={handleShare}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="share-social" size={20} color={COLORS.primary} />
                        <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>
                            Share Results
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton]}
                        onPress={() => navigation.navigate('ActivityResults', {
                            activityId,
                            sessionId: sessionId || activityId
                        })}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trophy" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>View Full Results</Text>
                    </TouchableOpacity>
                </View>

                {/* Done Button */}
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.navigate('Home')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: SIZES.base,
        color: COLORS.gray,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: 60,
        paddingHorizontal: SIZES.padding,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    celebrationEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: SIZES.lg,
        color: COLORS.gray,
        textAlign: 'center',
    },
    rankBadge: {
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 24,
        paddingHorizontal: 32,
        borderRadius: 20,
        borderWidth: 3,
        marginBottom: 32,
        ...SHADOW_MEDIUM,
    },
    rankEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    rankText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    rankSubtext: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    statsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    statCard: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    statCardInner: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        ...SHADOW_SMALL,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginTop: 12,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    additionalStats: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        ...SHADOW_SMALL,
    },
    additionalStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,

        borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    },
    additionalStatLabel: {
        fontSize: SIZES.base,
        color: COLORS.gray,
    },
    additionalStatValue: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.darkGray,
    },
    ratingSection: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        ...SHADOW_SMALL,
    },
    stars: {
        flexDirection: 'row',
        marginTop: 16,
    },
    star: {
        marginHorizontal: 4,
    },
    ratingThankYou: {
        marginTop: 16,
        fontSize: SIZES.sm,
        color: COLORS.success,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    actionButtonText: {
        fontSize: SIZES.base,
        fontWeight: '700',
        color: COLORS.white,
    },
    doneButton: {
        backgroundColor: COLORS.lightestGray,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: SIZES.base,
        fontWeight: '600',
        color: COLORS.gray,
    },
});

export default ActivityCompletionScreen;
