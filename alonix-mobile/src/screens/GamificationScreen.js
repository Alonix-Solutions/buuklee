import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import { useGamification } from '../context/GamificationContext';

const GamificationScreen = ({ navigation }) => {
  const {
    userLevel,
    userXP,
    totalPoints,
    currentStreak,
    longestStreak,
    achievements,
    dailyChallenges,
    weeklyGoals,
    pointsBreakdown,
    rewardsShopItems,
    purchasedRewards,
    getLevelProgress,
    completeDailyChallenge,
    purchaseReward,
  } = useGamification();

  const [progressAnim] = useState(new Animated.Value(0));
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const levelProgress = getLevelProgress();

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: levelProgress.progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [levelProgress.progress]);

  const handleChallengeComplete = (challengeId) => {
    Alert.alert(
      'Complete Challenge',
      'Mark this challenge as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            completeDailyChallenge(challengeId);
            Alert.alert('Success!', 'Challenge completed! Points and XP awarded.');
          },
        },
      ]
    );
  };

  const handlePurchaseReward = (rewardId, rewardName, cost) => {
    Alert.alert(
      'Purchase Reward',
      `Purchase "${rewardName}" for ${cost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            const result = purchaseReward(rewardId);
            Alert.alert(
              result.success ? 'Success!' : 'Error',
              result.message
            );
          },
        },
      ]
    );
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return COLORS.gray;
      case 'uncommon':
        return COLORS.accent;
      case 'rare':
        return COLORS.info;
      case 'epic':
        return COLORS.secondary;
      case 'legendary':
        return '#FFD700';
      default:
        return COLORS.gray;
    }
  };

  const LevelCard = () => {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <TouchableOpacity
        style={styles.levelCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.levelGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Level badge */}
          <View style={styles.levelBadge}>
            <Ionicons name="trophy" size={32} color={COLORS.white} />
            <View style={styles.levelInfo}>
              <Text style={styles.levelNumber}>{userLevel}</Text>
              <Text style={styles.levelTitle}>{levelProgress.title}</Text>
            </View>
          </View>

          {/* XP Progress */}
          <View style={styles.xpContainer}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>Experience Points</Text>
              <Text style={styles.xpText}>
                {levelProgress.currentXP} / {levelProgress.requiredXP} XP
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { width: progressWidth },
                ]}
              />
            </View>

            <Text style={styles.nextLevelText}>
              {levelProgress.requiredXP - levelProgress.currentXP} XP to Level {userLevel + 1}
            </Text>
          </View>

          {/* Total Points */}
          <View style={styles.pointsRow}>
            <View style={styles.pointsBadge}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <View>
                <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>Total Points</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.leaderboardButton}>
              <Ionicons name="podium" size={20} color={COLORS.white} />
              <Text style={styles.leaderboardButtonText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const PointsBreakdown = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="analytics" size={20} color={COLORS.darkGray} />
        <Text style={styles.sectionTitle}>Points Breakdown</Text>
      </View>

      <View style={styles.breakdownGrid}>
        <View style={styles.breakdownCard}>
          <View style={[styles.breakdownIcon, { backgroundColor: COLORS.running + '20' }]}>
            <Ionicons name="fitness" size={24} color={COLORS.running} />
          </View>
          <Text style={styles.breakdownValue}>
            {pointsBreakdown.activities.toLocaleString()}
          </Text>
          <Text style={styles.breakdownLabel}>Activities</Text>
        </View>

        <View style={styles.breakdownCard}>
          <View style={[styles.breakdownIcon, { backgroundColor: COLORS.cycling + '20' }]}>
            <Ionicons name="trophy" size={24} color={COLORS.cycling} />
          </View>
          <Text style={styles.breakdownValue}>
            {pointsBreakdown.challenges.toLocaleString()}
          </Text>
          <Text style={styles.breakdownLabel}>Challenges</Text>
        </View>

        <View style={styles.breakdownCard}>
          <View style={[styles.breakdownIcon, { backgroundColor: COLORS.hiking + '20' }]}>
            <Ionicons name="people" size={24} color={COLORS.hiking} />
          </View>
          <Text style={styles.breakdownValue}>
            {pointsBreakdown.social.toLocaleString()}
          </Text>
          <Text style={styles.breakdownLabel}>Social</Text>
        </View>

        <View style={styles.breakdownCard}>
          <View style={[styles.breakdownIcon, { backgroundColor: COLORS.secondary + '20' }]}>
            <Ionicons name="ribbon" size={24} color={COLORS.secondary} />
          </View>
          <Text style={styles.breakdownValue}>
            {pointsBreakdown.achievements.toLocaleString()}
          </Text>
          <Text style={styles.breakdownLabel}>Achievements</Text>
        </View>
      </View>
    </View>
  );

  const DailyChallengesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="today" size={20} color={COLORS.darkGray} />
        <Text style={styles.sectionTitle}>Daily Challenges</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {dailyChallenges.filter((c) => !c.completed).length} left
          </Text>
        </View>
      </View>

      {dailyChallenges.map((challenge) => (
        <TouchableOpacity
          key={challenge.id}
          style={[
            styles.challengeCard,
            challenge.completed && styles.challengeCardCompleted,
          ]}
          onPress={() => !challenge.completed && handleChallengeComplete(challenge.id)}
          disabled={challenge.completed}
          activeOpacity={0.7}
        >
          <View style={styles.challengeCheckbox}>
            {challenge.completed ? (
              <Ionicons name="checkmark-circle" size={28} color={COLORS.accent} />
            ) : (
              <View style={styles.checkboxEmpty} />
            )}
          </View>

          <View style={styles.challengeIcon}>
            <Text style={styles.challengeEmoji}>{challenge.icon}</Text>
          </View>

          <View style={styles.challengeInfo}>
            <Text
              style={[
                styles.challengeTitle,
                challenge.completed && styles.challengeTitleCompleted,
              ]}
            >
              {challenge.title}
            </Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>

          <View style={styles.challengeReward}>
            <View style={styles.rewardRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rewardText}>{challenge.points}</Text>
            </View>
            <View style={styles.rewardRow}>
              <Text style={styles.xpIcon}>✨</Text>
              <Text style={styles.rewardText}>{challenge.xp}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const WeeklyGoalsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="calendar" size={20} color={COLORS.darkGray} />
        <Text style={styles.sectionTitle}>Weekly Goals</Text>
      </View>

      {Object.entries(weeklyGoals).map(([key, goal]) => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        const isComplete = goal.current >= goal.target;

        return (
          <View key={key} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleRow}>
                <Ionicons
                  name={
                    key === 'activities'
                      ? 'fitness'
                      : key === 'distance'
                        ? 'navigate'
                        : 'trophy'
                  }
                  size={18}
                  color={isComplete ? COLORS.accent : COLORS.primary}
                />
                <Text style={styles.goalTitle}>
                  {capitalize(key)}
                </Text>
              </View>
              <Text style={styles.goalValue}>
                {goal.current} / {goal.target}
                {key === 'distance' && ' km'}
              </Text>
            </View>

            <View style={styles.goalProgressContainer}>
              <View
                style={[
                  styles.goalProgress,
                  {
                    width: `${progress}%`,
                    backgroundColor: isComplete ? COLORS.accent : COLORS.primary,
                  },
                ]}
              />
            </View>

            <View style={styles.goalFooter}>
              <Text style={styles.goalReward}>+{goal.points} pts</Text>
              {isComplete && (
                <View style={styles.completeTag}>
                  <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  <Text style={styles.completeText}>Complete</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  const AchievementsSection = () => {
    const unlockedAchievements = achievements.filter((a) => a.unlocked);
    const lockedAchievements = achievements.filter((a) => !a.unlocked).slice(0, 6);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon" size={20} color={COLORS.darkGray} />
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.achievementSubtitle}>
          {unlockedAchievements.length} of {achievements.length} unlocked
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.achievementsGrid}>
            {/* Unlocked achievements */}
            {unlockedAchievements.slice(0, 4).map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={styles.achievementCard}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[
                    getRarityColor(achievement.rarity),
                    getRarityColor(achievement.rarity) + 'CC',
                  ]}
                  style={styles.achievementGradient}
                >
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementName} numberOfLines={2}>
                    {achievement.name}
                  </Text>
                  <View style={styles.achievementPoints}>
                    <Ionicons name="star" size={12} color={COLORS.white} />
                    <Text style={styles.achievementPointsText}>
                      {achievement.points}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            {/* Locked achievements */}
            {lockedAchievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[styles.achievementCard, styles.achievementCardLocked]}
                activeOpacity={0.7}
              >
                <Text style={styles.achievementIconLocked}>🔒</Text>
                <Text style={styles.achievementNameLocked} numberOfLines={2}>
                  {achievement.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const StreakSection = () => (
    <View style={styles.section}>
      <View style={styles.streakCard}>
        <LinearGradient
          colors={['#FF6B6B', '#EE5A6F']}
          style={styles.streakGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.streakIcon}>
            <Text style={styles.fireEmoji}>🔥</Text>
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakValue}>{currentStreak} Days</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakBest}>Best: {longestStreak} days</Text>
          </View>
          <TouchableOpacity style={styles.streakButton}>
            <Ionicons name="information-circle" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );

  const RewardsShopSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="gift" size={20} color={COLORS.darkGray} />
        <Text style={styles.sectionTitle}>Rewards Shop</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setShowRewardsModal(true)}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.rewardsRow}>
          {rewardsShopItems.slice(0, 4).map((reward) => {
            const isPurchased = purchasedRewards.includes(reward.id);
            const canAfford = totalPoints >= reward.cost;

            return (
              <TouchableOpacity
                key={reward.id}
                style={[
                  styles.rewardCard,
                  isPurchased && styles.rewardCardPurchased,
                ]}
                onPress={() =>
                  !isPurchased &&
                  handlePurchaseReward(reward.id, reward.name, reward.cost)
                }
                disabled={isPurchased}
                activeOpacity={0.7}
              >
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
                <Text style={styles.rewardName} numberOfLines={2}>
                  {reward.name}
                </Text>
                <Text style={styles.rewardDescription} numberOfLines={2}>
                  {reward.description}
                </Text>

                {isPurchased ? (
                  <View style={styles.purchasedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                    <Text style={styles.purchasedText}>Owned</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.rewardCost,
                      !canAfford && styles.rewardCostInsufficient,
                    ]}
                  >
                    <Ionicons
                      name="star"
                      size={14}
                      color={canAfford ? '#FFD700' : COLORS.gray}
                    />
                    <Text
                      style={[
                        styles.rewardCostText,
                        !canAfford && styles.rewardCostTextInsufficient,
                      ]}
                    >
                      {reward.cost}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gamification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LevelCard />
        <PointsBreakdown />
        <StreakSection />
        <DailyChallengesSection />
        <WeeklyGoalsSection />
        <AchievementsSection />
        <RewardsShopSection />

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  levelCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOW_LARGE,
  },
  levelGradient: {
    padding: 20,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelInfo: {
    marginLeft: 12,
  },
  levelNumber: {
    fontSize: SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 32,
  },
  levelTitle: {
    fontSize: SIZES.base,
    color: 'rgba(255,255,255,0.9)',
  },
  xpContainer: {
    marginBottom: 20,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: SIZES.base,
    color: 'rgba(255,255,255,0.9)',
  },
  xpText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 6,
  },
  nextLevelText: {
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  pointsLabel: {
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  leaderboardButtonText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...SHADOW_SMALL,
  },
  breakdownIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  breakdownValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...SHADOW_SMALL,
  },
  challengeCardCompleted: {
    opacity: 0.6,
  },
  challengeCheckbox: {
    marginRight: 12,
  },
  checkboxEmpty: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
  },
  challengeIcon: {
    marginRight: 12,
  },
  challengeEmoji: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  challengeTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  challengeDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  challengeReward: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpIcon: {
    fontSize: 12,
  },
  rewardText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  goalCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...SHADOW_SMALL,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  goalValue: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray,
  },
  goalProgressContainer: {
    height: 8,
    backgroundColor: COLORS.lightestGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgress: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalReward: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: '#FFD700',
  },
  completeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
  },
  completeText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  achievementSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementCard: {
    width: 120,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOW_MEDIUM,
  },
  achievementGradient: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  achievementPointsText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  achievementCardLocked: {
    backgroundColor: COLORS.lightestGray,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  achievementIconLocked: {
    fontSize: 40,
    marginBottom: 8,
    opacity: 0.5,
  },
  achievementNameLocked: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
  },
  streakCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOW_MEDIUM,
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  streakIcon: {
    marginRight: 16,
  },
  fireEmoji: {
    fontSize: 48,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: SIZES.base,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  streakBest: {
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  streakButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardCard: {
    width: 160,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...SHADOW_SMALL,
  },
  rewardCardPurchased: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  rewardIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  rewardName: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  rewardDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 12,
    minHeight: 32,
  },
  rewardCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.lightestGray,
    alignSelf: 'flex-start',
  },
  rewardCostInsufficient: {
    opacity: 0.5,
  },
  rewardCostText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  rewardCostTextInsufficient: {
    color: COLORS.gray,
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.accent + '20',
    alignSelf: 'flex-start',
  },
  purchasedText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.accent,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default GamificationScreen;
