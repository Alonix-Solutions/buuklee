import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import {
  formatDistance,
  formatElevation,
  formatDateTime,
  getActivityColor,
  getDifficultyColor,
} from '../utils/helpers';

const ChallengeCard = ({ challenge, onPress }) => {
  const activityColor = getActivityColor(challenge.activity);
  const difficultyColor = getDifficultyColor(challenge.difficulty);

  const participantText =
    challenge.maxParticipants
      ? `${challenge.currentParticipants}/${challenge.maxParticipants}`
      : `${challenge.currentParticipants}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Cover Image */}
      <Image source={{ uri: challenge.coverPhoto }} style={styles.coverImage} />

      {/* Activity Type Badge */}
      <View style={[styles.activityBadge, { backgroundColor: activityColor }]}>
        <Text style={styles.activityText}>
          {capitalize(challenge.activity)}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {challenge.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {challenge.description}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{formatDateTime(challenge.date)}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="navigate-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{formatDistance(challenge.distance)}</Text>
          </View>

          <View style={styles.stat}>
            <Ionicons name="trending-up-outline" size={16} color={COLORS.gray} />
            <Text style={styles.statText}>{formatElevation(challenge.elevation)}</Text>
          </View>

          <View style={styles.stat}>
            <View
              style={[styles.difficultyDot, { backgroundColor: difficultyColor }]}
            />
            <Text style={styles.statText}>{challenge.difficulty}</Text>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          {/* Organizer */}
          <View style={styles.organizer}>
            <Image
              source={{ uri: challenge.organizer?.photo || 'https://via.placeholder.com/50' }}
              style={styles.organizerPhoto}
            />
            <View>
              <Text style={styles.organizerName}>{challenge.organizer?.name || 'Unknown'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={COLORS.warning} />
                <Text style={styles.rating}>{challenge.organizer?.rating || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.participants}>
            <Ionicons name="people-outline" size={16} color={COLORS.gray} />
            <Text style={styles.participantText}>{participantText}</Text>
          </View>
        </View>

        {/* Ride Sharing Badge */}
        {challenge.rideSharingAvailable && challenge.availableSeats > 0 && (
          <View style={styles.rideSharingBadge}>
            <Ionicons name="car-outline" size={14} color={COLORS.primary} />
            <Text style={styles.rideSharingText}>
              {challenge.availableSeats} seats available
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
    ...SHADOW_MEDIUM,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  activityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activityText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  content: {
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  organizerName: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginLeft: 2,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  rideSharingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  rideSharingText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default ChallengeCard;
