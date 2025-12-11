import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { formatDistance, formatDuration, formatPace } from '../utils/helpers';
import activityService from '../services/activityService';

const ActivityResultsScreen = ({ route, navigation }) => {
    const { activityId, sessionId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState(null);
    const [sortCriteria, setSortCriteria] = useState('rank'); // rank | time | distance

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            setLoading(true);
            const sessionResults = await activityService.getSessionResults(sessionId || activityId);
            setResults(sessionResults);
        } catch (error) {
            console.error('Load results error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSortedParticipants = () => {
        if (!results?.participants) return [];

        const participants = [...results.participants];

        switch (sortCriteria) {
            case 'time':
                return participants.sort((a, b) =>
                    (a.stats?.totalTime || Infinity) - (b.stats?.totalTime || Infinity)
                );
            case 'distance':
                return participants.sort((a, b) =>
                    (b.stats?.totalDistance || 0) - (a.stats?.totalDistance || 0)
                );
            default:
                return participants.sort((a, b) => (a.rank || 999) - (b.rank || 999));
        }
    };

    const handleShare = async () => {
        try {
            const top3 = getSortedParticipants().slice(0, 3);
            const message = `🏆 ${results?.activityTitle || 'Activity'} Results

🥇 1st: ${top3[0]?.userName || 'TBD'}
${formatDistance(top3[0]?.stats?.totalDistance || 0)} • ${formatDuration(top3[0]?.stats?.totalTime || 0)}

${top3[1] ? `🥈 2nd: ${top3[1].userName}
${formatDistance(top3[1].stats?.totalDistance || 0)} • ${formatDuration(top3[1].stats?.totalTime || 0)}` : ''}

${top3[2] ? `🥉 3rd: ${top3[2].userName}
${formatDistance(top3[2].stats?.totalDistance || 0)} • ${formatDuration(top3[2].stats?.totalTime || 0)}` : ''}

Total Participants: ${results?.participants?.length || 0}

#Alonix #FitnessChallenge`;

            await Share.share({ message });
        } catch (error) {
            console.error('Share error:', error);
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

    const sortedParticipants = getSortedParticipants();
    const topThree = sortedParticipants.slice(0, 3);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activity Results</Text>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    activeOpacity={0.7}
                >
                    <Ionicons name="share-social" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Activity Info */}
                <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{results?.activityTitle || 'Activity'}</Text>
                    <Text style={styles.activitySubtitle}>
                        {new Date(results?.endTime).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </Text>
                    <Text style={styles.participantCount}>
                        {String(results?.participants?.length || 0)} participants completed
                    </Text>
                </View>

                {/* Podium */}
                {topThree.length >= 1 && (
                    <View style={styles.podiumSection}>
                        <Text style={styles.sectionTitle}>🏆 Top Performers</Text>
                        <View style={styles.podium}>
                            {/* 2nd Place */}
                            {topThree[1] && (
                                <View style={[styles.podiumPlace, styles.secondPlace]}>
                                    <View style={[styles.podiumRank, styles.silverRank]}>
                                        <Text style={styles.podiumRankText}>2</Text>
                                    </View>
                                    <Image
                                        source={{
                                            uri: topThree[1].userId?.profilePhoto || 'https://via.placeholder.com/80'
                                        }}
                                        style={styles.podiumPhoto}
                                    />
                                    <Text style={styles.podiumName} numberOfLines={1}>
                                        {topThree[1].userName || 'Participant'}
                                    </Text>
                                    <Text style={styles.podiumStat}>
                                        {formatDistance(topThree[1].stats?.totalDistance || 0)}
                                    </Text>
                                    <Text style={styles.podiumTime}>
                                        {formatDuration(topThree[1].stats?.totalTime || 0)}
                                    </Text>
                                </View>
                            )}

                            {/* 1st Place */}
                            <View style={[styles.podiumPlace, styles.firstPlace]}>
                                <View style={styles.crown}>
                                    <Text style={styles.crownEmoji}>👑</Text>
                                </View>
                                <View style={[styles.podiumRank, styles.goldRank]}>
                                    <Text style={styles.podiumRankText}>1</Text>
                                </View>
                                <Image
                                    source={{
                                        uri: topThree[0]?.userId?.profilePhoto || 'https://via.placeholder.com/80'
                                    }}
                                    style={[styles.podiumPhoto, styles.winnerPhoto]}
                                />
                                <Text style={styles.podiumName} numberOfLines={1}>
                                    {topThree[0]?.userName || 'Winner'}
                                </Text>
                                <Text style={styles.podiumStat}>
                                    {formatDistance(topThree[0]?.stats?.totalDistance || 0)}
                                </Text>
                                <Text style={styles.podiumTime}>
                                    {formatDuration(topThree[0]?.stats?.totalTime || 0)}
                                </Text>
                            </View>

                            {/* 3rd Place */}
                            {topThree[2] && (
                                <View style={[styles.podiumPlace, styles.thirdPlace]}>
                                    <View style={[styles.podiumRank, styles.bronzeRank]}>
                                        <Text style={styles.podiumRankText}>3</Text>
                                    </View>
                                    <Image
                                        source={{
                                            uri: topThree[2].userId?.profilePhoto || 'https://via.placeholder.com/80'
                                        }}
                                        style={styles.podiumPhoto}
                                    />
                                    <Text style={styles.podiumName} numberOfLines={1}>
                                        {topThree[2].userName || 'Participant'}
                                    </Text>
                                    <Text style={styles.podiumStat}>
                                        {formatDistance(topThree[2].stats?.totalDistance || 0)}
                                    </Text>
                                    <Text style={styles.podiumTime}>
                                        {formatDuration(topThree[2].stats?.totalTime || 0)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Full Leaderboard */}
                <View style={styles.leaderboardSection}>
                    <View style={styles.leaderboardHeader}>
                        <Text style={styles.sectionTitle}>Full Leaderboard</Text>
                        <View style={styles.sortButtons}>
                            <TouchableOpacity
                                style={[styles.sortButton, sortCriteria === 'rank' && styles.activeSortButton]}
                                onPress={() => setSortCriteria('rank')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.sortButtonText, sortCriteria === 'rank' && styles.activeSortButtonText]}>
                                    Rank
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sortButton, sortCriteria === 'time' && styles.activeSortButton]}
                                onPress={() => setSortCriteria('time')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.sortButtonText, sortCriteria === 'time' && styles.activeSortButtonText]}>
                                    Time
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sortButton, sortCriteria === 'distance' && styles.activeSortButton]}
                                onPress={() => setSortCriteria('distance')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.sortButtonText, sortCriteria === 'distance' && styles.activeSortButtonText]}>
                                    Distance
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {sortedParticipants.map((participant, index) => (
                        <View key={participant.userId?._id || index} style={styles.leaderboardRow}>
                            <View style={styles.leaderboardRank}>
                                <Text style={styles.leaderboardRankText}>{String(index + 1)}</Text>
                            </View>
                            <Image
                                source={{
                                    uri: participant.userId?.profilePhoto || 'https://via.placeholder.com/40'
                                }}
                                style={styles.leaderboardPhoto}
                            />
                            <View style={styles.leaderboardInfo}>
                                <Text style={styles.leaderboardName} numberOfLines={1}>
                                    {participant.userName || 'Participant'}
                                </Text>
                                <View style={styles.leaderboardStats}>
                                    <Text style={styles.leaderboardStat}>
                                        {formatDistance(participant.stats?.totalDistance || 0)}
                                    </Text>
                                    <Text style={styles.leaderboardDot}>•</Text>
                                    <Text style={styles.leaderboardStat}>
                                        {formatDuration(participant.stats?.totalTime || 0)}
                                    </Text>
                                </View>
                            </View>
                            {index < 3 && (
                                <Text style={styles.medal}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,

        borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: SIZES.xl,
        fontWeight: '700',
        color: COLORS.darkGray,
    },
    shareButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 24,
    },
    activityInfo: {
        alignItems: 'center',
        marginBottom: 32,
    },
    activityTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginBottom: 8,
        textAlign: 'center',
    },
    activitySubtitle: {
        fontSize: SIZES.base,
        color: COLORS.gray,
        marginBottom: 12,
    },
    participantCount: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    podiumSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginBottom: 20,
    },
    podium: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
    },
    podiumPlace: {
        alignItems: 'center',
        flex: 1,
    },
    firstPlace: {
        paddingBottom: 0,
    },
    secondPlace: {
        paddingBottom: 20,
    },
    thirdPlace: {
        paddingBottom: 40,
    },
    crown: {
        position: 'absolute',
        top: -30,
        zIndex: 10,
    },
    crownEmoji: {
        fontSize: 32,
    },
    podiumRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    goldRank: {
        backgroundColor: COLORS.warning,
    },
    silverRank: {
        backgroundColor: '#C0C0C0',
    },
    bronzeRank: {
        backgroundColor: '#CD7F32',
    },
    podiumRankText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
    podiumPhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: COLORS.white,
        marginBottom: 8,
    },
    winnerPhoto: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: COLORS.warning,
    },
    podiumName: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: 4,
        textAlign: 'center',
    },
    podiumStat: {
        fontSize: SIZES.base,
        fontWeight: '700',
        color: COLORS.primary,
    },
    podiumTime: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
    },
    leaderboardSection: {
        marginBottom: 24,
    },
    leaderboardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sortButtons: {
        flexDirection: 'row',
        gap: 6,
    },
    sortButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: COLORS.lightestGray,
    },
    activeSortButton: {
        backgroundColor: COLORS.primary,
    },
    sortButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.gray,
    },
    activeSortButtonText: {
        color: COLORS.white,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        ...SHADOW_SMALL,
    },
    leaderboardRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.lightestGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    leaderboardRankText: {
        fontSize: SIZES.base,
        fontWeight: '700',
        color: COLORS.darkGray,
    },
    leaderboardPhoto: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    leaderboardInfo: {
        flex: 1,
    },
    leaderboardName: {
        fontSize: SIZES.base,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    leaderboardStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leaderboardStat: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    leaderboardDot: {
        marginHorizontal: 6,
        color: COLORS.lightGray,
    },
    medal: {
        fontSize: 24,
        marginLeft: 8,
    },
});



export default ActivityResultsScreen;
