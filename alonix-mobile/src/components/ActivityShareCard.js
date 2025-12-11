import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM } from '../utils/shadows';
import { capitalize } from '../utils/helpers';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Portrait ratio for Instagram

const ActivityShareCard = React.forwardRef(({ activity, user, stats, achievements = [] }, ref) => {
  const getActivityColor = () => {
    const colors = {
      running: COLORS.running,
      cycling: COLORS.cycling,
      hiking: COLORS.hiking,
      swimming: COLORS.swimming,
    };
    return colors[activity.type] || COLORS.primary;
  };

  const getActivityIcon = () => {
    const icons = {
      running: 'walk',
      cycling: 'bicycle',
      hiking: 'trending-up',
      swimming: 'water',
    };
    return icons[activity.type] || 'fitness';
  };

  const mapRegion =
    activity.route && activity.route.length > 0
      ? {
        latitude: activity.route[Math.floor(activity.route.length / 2)].latitude,
        longitude: activity.route[Math.floor(activity.route.length / 2)].longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
      : null;

  return (
    <View ref={ref} style={styles.container}>
      {/* Header with gradient background */}
      <View style={[styles.header, { backgroundColor: getActivityColor() }]}>
        <View style={styles.overlay} />

        {/* User Info */}
        <View style={styles.userSection}>
          <Image
            source={{ uri: user?.avatar || user?.profilePhoto }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Alonix User'}</Text>
            <View style={styles.activityTypeRow}>
              <Ionicons name={getActivityIcon()} size={16} color={COLORS.white} />
              <Text style={styles.activityType}>
                {capitalize(activity.type)}
              </Text>
            </View>
          </View>
        </View>

        {/* Activity Title */}
        <Text style={styles.activityTitle} numberOfLines={2}>
          {activity.title}
        </Text>
      </View>

      {/* Map Section */}
      {mapRegion && activity.route && activity.route.length > 0 && (
        <View style={styles.mapSection}>
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            pointerEvents="none"
          >
            <Polyline
              coordinates={activity.route}
              strokeColor={getActivityColor()}
              strokeWidth={4}
            />
          </MapView>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="location" size={24} color={getActivityColor()} />
            <Text style={styles.statValue}>{stats.distance}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="time" size={24} color={getActivityColor()} />
            <Text style={styles.statValue}>{stats.duration}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="speedometer" size={24} color={getActivityColor()} />
            <Text style={styles.statValue}>{stats.pace}</Text>
            <Text style={styles.statLabel}>Pace</Text>
          </View>
        </View>

        {/* Additional Stats Row */}
        <View style={styles.additionalStats}>
          {stats.elevation && (
            <View style={styles.additionalStatItem}>
              <Ionicons name="trending-up" size={18} color={COLORS.gray} />
              <Text style={styles.additionalStatText}>{stats.elevation}m elevation</Text>
            </View>
          )}
          {stats.calories && (
            <View style={styles.additionalStatItem}>
              <Ionicons name="flame" size={18} color={COLORS.warning} />
              <Text style={styles.additionalStatText}>{stats.calories} cal</Text>
            </View>
          )}
        </View>
      </View>

      {/* Achievement Badges */}
      {achievements && achievements.length > 0 && (
        <View style={styles.achievementsSection}>
          <View style={styles.achievementHeader}>
            <Ionicons name="trophy" size={20} color={COLORS.warning} />
            <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
          </View>
          <View style={styles.achievementBadges}>
            {achievements.slice(0, 3).map((achievement, index) => (
              <View key={index} style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName} numberOfLines={1}>
                  {achievement.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer with Branding */}
      <View style={styles.footer}>
        <View style={styles.brandingContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="fitness" size={24} color={COLORS.primary} />
            <Text style={styles.brandName}>Alonix</Text>
          </View>
          <Text style={styles.tagline}>Social Fitness & Tourism</Text>
        </View>
      </View>

      {/* Decorative Elements */}
      <View style={[styles.decorativeCircle, styles.decorativeCircle1]} />
      <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 25,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    ...SHADOW_MEDIUM,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    zIndex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activityTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  activityType: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    marginLeft: 6,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activityTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mapSection: {
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  map: {
    flex: 1,
  },
  statsSection: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 8,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 20,
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  additionalStatText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '600',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.backgroundGray,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  achievementBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  achievementBadge: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementName: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  brandingContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  tagline: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
  },
  decorativeCircle1: {
    top: -30,
    right: -30,
  },
  decorativeCircle2: {
    bottom: 50,
    left: -50,
  },
});

export default ActivityShareCard;
