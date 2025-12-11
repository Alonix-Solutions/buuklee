import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import clubService from '../services/clubService';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/helpers';

const ClubDetailScreen = ({ route, navigation }) => {
  const { clubId, club: initialClub } = route.params || {};
  const { user } = useAuth();
  const [club, setClub] = useState(initialClub);
  const [loading, setLoading] = useState(!initialClub);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [events, setEvents] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (clubId && !initialClub) {
      loadClub();
    } else if (initialClub) {
      checkMemberStatus(initialClub);
    }
  }, [clubId]);

  useEffect(() => {
    if (club) {
      checkMemberStatus(club);
      if (activeTab === 'events') {
        loadEvents();
      }
    }
  }, [club, user, activeTab]);

  const loadClub = async () => {
    try {
      setLoading(true);
      const loadedClub = await clubService.getClub(clubId);
      if (loadedClub) {
        setClub(loadedClub);
        checkMemberStatus(loadedClub);
      }
    } catch (error) {
      console.error('Load club error:', error);
      Alert.alert('Error', error.message || 'Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const clubEvents = await clubService.getClubEvents(clubId || club._id);
      setEvents(clubEvents);
    } catch (error) {
      console.error('Load events error:', error);
    }
  };

  const checkMemberStatus = (clubData = club) => {
    if (!clubData || !user) return;

    const userId = user._id || user.id;
    const creatorId = clubData.creatorId?._id || clubData.creatorId;

    setIsCreator(creatorId?.toString() === userId?.toString());

    const members = clubData.members || [];
    const member = members.find(m => {
      const mId = m.userId?._id || m.userId || m;
      return mId?.toString() === userId?.toString();
    });

    setIsMember(!!member);
  };

  const handleJoin = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join clubs');
      return;
    }

    try {
      setJoining(true);
      const updatedClub = await clubService.joinClub(clubId || club._id);

      if (updatedClub) {
        setClub(updatedClub);
        setIsMember(true);
        Alert.alert('Success', 'You have joined this club!');
      }
    } catch (error) {
      console.error('Join club error:', error);
      Alert.alert('Error', error.message || 'Failed to join club');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      'Leave Club',
      'Are you sure you want to leave this club?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clubService.leaveClub(clubId || club._id);
              if (success) {
                setIsMember(false);
                await loadClub();
                Alert.alert('Success', 'You have left this club');
              }
            } catch (error) {
              console.error('Leave club error:', error);
              Alert.alert('Error', error.message || 'Failed to leave club');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading club details...</Text>
      </View>
    );
  }

  if (!club) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray} />
        <Text style={styles.errorText}>Club not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getTypeIcon = (type) => {
    const icons = {
      running: 'walk-outline',
      cycling: 'bicycle-outline',
      hiking: 'compass-outline',
      'multi-sport': 'fitness-outline',
    };
    return icons[type] || 'fitness-outline';
  };

  const Tab = ({ title, value }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === value && styles.activeTab]}
      onPress={() => setActiveTab(value)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === value && styles.activeTabText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: club.coverPhoto }} style={styles.coverPhoto} />

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={{ uri: club.logo }} style={styles.logo} />
          </View>
        </View>

        {/* Club Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{club.name}</Text>

          <View style={styles.typeRow}>
            <Ionicons name={getTypeIcon(club.type)} size={20} color={COLORS.primary} />
            <Text style={styles.typeText}>
              {capitalize(club.type).replace('-', ' ')}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={20} color={COLORS.gray} />
              <Text style={styles.statText}>
                {typeof club.members === 'number'
                  ? club.members
                  : (Array.isArray(club.members) ? club.members.length : (club.memberCount || 0))} members
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="location-outline" size={20} color={COLORS.gray} />
              <Text style={styles.statText}>
                {typeof club.location === 'string'
                  ? club.location
                  : (club.location?.address || 'Mauritius')}
              </Text>
            </View>
          </View>

          {/* Aggregated Stats */}
          <View style={styles.aggregatedStatsContainer}>
            <View style={styles.aggregatedStat}>
              <Text style={styles.aggregatedStatValue}>
                {club.aggregatedStats?.totalDistance ? (club.aggregatedStats.totalDistance / 1000).toFixed(0) : '0'}
              </Text>
              <Text style={styles.aggregatedStatLabel}>km total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.aggregatedStat}>
              <Text style={styles.aggregatedStatValue}>
                {club.aggregatedStats?.totalActivities || '0'}
              </Text>
              <Text style={styles.aggregatedStatLabel}>activities</Text>
            </View>
          </View>

          {/* Join/Leave Button */}
          {!isCreator && (
            isMember ? (
              <TouchableOpacity
                style={[styles.joinButton, styles.leaveButton]}
                activeOpacity={0.8}
                onPress={handleLeave}
              >
                <Text style={styles.joinButtonText}>Leave Club</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                activeOpacity={0.8}
                onPress={handleJoin}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.joinButtonText}>Join Club</Text>
                )}
              </TouchableOpacity>
            )
          )}
          {isCreator && (
            <TouchableOpacity
              style={[styles.joinButton, styles.creatorButton]}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={20} color={COLORS.white} />
              <Text style={[styles.joinButtonText, { marginLeft: 8 }]}>Manage Club</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Tab title="About" value="about" />
          <Tab title="Events" value="events" />
          <Tab title="Members" value="members" />
          <Tab title="Photos" value="photos" />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'about' && (
            <View>
              <Text style={styles.description}>{club.description}</Text>

              {/* Next Event */}
              {club.nextEvent && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Next Event</Text>
                  <View style={styles.eventCard}>
                    <View style={styles.eventIcon}>
                      <Ionicons name="calendar" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{club.nextEvent.title}</Text>
                      <Text style={styles.eventDate}>
                        {formatDateTime(club.nextEvent.date)}
                      </Text>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Membership */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Membership</Text>
                <View style={styles.infoCard}>
                  <Ionicons
                    name={club.membershipType === 'open' ? 'lock-open' : 'lock-closed'}
                    size={24}
                    color={club.membershipType === 'open' ? COLORS.success : COLORS.warning}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>
                      {club.membershipType === 'open' ? 'Open to All' : 'Application Required'}
                    </Text>
                    <Text style={styles.infoText}>
                      {club.membershipType === 'open'
                        ? 'Anyone can join this club instantly'
                        : 'Join requests are reviewed by club organizers'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Regular Activities */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Regular Activities</Text>
                <View style={styles.activityCard}>
                  <View style={styles.activityDay}>
                    <Text style={styles.dayName}>TUE</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Morning Run</Text>
                    <Text style={styles.activityTime}>6:00 AM • 10km</Text>
                  </View>
                </View>
                <View style={styles.activityCard}>
                  <View style={styles.activityDay}>
                    <Text style={styles.dayName}>SAT</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Weekend Long Run</Text>
                    <Text style={styles.activityTime}>6:00 AM • 15-20km</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'events' && (
            events.length > 0 ? (
              events.map((event, index) => (
                <View key={event._id || index} style={styles.eventCard}>
                  <View style={styles.eventIcon}>
                    <Ionicons name="calendar" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      {formatDateTime(event.date)}
                    </Text>
                    {event.location && (
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    )}
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color={COLORS.lightGray} />
                <Text style={styles.emptyText}>No upcoming events</Text>
              </View>
            )
          )}

          {activeTab === 'members' && (
            <View>
              <Text style={styles.memberCount}>
                {typeof club.members === 'number'
                  ? club.members
                  : (Array.isArray(club.members) ? club.members.length : (club.memberCount || 0))} members
              </Text>
              <View style={styles.membersGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <View key={i} style={styles.memberItem}>
                    <Image
                      source={{ uri: `https://i.pravatar.cc/150?img=${i}` }}
                      style={styles.memberPhoto}
                    />
                    <Text style={styles.memberName}>Member {i}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'photos' && (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No photos yet</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  coverContainer: {
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: SIZES.padding,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    paddingTop: 50,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  name: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 6,
  },
  aggregatedStatsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightestGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  aggregatedStat: {
    alignItems: 'center',
  },
  aggregatedStatValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aggregatedStatLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // Neutral divider
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.lightestGray,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    padding: SIZES.padding,
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
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  infoText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    lineHeight: 18,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  activityDay: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dayName: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  memberCount: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 16,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  memberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberName: {
    fontSize: SIZES.xs,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.gray,
    marginTop: 16,
  },
  leaveButton: {
    backgroundColor: COLORS.error,
  },
  creatorButton: {
    backgroundColor: COLORS.secondary || COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    marginTop: 12,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
});

export default ClubDetailScreen;
