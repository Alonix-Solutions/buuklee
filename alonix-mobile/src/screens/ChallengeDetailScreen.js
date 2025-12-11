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
import { SHADOW_LARGE } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import activityService from '../services/activityService';
import { useAuth } from '../context/AuthContext';
import {
  formatDistance,
  formatElevation,
  formatDateTime,
  getActivityColor,
  getDifficultyColor,
} from '../utils/helpers';

const ChallengeDetailScreen = ({ route, navigation }) => {
  const { challengeId, activity: initialActivity } = route.params || {};
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(initialActivity);
  const [loading, setLoading] = useState(!initialActivity);
  const [joining, setJoining] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    if (challengeId && !initialActivity) {
      loadChallenge();
    } else if (initialActivity) {
      checkParticipantStatus(initialActivity);
    }
  }, [challengeId]);

  useEffect(() => {
    if (challenge) {
      checkParticipantStatus(challenge);
    }
  }, [challenge, user]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const loadedActivity = await activityService.getActivity(challengeId);
      if (loadedActivity) {
        setChallenge(loadedActivity);
        checkParticipantStatus(loadedActivity);
      } else {
        Alert.alert(
          'Not Found',
          'This challenge could not be found. It may have been deleted.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Load challenge error:', error);
      Alert.alert(
        'Error',
        'Failed to load challenge details. Please check your connection.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const checkParticipantStatus = (activity = challenge) => {
    if (!activity || !user) return;

    const userId = user._id || user.id;
    const organizerId = activity.organizerId?._id || activity.organizerId;

    setIsOrganizer(organizerId?.toString() === userId?.toString());

    const participants = activity.participants || [];
    const participant = participants.find(p => {
      const pId = p.userId?._id || p.userId;
      return pId?.toString() === userId?.toString();
    });

    setIsParticipant(!!participant);
  };

  const handleJoin = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join challenges');
      return;
    }

    try {
      setJoining(true);
      const updatedActivity = await activityService.joinActivity(challengeId || challenge._id);

      if (updatedActivity) {
        setChallenge(updatedActivity);
        setIsParticipant(true);
        Alert.alert('Success', 'You have joined this challenge!');
      }
    } catch (error) {
      console.error('Join error:', error);
      Alert.alert('Error', error.message || 'Failed to join challenge');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading challenge details...</Text>
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray} />
        <Text style={styles.errorText}>Challenge not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activityColor = getActivityColor(challenge.activity);
  const difficultyColor = getDifficultyColor(challenge.difficulty);

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <Image source={{ uri: challenge.coverPhoto }} style={styles.coverImage} />

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Description */}
          <Text style={styles.title}>{challenge.title}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: activityColor + '20' }]}>
              <Text style={[styles.tagText, { color: activityColor }]}>
                {capitalize(challenge.activity)}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: difficultyColor + '20' }]}>
              <Text style={[styles.tagText, { color: difficultyColor }]}>
                {capitalize(challenge.difficulty)}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: COLORS.primary + '20' }]}>
              <Text style={[styles.tagText, { color: COLORS.primary }]}>
                {capitalize(challenge.type)}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{challenge.description}</Text>

          {/* Organizer */}
          <TouchableOpacity style={styles.organizer} activeOpacity={0.7}>
            <Image
              source={{ uri: challenge.organizer?.photo || challenge.organizerId?.profilePhoto || 'https://via.placeholder.com/50' }}
              style={styles.organizerPhoto}
            />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerLabel}>Organized by</Text>
              <Text style={styles.organizerName}>{challenge.organizer?.name || challenge.organizerId?.name || 'Unknown'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={styles.rating}>{challenge.organizer?.rating || '4.5'} rating</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Challenge Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Challenge Details</Text>

            <InfoRow
              icon="calendar-outline"
              label="Date & Time"
              value={formatDateTime(challenge.date)}
            />
            <InfoRow
              icon="navigate-outline"
              label="Distance"
              value={formatDistance(challenge.distance)}
            />
            <InfoRow
              icon="trending-up-outline"
              label="Elevation Gain"
              value={formatElevation(challenge.elevation)}
            />
            <InfoRow
              icon="people-outline"
              label="Participants"
              value={
                challenge.maxParticipants
                  ? `${challenge.currentParticipants}/${challenge.maxParticipants}`
                  : `${challenge.currentParticipants} joined`
              }
            />
            <InfoRow
              icon="location-outline"
              label="Meeting Point"
              value={challenge.meetingPoint.address}
            />
          </View>

          {/* Map Placeholder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route</Text>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={48} color={COLORS.lightGray} />
              <Text style={styles.mapPlaceholderText}>Route Map</Text>
              <Text style={styles.mapSubtext}>{formatDistance(challenge.distance)}</Text>
            </View>
          </View>

          {/* Ride Sharing */}
          {challenge.rideSharingAvailable && challenge.availableSeats > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ride Sharing</Text>
              <TouchableOpacity
                style={styles.rideSharingCard}
                onPress={() =>
                  navigation.navigate('RideSharing', { challengeId: challenge.id })
                }
                activeOpacity={0.8}
              >
                <Ionicons name="car" size={32} color={COLORS.primary} />
                <View style={styles.rideSharingInfo}>
                  <Text style={styles.rideSharingTitle}>
                    {challenge.availableSeats} seats available
                  </Text>
                  <Text style={styles.rideSharingText}>
                    Share rides with other participants and split costs
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          )}

          {/* Participants Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.participantsRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Image
                  key={i}
                  source={{ uri: `https://i.pravatar.cc/150?img=${i}` }}
                  style={styles.participantPhoto}
                />
              ))}
              {challenge.currentParticipants > 8 && (
                <View style={styles.moreParticipants}>
                  <Text style={styles.moreText}>+{challenge.currentParticipants - 8}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {isOrganizer ? (
          <TouchableOpacity
            style={[styles.joinButton, styles.organizerButton]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ActivityDetail', {
              challengeId: challengeId || challenge._id,
              activity: challenge
            })}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.white} />
            <Text style={styles.joinButtonText}>Manage Challenge</Text>
          </TouchableOpacity>
        ) : isParticipant ? (
          <TouchableOpacity
            style={[styles.joinButton, styles.participantButton]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ActivityDetail', {
              challengeId: challengeId || challenge._id,
              activity: challenge
            })}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.joinButtonText}>View Details</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.joinButton, (challenge.currentParticipants >= challenge.maxParticipants || joining) && styles.joinButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleJoin}
            disabled={joining || challenge.currentParticipants >= challenge.maxParticipants}
          >
            {joining ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color={COLORS.white} />
                <Text style={styles.joinButtonText}>
                  {challenge.currentParticipants >= challenge.maxParticipants ? 'Challenge Full' : 'Join Challenge'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  coverImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    paddingBottom: 100,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.darkGray,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    lineHeight: 22,
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.lightestGray,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    borderRadius: 12,
    marginHorizontal: SIZES.padding,
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  organizerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginBottom: 2,
  },
  organizerName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  mapPlaceholderText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 12,
  },
  mapSubtext: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    marginTop: 4,
  },
  rideSharingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primaryLight + '10',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rideSharingInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rideSharingTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  rideSharingText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  participantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  moreParticipants: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 80, // Adjusted to sit above floating navigation (60px height + 10px bottom + 10px margin)
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Glass effect instead of solid white
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass border
    borderTopLeftRadius: 30, // Curved cutout design
    borderTopRightRadius: 30,
    marginHorizontal: 16,
    ...SHADOW_LARGE,
  },
  shareButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  joinButton: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
  joinButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  organizerButton: {
    backgroundColor: COLORS.secondary || COLORS.primary,
  },
  participantButton: {
    backgroundColor: COLORS.success || COLORS.primary,
  },
  centerContent: {
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
  backButtonText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ChallengeDetailScreen;
