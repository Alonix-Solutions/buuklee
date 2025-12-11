import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';

// Extended achievements data
const allAchievements = [
  // Unlocked achievements
  {
    id: 1,
    name: 'Island Circumnavigator',
    icon: '🏆',
    description: 'Complete a 225km cycling challenge around Mauritius',
    category: 'cycling',
    unlocked: true,
    unlockedAt: '2025-12-15',
    progress: 100,
    requirement: 'Complete 225km ride',
    rarity: 'legendary',
    points: 500,
  },
  {
    id: 2,
    name: 'Mountain Conqueror',
    icon: '🏔️',
    description: 'Summit Le Morne Brabant',
    category: 'hiking',
    unlocked: true,
    unlockedAt: '2025-11-20',
    progress: 100,
    requirement: 'Complete Le Morne hike',
    rarity: 'epic',
    points: 300,
  },
  {
    id: 3,
    name: 'Early Bird',
    icon: '🌅',
    description: 'Complete 10 sunrise activities',
    category: 'general',
    unlocked: true,
    unlockedAt: '2025-10-05',
    progress: 100,
    requirement: '10/10 sunrise activities',
    rarity: 'rare',
    points: 150,
  },
  {
    id: 4,
    name: 'Century Rider',
    icon: '🎯',
    description: 'Complete a 100km+ cycling ride',
    category: 'cycling',
    unlocked: true,
    unlockedAt: '2025-09-12',
    progress: 100,
    requirement: 'Complete 100km ride',
    rarity: 'rare',
    points: 200,
  },
  {
    id: 5,
    name: 'Marathon Runner',
    icon: '🏃',
    description: 'Complete a full marathon (42.2km)',
    category: 'running',
    unlocked: true,
    unlockedAt: '2025-08-15',
    progress: 100,
    requirement: 'Complete 42.2km run',
    rarity: 'epic',
    points: 400,
  },
  {
    id: 6,
    name: 'Social Butterfly',
    icon: '🦋',
    description: 'Join 20 different group challenges',
    category: 'social',
    unlocked: true,
    unlockedAt: '2025-07-22',
    progress: 100,
    requirement: '20/20 group challenges',
    rarity: 'common',
    points: 100,
  },
  // Locked achievements
  {
    id: 7,
    name: 'Ultra Legend',
    icon: '💎',
    description: 'Complete a 100km+ ultramarathon',
    category: 'running',
    unlocked: false,
    progress: 65,
    requirement: '65km of 100km completed',
    rarity: 'legendary',
    points: 1000,
  },
  {
    id: 8,
    name: 'Peak Collector',
    icon: '⛰️',
    description: 'Summit all 5 major peaks in Mauritius',
    category: 'hiking',
    unlocked: false,
    progress: 60,
    requirement: '3/5 peaks summited',
    rarity: 'epic',
    points: 500,
  },
  {
    id: 9,
    name: 'Tri-Athlete',
    icon: '🏊‍♂️',
    description: 'Complete challenges in running, cycling, and swimming',
    category: 'general',
    unlocked: false,
    progress: 66,
    requirement: '2/3 activities completed',
    rarity: 'rare',
    points: 250,
  },
  {
    id: 10,
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Achieve 40km/h+ average speed on a cycling challenge',
    category: 'cycling',
    unlocked: false,
    progress: 85,
    requirement: 'Best: 34km/h (need 40km/h)',
    rarity: 'epic',
    points: 350,
  },
  {
    id: 11,
    name: 'Consistency King',
    icon: '📅',
    description: 'Complete activities for 30 consecutive days',
    category: 'general',
    unlocked: false,
    progress: 73,
    requirement: '22/30 consecutive days',
    rarity: 'rare',
    points: 300,
  },
  {
    id: 12,
    name: 'Night Owl',
    icon: '🦉',
    description: 'Complete 5 night-time activities',
    category: 'general',
    unlocked: false,
    progress: 40,
    requirement: '2/5 night activities',
    rarity: 'common',
    points: 100,
  },
];

const AchievementsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'cycling', label: 'Cycling', icon: 'bicycle' },
    { id: 'running', label: 'Running', icon: 'walk' },
    { id: 'hiking', label: 'Hiking', icon: 'compass' },
    { id: 'social', label: 'Social', icon: 'people' },
    { id: 'general', label: 'General', icon: 'star' },
  ];

  const rarityColors = {
    common: COLORS.gray,
    rare: COLORS.info,
    epic: COLORS.secondary,
    legendary: COLORS.warning,
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? allAchievements
      : allAchievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length;
  const totalPoints = allAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const handleShareAchievement = async (achievement) => {
    try {
      const message = `I just unlocked "${achievement.name}" ${achievement.icon} on Alonix! ${achievement.description}`;
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAchievementPress = (achievement) => {
    const statusText = achievement.unlocked
      ? `Unlocked on ${new Date(achievement.unlockedAt).toLocaleDateString()}`
      : `Progress: ${achievement.progress}%\n${achievement.requirement}`;

    Alert.alert(
      `${achievement.icon} ${achievement.name}`,
      `${achievement.description}\n\n${statusText}\n\nPoints: ${achievement.points}`,
      achievement.unlocked
        ? [
          {
            text: 'Share',
            onPress: () => handleShareAchievement(achievement),
          },
          { text: 'OK' },
        ]
        : [{ text: 'OK' }]
    );
  };

  const AchievementCard = ({ achievement }) => {
    const isLocked = !achievement.unlocked;
    const rarityColor = rarityColors[achievement.rarity];

    return (
      <TouchableOpacity
        style={[
          styles.achievementCard,
          isLocked && styles.achievementCardLocked,
        ]}
        onPress={() => handleAchievementPress(achievement)}
        activeOpacity={0.7}
      >
        {/* Achievement Icon */}
        <View
          style={[
            styles.achievementIconContainer,
            isLocked && styles.achievementIconLocked,
            { borderColor: rarityColor },
          ]}
        >
          <Text
            style={[
              styles.achievementIcon,
              isLocked && styles.achievementIconTextLocked,
            ]}
          >
            {isLocked ? '🔒' : achievement.icon}
          </Text>
        </View>

        {/* Achievement Info */}
        <View style={styles.achievementInfo}>
          <View style={styles.achievementHeader}>
            <Text
              style={[
                styles.achievementName,
                isLocked && styles.achievementNameLocked,
              ]}
              numberOfLines={1}
            >
              {achievement.name}
            </Text>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.rarityText}>
                {achievement.rarity.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.achievementDescription,
              isLocked && styles.achievementDescriptionLocked,
            ]}
            numberOfLines={2}
          >
            {achievement.description}
          </Text>

          {/* Progress Bar for Locked Achievements */}
          {isLocked && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${achievement.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{achievement.progress}%</Text>
            </View>
          )}

          {/* Points and Date */}
          <View style={styles.achievementFooter}>
            <View style={styles.pointsBadge}>
              <Ionicons name="trophy" size={12} color={COLORS.warning} />
              <Text style={styles.pointsText}>{achievement.points} pts</Text>
            </View>
            {achievement.unlocked && achievement.unlockedAt && (
              <Text style={styles.unlockedDate}>
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Share Button for Unlocked */}
        {achievement.unlocked && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShareAchievement(achievement)}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{allAchievements.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon}
              size={20}
              color={
                selectedCategory === category.id ? COLORS.white : COLORS.primary
              }
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements Grid */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.achievementsGrid}>
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>
              No achievements in this category yet
            </Text>
          </View>
        )}

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
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...SHADOW_MEDIUM,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // Neutral divider
  },
  categoriesContainer: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  achievementsGrid: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
  },
  achievementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOW_SMALL,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
  },
  achievementIconLocked: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementIconTextLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  achievementName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    flex: 1,
    marginRight: 8,
  },
  achievementNameLocked: {
    color: COLORS.gray,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  achievementDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    lineHeight: 18,
    marginBottom: 8,
  },
  achievementDescriptionLocked: {
    color: COLORS.lightGray,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.lightestGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray,
    width: 40,
    textAlign: 'right',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 4,
  },
  unlockedDate: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginTop: 16,
  },
});

export default AchievementsScreen;
