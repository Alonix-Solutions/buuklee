import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import gpsService from '../services/gpsService';
import moment from 'moment';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 3;

const UserProfileScreen = ({ navigation, route }) => {
  const { userId, userData } = route.params || {};

  if (!userId && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.gray }}>User not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const { user: currentUser } = useAuth();
  const { isFollowing, followUser, unfollowUser, isLoading } = useSocial();

  const [user, setUser] = useState(userData || null);
  const [following, setFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('activities');
  const [userActivities, setUserActivities] = useState([]);
  const [userStats, setUserStats] = useState({
    totalActivities: 0,
    totalDistance: 0,
    totalDuration: 0,
    followers: 0,
    following: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadUserData();
    loadUserActivities();
  }, [userId]);

  useEffect(() => {
    setFollowing(isFollowing(userId));
  }, [userId]);

  const loadUserData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await userAPI.getUser(userId);

      // For now, use provided userData or mock data
      if (!userData) {
        const mockUser = {
          id: userId,
          name: 'Jane Smith',
          avatar: 'https://i.pravatar.cc/150?img=10',
          bio: 'Adventure seeker | Marathon runner | Mountain lover',
          location: 'Nairobi, Kenya',
          joinedDate: Date.now() - 365 * 24 * 60 * 60 * 1000,
        };
        setUser(mockUser);
      }

      // Load user stats
      const mockStats = {
        totalActivities: 127,
        totalDistance: 1250000, // meters
        totalDuration: 150 * 60 * 60 * 1000, // milliseconds
        followers: 342,
        following: 156,
      };
      setUserStats(mockStats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserActivities = async () => {
    try {
      setLoadingData(true);

      // TODO: Replace with actual API call
      // const response = await activityAPI.getUserActivities(userId);

      // Generate mock activities
      const mockActivities = generateMockActivities(12);
      setUserActivities(mockActivities);
    } catch (error) {
      console.error('Error loading user activities:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const generateMockActivities = (count) => {
    const activityTypes = ['running', 'cycling', 'hiking', 'swimming'];

    return Array.from({ length: count }, (_, i) => {
      const type = activityTypes[i % activityTypes.length];
      return {
        id: `activity_${userId}_${i}`,
        userId: userId,
        userName: user?.name || userData?.name,
        userAvatar: user?.avatar || userData?.avatar,
        type,
        title: `${capitalize(type)} Session`,
        distance: 5000 + Math.random() * 10000,
        duration: 1800000 + Math.random() * 3600000,
        averagePace: 5 + Math.random() * 3,
        photos: i % 3 === 0 ? [`https://picsum.photos/400/400?random=${i}`] : [],
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        createdAt: Date.now() - i * 2 * 24 * 60 * 60 * 1000,
      };
    });
  };

  const handleFollowToggle = async () => {
    if (following) {
      const result = await unfollowUser(userId);
      if (result.success) {
        setFollowing(false);
        setUserStats((prev) => ({
          ...prev,
          followers: Math.max(prev.followers - 1, 0),
        }));
      }
    } else {
      const result = await followUser(userId, user);
      if (result.success) {
        setFollowing(true);
        setUserStats((prev) => ({
          ...prev,
          followers: prev.followers + 1,
        }));
      }
    }
  };

  const handleActivityPress = (activity) => {
    navigation.navigate('ActivityDetail', { activity });
  };

  const getActivityIcon = (type) => {
    const icons = {
      running: 'walk',
      cycling: 'bicycle',
      hiking: 'trending-up',
      swimming: 'water',
    };
    return icons[type] || 'fitness';
  };

  const renderActivityGrid = ({ item }) => (
    <TouchableOpacity
      style={styles.activityGridItem}
      onPress={() => handleActivityPress(item)}
    >
      {item.photos && item.photos.length > 0 ? (
        <Image source={{ uri: item.photos[0] }} style={styles.activityGridImage} />
      ) : (
        <View style={[styles.activityGridPlaceholder, { backgroundColor: getActivityColor(item.type) }]}>
          <Ionicons name={getActivityIcon(item.type)} size={32} color={COLORS.white} />
        </View>
      )}
      <View style={styles.activityGridOverlay}>
        <View style={styles.activityGridStats}>
          <Ionicons name="heart" size={12} color={COLORS.white} />
          <Text style={styles.activityGridStatText}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivityList = ({ item }) => (
    <TouchableOpacity
      style={styles.activityListItem}
      onPress={() => handleActivityPress(item)}
    >
      <View style={styles.activityListHeader}>
        <View style={[styles.activityTypeBadge, { backgroundColor: getActivityColor(item.type) }]}>
          <Ionicons name={getActivityIcon(item.type)} size={16} color={COLORS.white} />
        </View>
        <View style={styles.activityListInfo}>
          <Text style={styles.activityListTitle}>{item.title}</Text>
          <Text style={styles.activityListDate}>
            {moment(item.createdAt).format('MMM D, YYYY')}
          </Text>
        </View>
      </View>

      <View style={styles.activityListStats}>
        <View style={styles.activityListStat}>
          <Ionicons name="fitness" size={16} color={COLORS.gray} />
          <Text style={styles.activityListStatText}>
            {gpsService.formatDistance(item.distance)}
          </Text>
        </View>
        <View style={styles.activityListStat}>
          <Ionicons name="time" size={16} color={COLORS.gray} />
          <Text style={styles.activityListStatText}>
            {gpsService.formatDuration(item.duration)}
          </Text>
        </View>
        <View style={styles.activityListStat}>
          <Ionicons name="speedometer" size={16} color={COLORS.gray} />
          <Text style={styles.activityListStatText}>
            {gpsService.formatPace(item.averagePace)}
          </Text>
        </View>
      </View>

      <View style={styles.activityListEngagement}>
        <View style={styles.activityListEngagementItem}>
          <Ionicons name="heart-outline" size={16} color={COLORS.gray} />
          <Text style={styles.activityListEngagementText}>{item.likes}</Text>
        </View>
        <View style={styles.activityListEngagementItem}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.gray} />
          <Text style={styles.activityListEngagementText}>{item.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getActivityColor = (type) => {
    const colors = {
      running: COLORS.running,
      cycling: COLORS.cycling,
      hiking: COLORS.hiking,
      swimming: COLORS.swimming,
    };
    return colors[type] || COLORS.primary;
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
          <Text style={styles.profileName}>{user.name}</Text>

          {user.bio && <Text style={styles.profileBio}>{user.bio}</Text>}

          {user.location && (
            <View style={styles.profileLocation}>
              <Ionicons name="location" size={16} color={COLORS.gray} />
              <Text style={styles.profileLocationText}>{user.location}</Text>
            </View>
          )}

          {user.joinedDate && (
            <View style={styles.profileJoined}>
              <Ionicons name="calendar" size={16} color={COLORS.gray} />
              <Text style={styles.profileJoinedText}>
                Joined {moment(user.joinedDate).format('MMMM YYYY')}
              </Text>
            </View>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalActivities}</Text>
              <Text style={styles.statLabel}>Activities</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {/* Performance Stats */}
          <View style={styles.performanceStats}>
            <View style={styles.performanceStat}>
              <Ionicons name="fitness" size={24} color={COLORS.primary} />
              <Text style={styles.performanceValue}>
                {gpsService.formatDistance(userStats.totalDistance)}
              </Text>
              <Text style={styles.performanceLabel}>Total Distance</Text>
            </View>
            <View style={styles.performanceStat}>
              <Ionicons name="time" size={24} color={COLORS.secondary} />
              <Text style={styles.performanceValue}>
                {Math.round(userStats.totalDuration / (1000 * 60 * 60))}h
              </Text>
              <Text style={styles.performanceLabel}>Total Time</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.followButton,
                following && styles.followingButton,
              ]}
              onPress={handleFollowToggle}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={following ? COLORS.primary : COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name={following ? 'checkmark' : 'person-add'}
                    size={20}
                    color={following ? COLORS.primary : COLORS.white}
                  />
                  <Text style={[styles.followButtonText, following && styles.followingButtonText]}>
                    {following ? 'Following' : 'Follow'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'activities' && styles.activeTab]}
            onPress={() => setSelectedTab('activities')}
          >
            <Ionicons
              name="list"
              size={20}
              color={selectedTab === 'activities' ? COLORS.primary : COLORS.gray}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'activities' && styles.activeTabText,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'grid' && styles.activeTab]}
            onPress={() => setSelectedTab('grid')}
          >
            <Ionicons
              name="grid"
              size={20}
              color={selectedTab === 'grid' ? COLORS.primary : COLORS.gray}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'grid' && styles.activeTabText,
              ]}
            >
              Grid
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activities */}
        {loadingData ? (
          <View style={styles.loadingActivities}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.activitiesContainer}>
            {selectedTab === 'grid' ? (
              <FlatList
                data={userActivities}
                renderItem={renderActivityGrid}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                columnWrapperStyle={styles.activityGridRow}
              />
            ) : (
              <FlatList
                data={userActivities}
                renderItem={renderActivityList}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}

            {userActivities.length === 0 && (
              <View style={styles.noActivities}>
                <Ionicons name="fitness-outline" size={64} color={COLORS.lightGray} />
                <Text style={styles.noActivitiesText}>No activities yet</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    padding: 20,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  profileLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  profileLocationText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  profileJoined: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  profileJoinedText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // Neutral divider
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 8,
  },
  performanceLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    gap: 8,
    marginTop: 10,
    ...SHADOW_SMALL,
  },
  followingButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  followButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  followingButtonText: {
    color: COLORS.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.backgroundGray,
  },
  tabText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  activitiesContainer: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    paddingTop: 10,
  },
  loadingActivities: {
    padding: 40,
    alignItems: 'center',
  },
  activityGridRow: {
    paddingHorizontal: 15,
    gap: 5,
  },
  activityGridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    marginBottom: 5,
    position: 'relative',
  },
  activityGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  activityGridPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
  },
  activityGridStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityGridStatText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activityListItem: {
    padding: 15,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  activityListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  activityTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityListInfo: {
    flex: 1,
  },
  activityListTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activityListDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  activityListStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  activityListStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityListStatText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  activityListEngagement: {
    flexDirection: 'row',
    gap: 15,
  },
  activityListEngagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityListEngagementText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  noActivities: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noActivitiesText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginTop: 12,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default UserProfileScreen;
