import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { formatDistance, formatElevation, formatDuration } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import postService from '../services/postService';
import activityService from '../services/activityService';

const ProfileScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Normalize user location to a displayable string
  const rawLocation = user?.location;
  let safeLocation = 'Mauritius';
  if (typeof rawLocation === 'string') {
    safeLocation = rawLocation;
  } else if (rawLocation && typeof rawLocation === 'object') {
    // Support shapes like { address, city, coordinates: [lng, lat] }
    if (rawLocation.address || rawLocation.city) {
      safeLocation = rawLocation.address || rawLocation.city;
    } else if (Array.isArray(rawLocation.coordinates) && rawLocation.coordinates.length >= 2) {
      safeLocation = `${rawLocation.coordinates[1]}, ${rawLocation.coordinates[0]}`;
    }
  }

  // Default user data with fallbacks
  const userData = {
    name: user?.name || 'User',
    email: user?.email || '',
    profilePhoto: user?.profilePhoto || 'https://via.placeholder.com/150',
    bio: user?.bio || 'Adventure awaits! 🌴',
    location: safeLocation,
    stats: user?.stats || {
      challengesCompleted: 0,
      totalDistance: 0,
      totalElevation: 0,
      totalTime: 0,
      activeDays: 0
    },
    achievements: user?.achievements || []
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch user's posts
      if (user?._id || user?.id) {
        const postsResult = await postService.getUserPosts(user._id || user.id);
        setPosts(postsResult.posts || []);
      }

      // Fetch user's activity stats
      if (user?._id || user?.id) {
        const statsResult = await activityService.getActivities({
          userId: user._id || user.id,
          status: 'completed'
        });
        if (statsResult.activities) {
          // Calculate stats from completed activities
          const activities = statsResult.activities;
          const stats = {
            challengesCompleted: activities.length,
            totalDistance: activities.reduce((sum, a) => sum + (a.distance || 0), 0),
            totalElevation: activities.reduce((sum, a) => sum + (a.elevation || 0), 0),
            totalTime: activities.reduce((sum, a) => sum + (a.duration || 0), 0)
          };
          setUserStats(stats);
        }
      }
    } catch (error) {
      console.error('Load profile data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Use fetched stats or default to user stats
  const displayStats = userStats || userData.stats;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const StatCard = ({ label, value, unit, icon }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <Text style={styles.statValue}>
        {value}
        {unit && <Text style={styles.statUnit}> {unit}</Text>}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const AchievementBadge = ({ achievement }) => (
    <View style={styles.achievementBadge}>
      <View style={styles.achievementIcon}>
        <Text style={styles.achievementEmoji}>{achievement.icon || '🏆'}</Text>
      </View>
      <Text style={styles.achievementName} numberOfLines={2}>
        {achievement.name}
      </Text>
    </View>
  );

  const PostCard = ({ post }) => (
    <TouchableOpacity style={styles.postCard} activeOpacity={0.9}>
      {post.photos && post.photos.length > 0 && (
        <Image source={{ uri: post.photos[0] }} style={styles.postImage} />
      )}
      <View style={styles.postContent}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {post.title}
        </Text>
        {post.stats && (
          <View style={styles.postStats}>
            <Text style={styles.postStat}>
              {formatDistance(post.stats.distance)}
            </Text>
            <Text style={styles.postStat}> • </Text>
            <Text style={styles.postStat}>
              {formatDuration(post.stats.time)}
            </Text>
          </View>
        )}
        <View style={styles.postEngagement}>
          <View style={styles.engagementItem}>
            <Ionicons name="heart-outline" size={14} color={COLORS.gray} />
            <Text style={styles.engagementText}>{post.likes || 0}</Text>
          </View>
          <View style={styles.engagementItem}>
            <Ionicons name="chatbubble-outline" size={14} color={COLORS.gray} />
            <Text style={styles.engagementText}>{post.comments || 0}</Text>
          </View>
        </View>
      </View>
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
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: userData.profilePhoto }}
            style={styles.profilePhoto}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userData.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.white} />
              <Text style={styles.location}>{userData.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.bio}>{userData.bio}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overall Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Stats</Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <View style={styles.statsGrid}>
            <StatCard
              icon="trophy-outline"
              label="Challenges"
              value={displayStats.challengesCompleted || 0}
            />
            <StatCard
              icon="navigate-outline"
              label="Distance"
              value={formatDistance(displayStats.totalDistance || 0)}
            />
            <StatCard
              icon="trending-up-outline"
              label="Elevation"
              value={formatElevation(displayStats.totalElevation || 0)}
            />
            <StatCard
              icon="time-outline"
              label="Time"
              value={Math.round((displayStats.totalTime || 0) / 3600)}
              unit="hrs"
            />
          </View>
        )}
      </View>

      {/* Activity Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Year</Text>
        <View style={styles.activityBreakdown}>
          <View style={styles.activityRow}>
            <View style={styles.activityInfo}>
              <Ionicons name="walk-outline" size={20} color={COLORS.running} />
              <Text style={styles.activityName}>Running</Text>
            </View>
            <Text style={styles.activityDistance}>Track your runs</Text>
          </View>
          <View style={styles.activityRow}>
            <View style={styles.activityInfo}>
              <Ionicons name="bicycle-outline" size={20} color={COLORS.cycling} />
              <Text style={styles.activityName}>Cycling</Text>
            </View>
            <Text style={styles.activityDistance}>Track your rides</Text>
          </View>
          <View style={styles.activityRow}>
            <View style={styles.activityInfo}>
              <Ionicons name="compass-outline" size={20} color={COLORS.hiking} />
              <Text style={styles.activityName}>Hiking</Text>
            </View>
            <Text style={styles.activityDistance}>Track your hikes</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
            <Text style={styles.seeAll}>
              {userData.achievements.length} unlocked
            </Text>
          </TouchableOpacity>
        </View>
        {userData.achievements.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}
          >
            {userData.achievements.map((achievement, index) => (
              <AchievementBadge key={achievement.id || index} achievement={achievement} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={40} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>Complete challenges to earn achievements!</Text>
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : posts.length > 0 ? (
          posts.slice(0, 3).map((post, index) => (
            <PostCard key={post._id || post.id || index} post={post} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={40} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>No recent activity posts</Text>
          </View>
        )}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
    marginRight: 16,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: SIZES.base,
    color: COLORS.white,
    marginLeft: 4,
    opacity: 0.9,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    borderRadius: 12,
    marginHorizontal: SIZES.padding,
    marginBottom: 8,
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  bio: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.lightestGray,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  editButtonText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '15',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  logoutButtonText: {
    fontSize: SIZES.base,
    color: COLORS.error,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: SIZES.padding,
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
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    ...SHADOW_SMALL,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  statCard: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginTop: 8,
    marginBottom: 4,
  },
  statUnit: {
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  activityBreakdown: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SIZES.padding,
    ...SHADOW_SMALL,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginLeft: 12,
  },
  activityDistance: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  achievementsContainer: {
    paddingRight: SIZES.padding,
  },
  achievementBadge: {
    width: 100,
    alignItems: 'center',
    marginRight: 16,
  },
  achievementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW_SMALL,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  achievementEmoji: {
    fontSize: 40,
  },
  achievementName: {
    fontSize: SIZES.xs,
    color: COLORS.darkGray,
    fontWeight: '600',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOW_SMALL,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  postImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  postContent: {
    padding: 12,
  },
  postTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postStat: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  postEngagement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  engagementText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ProfileScreen;
