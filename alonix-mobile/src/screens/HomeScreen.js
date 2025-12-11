import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import ChallengeCard from '../components/ChallengeCard';
import ClubCard from '../components/ClubCard';
import LiveChallengeCard from '../components/LiveChallengeCard';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import clubService from '../services/clubService';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [liveActivity, setLiveActivity] = useState(null);
  const [organizerActivities, setOrganizerActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      const userId = user?._id || user?.id;

      const [activitiesResult, clubsResult, liveResult, myUpcoming, myLive] = await Promise.all([
        activityService.getActivities({ status: 'upcoming' }),
        clubService.getClubs(),
        activityService.getActivities({ status: 'live' }),
        userId ? activityService.getUserActivities(userId, 'organizer', 'upcoming') : Promise.resolve([]),
        userId ? activityService.getUserActivities(userId, 'organizer', 'live') : Promise.resolve([]),
      ]);
      setActivities((activitiesResult.activities || []).slice(0, 3));
      setClubs((clubsResult.clubs || []).slice(0, 2));

      // Get the first live activity if available (for non-organizer use cases)
      const liveActivities = liveResult.activities || [];
      setLiveActivity(liveActivities.length > 0 ? liveActivities[0] : null);

      const combinedMine = [...(myLive || []), ...(myUpcoming || [])];
      setOrganizerActivities(combinedMine);
    } catch (error) {
      console.error('Load home data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartOrganizerActivity = async (activity) => {
    const activityId = activity._id || activity.id;

    try {
      setStartingId(activityId);
      const session = await activityService.startSession(activityId);

      if (!session) {
        Alert.alert('Error', 'Failed to start session. Please try again.');
        return;
      }

      navigation.navigate('LiveTracking', {
        activityId,
        sessionId: session.id || session._id || activityId,
      });
    } catch (error) {
      console.error('Start organizer activity error:', error);
      Alert.alert(
        'Error',
        error.message || 'Something went wrong while starting the session.'
      );
    } finally {
      setStartingId(null);
    }
  };

  const upcomingChallenges = activities;
  const featuredClubs = clubs;

  const QuickAction = ({ icon, title, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, {
        backgroundColor: color + '10', // Very subtle tint
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.8)', // Stronger glass border
        shadowColor: color,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4
      }]}>
        <Ionicons name={icon} size={26} color={color} />
        {/* Glass Shine Effect */}
        <LinearGradient
          colors={['rgba(255,255,255,0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, opacity: 0.3 }}
        />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );



  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]} // Primary Brand Color
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Explorer'}!</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Actions - Floating Card */}
      <View style={styles.floatingContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
        >
          <QuickAction
            icon="add-circle-outline"
            title="Create Challenge"
            color={COLORS.primary}
            onPress={() => navigation.navigate('CreateChallenge')}
          />
          <QuickAction
            icon="search-outline"
            title="Find Activities"
            color={COLORS.primary}
            onPress={() => navigation.navigate('Explore')}
          />
          <QuickAction
            icon="car-sport-outline"
            title="Transport"
            color={COLORS.primary}
            onPress={() => navigation.navigate('TransportSelection')}
          />
          <QuickAction
            icon="bed-outline"
            title="Book Hotel"
            color={COLORS.primary}
            onPress={() => navigation.navigate('Explore')}
          />
        </ScrollView>
      </View>

      {/* Live Challenge */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Happening Now</Text>
        </View>
        {organizerActivities && organizerActivities.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SIZES.padding, paddingBottom: 20 }}
          >
            {organizerActivities.map((activity) => (
              <LiveChallengeCard
                key={activity._id || activity.id}
                activity={activity}
                onPress={() =>
                  navigation.navigate('ActivityDetail', {
                    challengeId: activity._id || activity.id,
                    activity,
                  })
                }
                onAction={() =>
                  activity.status === 'live'
                    ? navigation.navigate('LiveTracking', {
                      activityId: activity._id || activity.id,
                      sessionId: activity._id || activity.id,
                    })
                    : handleStartOrganizerActivity(activity)
                }
                isActionLoading={startingId === (activity._id || activity.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.liveCard, styles.noLiveCard]}>
            <Ionicons name="pulse-outline" size={40} color={COLORS.gray} />
            <Text style={styles.noLiveText}>No organizer challenges live right now</Text>
            <Text style={styles.noLiveSubtext}>
              Create a challenge or schedule one to see it here.
            </Text>
            <TouchableOpacity
              style={styles.noLiveButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CreateChallenge')}
            >
              <Text style={styles.noLiveButtonText}>Create a challenge</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Upcoming Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Challenges</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : upcomingChallenges.length > 0 ? (
          upcomingChallenges.map((activity) => (
            <ChallengeCard
              key={activity._id || activity.id}
              challenge={{
                id: activity._id || activity.id,
                title: activity.title,
                description: activity.description,
                activity: activity.activityType,
                difficulty: activity.difficulty,
                date: activity.date,
                distance: activity.distance,
                elevation: activity.elevation,
                currentParticipants: activity.currentParticipants,
                maxParticipants: activity.maxParticipants,
                organizer: {
                  name: activity.organizerId?.name || 'Unknown',
                  photo: activity.organizerId?.profilePhoto,
                  rating: 4.5
                },
                coverPhoto: activity.photos?.[0] || 'https://picsum.photos/seed/activity/800/400',
                rideSharingAvailable: activity.organizerServices?.transport?.available || false,
                availableSeats: Math.max(0, (activity.organizerServices?.transport?.maxSeats || 0) - (activity.organizerServices?.transport?.bookedSeats || 0))
              }}
              onPress={() =>
                navigation.navigate('ChallengeDetail', {
                  challengeId: activity._id || activity.id,
                  activity: activity
                })
              }
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No upcoming challenges</Text>
        )}
      </View>

      {/* Featured Clubs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Clubs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : featuredClubs.length > 0 ? (
          featuredClubs.map((club) => (
            <ClubCard
              key={club._id || club.id}
              club={{
                id: club._id || club.id,
                name: club.name,
                description: club.description,
                members: typeof club.memberCount === 'number' ? club.memberCount : (Array.isArray(club.members) ? club.members.length : 0),
                logo: club.photo || 'https://via.placeholder.com/100',
                coverPhoto: club.photo || 'https://via.placeholder.com/400x200',
                type: club.type || 'multi-sport',
                location: club.location?.address || 'Mauritius'
              }}
              onPress={() => navigation.navigate('Explore', { screen: 'ClubDetail', params: { clubId: club._id || club.id } })}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No clubs found</Text>
        )}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding + 10,
    paddingBottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: SIZES.base,
    color: COLORS.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  floatingContainer: {
    marginTop: -35,
    marginHorizontal: SIZES.padding,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Liquid Glass - more opaque for better readability
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Consistent liquid glass border
    borderRadius: 20,
    paddingVertical: 20,
    ...SHADOW_MEDIUM,
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActions: {
    paddingHorizontal: 16,
  },
  quickAction: {
    alignItems: 'center',
    marginRight: 24,
    width: 70,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass like Messages icon
    shadowColor: COLORS.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 11,
    color: COLORS.darkGray,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  liveCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
    ...SHADOW_LARGE,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass border
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: 8,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.error,
    letterSpacing: 1,
  },
  liveParticipants: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  liveTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkGray,
    marginBottom: 12,
    lineHeight: 24,
  },
  liveParticipantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  liveParticipantPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  liveMoreParticipants: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  liveMoreText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '700',
  },
  liveMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  liveChipPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  liveChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  liveChipSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: COLORS.secondary + '10',
  },
  liveChipSecondaryText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.secondary,
    marginLeft: 6,
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  liveButtonText: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '700',
    marginLeft: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  seeAll: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: SIZES.padding,
  },
  noLiveCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass border
    borderStyle: 'dashed', // Dashed border for empty state
  },
  noLiveText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 12,
  },
  noLiveSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  noLiveButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  noLiveButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default HomeScreen;
