import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import { useGamification } from '../context/GamificationContext';

const { width } = Dimensions.get('window');

const LeaderboardScreen = ({ navigation }) => {
  const { getLeaderboardData, userLevel, totalPoints } = useGamification();
  const [activeTab, setActiveTab] = useState('global');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, activeFilter]);

  const loadLeaderboard = () => {
    const data = getLeaderboardData(activeTab);
    setLeaderboardData(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      loadLeaderboard();
      setRefreshing(false);
    }, 1000);
  };

  const animateTab = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    animateTab();
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1:
        return ['#FFD700', '#FFA500']; // Gold
      case 2:
        return ['#C0C0C0', '#A8A8A8']; // Silver
      case 3:
        return ['#CD7F32', '#8B4513']; // Bronze
      default:
        return [COLORS.primary, COLORS.primaryDark];
    }
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank) => {
    if (rank <= 3) return COLORS.secondary;
    if (rank <= 10) return COLORS.primary;
    if (rank <= 50) return COLORS.accent;
    return COLORS.gray;
  };

  const Tab = ({ label, value, icon }) => {
    const isActive = activeTab === value;
    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => handleTabChange(value)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isActive ? COLORS.white : COLORS.gray}
        />
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({ label, value, icon }) => {
    const isActive = activeFilter === value;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setActiveFilter(value)}
        activeOpacity={0.7}
      >
        {icon && (
          <Text style={styles.filterIcon}>{icon}</Text>
        )}
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const PodiumCard = ({ user, rank }) => {
    const medalColors = getMedalColor(rank);
    const height = rank === 1 ? 140 : rank === 2 ? 120 : 100;
    const marginTop = rank === 1 ? 0 : rank === 2 ? 20 : 40;

    return (
      <View style={[styles.podiumCard, { marginTop }]}>
        <View style={styles.podiumRank}>
          <Text style={styles.podiumRankText}>{getMedalIcon(rank)}</Text>
        </View>

        <Image source={{ uri: user.avatar }} style={styles.podiumAvatar} />

        <Text style={styles.podiumName} numberOfLines={1}>
          {user.name.split(' ')[0]}
        </Text>

        <LinearGradient
          colors={medalColors}
          style={[styles.podiumBase, { height }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.podiumPoints}>{user.points.toLocaleString()}</Text>
          <Text style={styles.podiumLabel}>points</Text>
        </LinearGradient>
      </View>
    );
  };

  const UserCard = ({ user, rank }) => {
    const isCurrentUser = user.isCurrentUser;

    return (
      <TouchableOpacity
        style={[
          styles.userCard,
          isCurrentUser && styles.userCardHighlight,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          if (!isCurrentUser) {
            navigation.navigate('UserProfile', { userId: user.id });
          }
        }}
      >
        {/* Rank badge */}
        <View
          style={[
            styles.rankBadge,
            { backgroundColor: getRankBadgeColor(rank) },
          ]}
        >
          <Text style={styles.rankText}>#{rank}</Text>
        </View>

        {/* Avatar */}
        <Image source={{ uri: user.avatar }} style={styles.userAvatar} />

        {/* User info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name}
            </Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>You</Text>
              </View>
            )}
          </View>
          <View style={styles.userLocationRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.gray} />
            <Text style={styles.userLocation} numberOfLines={1}>
              {user.location}
            </Text>
          </View>
          <View style={styles.userStatsRow}>
            <Ionicons name="fitness-outline" size={12} color={COLORS.gray} />
            <Text style={styles.userStat}>{user.activities} activities</Text>
          </View>
        </View>

        {/* Points */}
        <View style={styles.userPoints}>
          <Text style={styles.userPointsValue}>
            {user.points.toLocaleString()}
          </Text>
          <Text style={styles.userPointsLabel}>pts</Text>

          {/* Level badge */}
          <View style={styles.levelBadge}>
            <Ionicons name="trophy" size={10} color={COLORS.white} />
            <Text style={styles.levelText}>{user.level}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Split top 3 for podium
  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = topThree.length >= 3
    ? [topThree[1], topThree[0], topThree[2]]
    : topThree;

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Leaderboard</Text>
            <Text style={styles.headerSubtitle}>Compete with the best</Text>
          </View>

          <TouchableOpacity style={styles.infoButton}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Tab label="Global" value="global" icon="globe-outline" />
          <Tab label="Friends" value="friends" icon="people-outline" />
          <Tab label="Local" value="local" icon="location-outline" />
          <Tab label="This Month" value="month" icon="calendar-outline" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Activity filter */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <FilterButton label="All" value="all" icon="🏆" />
            <FilterButton label="Running" value="running" icon="🏃" />
            <FilterButton label="Cycling" value="cycling" icon="🚴" />
            <FilterButton label="Hiking" value="hiking" icon="🥾" />
          </ScrollView>
        </View>

        {/* Podium - Top 3 */}
        {topThree.length >= 3 && (
          <View style={styles.podiumContainer}>
            <View style={styles.podium}>
              {podiumOrder.map((user, index) => {
                // Map back to actual rank
                const actualRank =
                  user.id === topThree[0].id ? 1 : user.id === topThree[1].id ? 2 : 3;
                return <PodiumCard key={user.id} user={user} rank={actualRank} />;
              })}
            </View>
          </View>
        )}

        {/* Rest of leaderboard */}
        <View style={styles.leaderboardList}>
          <View style={styles.listHeader}>
            <Ionicons name="list" size={20} color={COLORS.darkGray} />
            <Text style={styles.listHeaderText}>All Rankings</Text>
          </View>

          {restOfLeaderboard.map((user, index) => (
            <UserCard key={user.id} user={user} rank={index + 4} />
          ))}

          {/* Show current user if not in top ranks */}
          {!leaderboardData.some((u) => u.isCurrentUser) && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>•••</Text>
                <View style={styles.dividerLine} />
              </View>

              <UserCard
                user={{
                  id: 'current',
                  name: 'Current User',
                  avatar: 'https://i.pravatar.cc/150?img=10',
                  location: 'Your Location',
                  points: totalPoints,
                  level: userLevel,
                  activities: 0,
                  isCurrentUser: true,
                }}
                rank={245}
              />
            </>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOW_LARGE,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    paddingVertical: SIZES.padding,
  },
  filtersContent: {
    paddingHorizontal: SIZES.padding,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  podiumContainer: {
    paddingVertical: 20,
    paddingHorizontal: SIZES.padding,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
  },
  podiumCard: {
    flex: 1,
    alignItems: 'center',
  },
  podiumRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...SHADOW_MEDIUM,
  },
  podiumRankText: {
    fontSize: 24,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOW_MEDIUM,
  },
  podiumName: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'center',
  },
  podiumBase: {
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    ...SHADOW_MEDIUM,
  },
  podiumPoints: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  podiumLabel: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  leaderboardList: {
    paddingHorizontal: SIZES.padding,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  listHeaderText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...SHADOW_SMALL,
  },
  userCardHighlight: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    flex: 1,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  youBadgeText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  userLocation: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    flex: 1,
  },
  userStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userStat: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  userPoints: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  userPointsValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  userPointsLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  levelText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // Neutral divider
  },
  dividerText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    paddingHorizontal: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default LeaderboardScreen;
