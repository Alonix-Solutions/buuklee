import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GamificationContext = createContext({});

// XP requirements for each level (exponential growth)
const calculateXPForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Generate level data from 1 to 100
const generateLevelData = () => {
  const levels = [];
  for (let i = 1; i <= 100; i++) {
    levels.push({
      level: i,
      xpRequired: calculateXPForLevel(i),
      title: getLevelTitle(i),
    });
  }
  return levels;
};

const getLevelTitle = (level) => {
  if (level >= 90) return 'Legend';
  if (level >= 80) return 'Master';
  if (level >= 70) return 'Expert';
  if (level >= 60) return 'Pro';
  if (level >= 50) return 'Advanced';
  if (level >= 40) return 'Skilled';
  if (level >= 30) return 'Intermediate';
  if (level >= 20) return 'Apprentice';
  if (level >= 10) return 'Novice';
  return 'Beginner';
};

// Daily challenges pool
const dailyChallengesPool = [
  {
    id: 'run_5km',
    title: 'Run 5km',
    description: 'Complete a 5km run',
    points: 50,
    xp: 100,
    icon: '🏃',
    type: 'running',
  },
  {
    id: 'cycle_10km',
    title: 'Cycle 10km',
    description: 'Complete a 10km cycling session',
    points: 60,
    xp: 120,
    icon: '🚴',
    type: 'cycling',
  },
  {
    id: 'hike_trail',
    title: 'Hike a Trail',
    description: 'Complete any hiking trail',
    points: 70,
    xp: 140,
    icon: '🥾',
    type: 'hiking',
  },
  {
    id: 'invite_friend',
    title: 'Invite a Friend',
    description: 'Invite someone to join Alonix',
    points: 100,
    xp: 150,
    icon: '👥',
    type: 'social',
  },
  {
    id: 'join_challenge',
    title: 'Join a Challenge',
    description: 'Join any community challenge',
    points: 40,
    xp: 80,
    icon: '🎯',
    type: 'challenge',
  },
  {
    id: 'morning_activity',
    title: 'Early Bird',
    description: 'Complete an activity before 8 AM',
    points: 80,
    xp: 130,
    icon: '🌅',
    type: 'activity',
  },
  {
    id: 'streak_3',
    title: '3-Day Streak',
    description: 'Complete activities for 3 consecutive days',
    points: 150,
    xp: 200,
    icon: '🔥',
    type: 'streak',
  },
  {
    id: 'share_activity',
    title: 'Share Your Activity',
    description: 'Share your activity on social media',
    points: 30,
    xp: 60,
    icon: '📱',
    type: 'social',
  },
];

// Achievements data
const achievementsData = [
  // Distance achievements
  {
    id: 'first_5k',
    name: 'First 5K',
    description: 'Complete your first 5km run',
    icon: '🏃',
    category: 'distance',
    rarity: 'common',
    points: 50,
    xp: 100,
    unlocked: false,
    progress: 0,
    requirement: 5,
  },
  {
    id: 'first_10k',
    name: 'First 10K',
    description: 'Complete your first 10km run',
    icon: '🎯',
    category: 'distance',
    rarity: 'uncommon',
    points: 100,
    xp: 200,
    unlocked: false,
    progress: 0,
    requirement: 10,
  },
  {
    id: 'half_marathon',
    name: 'Half Marathon Hero',
    description: 'Complete a 21km half marathon',
    icon: '🏅',
    category: 'distance',
    rarity: 'rare',
    points: 250,
    xp: 500,
    unlocked: false,
    progress: 0,
    requirement: 21,
  },
  {
    id: 'full_marathon',
    name: 'Marathon Legend',
    description: 'Complete a full 42km marathon',
    icon: '🏆',
    category: 'distance',
    rarity: 'legendary',
    points: 500,
    xp: 1000,
    unlocked: false,
    progress: 0,
    requirement: 42,
  },
  // Activity count achievements
  {
    id: 'activities_10',
    name: 'Getting Started',
    description: 'Complete 10 activities',
    icon: '⭐',
    category: 'count',
    rarity: 'common',
    points: 50,
    xp: 100,
    unlocked: false,
    progress: 0,
    requirement: 10,
  },
  {
    id: 'activities_50',
    name: 'Regular Athlete',
    description: 'Complete 50 activities',
    icon: '🌟',
    category: 'count',
    rarity: 'uncommon',
    points: 150,
    xp: 300,
    unlocked: false,
    progress: 0,
    requirement: 50,
  },
  {
    id: 'activities_100',
    name: 'Century Club',
    description: 'Complete 100 activities',
    icon: '💯',
    category: 'count',
    rarity: 'rare',
    points: 300,
    xp: 600,
    unlocked: false,
    progress: 0,
    requirement: 100,
  },
  // Streak achievements
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'uncommon',
    points: 100,
    xp: 200,
    unlocked: false,
    progress: 0,
    requirement: 7,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day activity streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
    points: 300,
    xp: 600,
    unlocked: false,
    progress: 0,
    requirement: 30,
  },
  {
    id: 'streak_365',
    name: 'Unstoppable Force',
    description: 'Maintain a 365-day activity streak',
    icon: '💪',
    category: 'streak',
    rarity: 'legendary',
    points: 1000,
    xp: 2000,
    unlocked: false,
    progress: 0,
    requirement: 365,
  },
  // Social achievements
  {
    id: 'first_challenge',
    name: 'Challenge Accepted',
    description: 'Join your first challenge',
    icon: '🎯',
    category: 'social',
    rarity: 'common',
    points: 50,
    xp: 100,
    unlocked: false,
    progress: 0,
    requirement: 1,
  },
  {
    id: 'friends_10',
    name: 'Social Butterfly',
    description: 'Connect with 10 friends',
    icon: '👥',
    category: 'social',
    rarity: 'uncommon',
    points: 100,
    xp: 200,
    unlocked: false,
    progress: 0,
    requirement: 10,
  },
  {
    id: 'challenge_win',
    name: 'Champion',
    description: 'Win a community challenge',
    icon: '👑',
    category: 'social',
    rarity: 'epic',
    points: 400,
    xp: 800,
    unlocked: false,
    progress: 0,
    requirement: 1,
  },
  // Special achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 activities before 6 AM',
    icon: '🌅',
    category: 'special',
    rarity: 'rare',
    points: 200,
    xp: 400,
    unlocked: false,
    progress: 0,
    requirement: 10,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete 10 activities after 8 PM',
    icon: '🌙',
    category: 'special',
    rarity: 'rare',
    points: 200,
    xp: 400,
    unlocked: false,
    progress: 0,
    requirement: 10,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Visit 20 different locations',
    icon: '🗺️',
    category: 'special',
    rarity: 'epic',
    points: 350,
    xp: 700,
    unlocked: false,
    progress: 0,
    requirement: 20,
  },
];

// Rewards shop items
const rewardsShopItems = [
  {
    id: 'badge_custom',
    name: 'Custom Badge',
    description: 'Create your own profile badge',
    icon: '🎨',
    cost: 500,
    category: 'cosmetic',
  },
  {
    id: 'theme_dark',
    name: 'Dark Theme',
    description: 'Unlock premium dark theme',
    icon: '🌙',
    cost: 300,
    category: 'theme',
  },
  {
    id: 'title_legend',
    name: 'Legend Title',
    description: 'Display "Legend" title on profile',
    icon: '👑',
    cost: 1000,
    category: 'title',
  },
  {
    id: 'boost_xp',
    name: 'XP Boost (24h)',
    description: '2x XP for 24 hours',
    icon: '⚡',
    cost: 200,
    category: 'boost',
  },
  {
    id: 'analysis_advanced',
    name: 'Advanced Analytics',
    description: 'Unlock detailed activity analytics',
    icon: '📊',
    cost: 750,
    category: 'feature',
  },
  {
    id: 'route_private',
    name: 'Private Routes',
    description: 'Create private routes for friends',
    icon: '🔒',
    cost: 400,
    category: 'feature',
  },
];

export const GamificationProvider = ({ children }) => {
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState(null);
  const [achievements, setAchievements] = useState(achievementsData);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState({
    activities: { current: 0, target: 5, points: 100 },
    distance: { current: 0, target: 20, points: 150 },
    challenges: { current: 0, target: 2, points: 80 },
  });
  const [pointsBreakdown, setPointsBreakdown] = useState({
    activities: 0,
    challenges: 0,
    social: 0,
    achievements: 0,
  });
  const [purchasedRewards, setPurchasedRewards] = useState([]);

  const levels = generateLevelData();

  // Load saved data on mount
  useEffect(() => {
    loadGamificationData();
    generateDailyChallenges();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveGamificationData();
  }, [userLevel, userXP, totalPoints, currentStreak, achievements]);

  const loadGamificationData = async () => {
    try {
      const data = await AsyncStorage.getItem('@gamification_data');
      if (data) {
        const parsed = JSON.parse(data);
        setUserLevel(parsed.userLevel || 1);
        setUserXP(parsed.userXP || 0);
        setTotalPoints(parsed.totalPoints || 0);
        setCurrentStreak(parsed.currentStreak || 0);
        setLongestStreak(parsed.longestStreak || 0);
        setLastActivityDate(parsed.lastActivityDate);
        setAchievements(parsed.achievements || achievementsData);
        setPointsBreakdown(parsed.pointsBreakdown || {
          activities: 0,
          challenges: 0,
          social: 0,
          achievements: 0,
        });
        setPurchasedRewards(parsed.purchasedRewards || []);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const saveGamificationData = async () => {
    try {
      const data = {
        userLevel,
        userXP,
        totalPoints,
        currentStreak,
        longestStreak,
        lastActivityDate,
        achievements,
        pointsBreakdown,
        purchasedRewards,
      };
      await AsyncStorage.setItem('@gamification_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  };

  // Generate 3 random daily challenges
  const generateDailyChallenges = () => {
    const shuffled = [...dailyChallengesPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((challenge) => ({
      ...challenge,
      completed: false,
    }));
    setDailyChallenges(selected);
  };

  // Add XP and check for level up
  const addXP = (amount) => {
    const newXP = userXP + amount;
    const currentLevelData = levels.find((l) => l.level === userLevel);

    if (newXP >= currentLevelData.xpRequired) {
      // Level up!
      const excessXP = newXP - currentLevelData.xpRequired;
      setUserLevel(userLevel + 1);
      setUserXP(excessXP);
      return { leveledUp: true, newLevel: userLevel + 1 };
    } else {
      setUserXP(newXP);
      return { leveledUp: false };
    }
  };

  // Add points with category tracking
  const addPoints = (amount, category = 'activities') => {
    setTotalPoints(totalPoints + amount);
    setPointsBreakdown((prev) => ({
      ...prev,
      [category]: prev[category] + amount,
    }));
  };

  // Update streak
  const updateStreak = () => {
    const today = new Date().toDateString();

    if (lastActivityDate === today) {
      // Already logged activity today
      return currentStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActivityDate === yesterdayStr) {
      // Continuing streak
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setLongestStreak(Math.max(longestStreak, newStreak));
      setLastActivityDate(today);

      // Bonus points for streak milestones
      if (newStreak % 7 === 0) {
        addPoints(50, 'achievements');
        addXP(100);
      }

      return newStreak;
    } else {
      // Streak broken, start new
      setCurrentStreak(1);
      setLastActivityDate(today);
      return 1;
    }
  };

  // Complete activity and award points/XP
  const completeActivity = (activityType, distance, duration) => {
    // Base points based on activity type and distance
    let points = Math.floor(distance * 10);
    let xp = Math.floor(distance * 20);

    // Bonus for duration
    const hours = duration / 3600;
    if (hours > 1) {
      points += Math.floor(hours * 10);
      xp += Math.floor(hours * 20);
    }

    // Update streak
    const streak = updateStreak();

    // Streak bonus
    if (streak >= 7) {
      points = Math.floor(points * 1.5);
      xp = Math.floor(xp * 1.5);
    }

    addPoints(points, 'activities');
    const levelUpResult = addXP(xp);

    // Update weekly goals
    setWeeklyGoals((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        current: prev.activities.current + 1,
      },
      distance: {
        ...prev.distance,
        current: prev.distance.current + distance,
      },
    }));

    // Check achievements
    checkAchievements(activityType, distance);

    return {
      points,
      xp,
      streak,
      ...levelUpResult,
    };
  };

  // Check and unlock achievements
  const checkAchievements = (activityType, distance) => {
    const updated = achievements.map((achievement) => {
      if (achievement.unlocked) return achievement;

      let newProgress = achievement.progress;

      // Update progress based on achievement type
      if (achievement.category === 'distance' && activityType === 'running') {
        if (distance >= achievement.requirement) {
          newProgress = achievement.requirement;
        }
      }

      // Check if achievement should be unlocked
      if (newProgress >= achievement.requirement && !achievement.unlocked) {
        addPoints(achievement.points, 'achievements');
        addXP(achievement.xp);

        return {
          ...achievement,
          unlocked: true,
          progress: achievement.requirement,
          unlockedAt: new Date().toISOString(),
        };
      }

      return {
        ...achievement,
        progress: newProgress,
      };
    });

    setAchievements(updated);
  };

  // Complete daily challenge
  const completeDailyChallenge = (challengeId) => {
    const updated = dailyChallenges.map((challenge) => {
      if (challenge.id === challengeId && !challenge.completed) {
        addPoints(challenge.points, 'challenges');
        addXP(challenge.xp);
        return { ...challenge, completed: true };
      }
      return challenge;
    });
    setDailyChallenges(updated);
  };

  // Purchase reward
  const purchaseReward = (rewardId) => {
    const reward = rewardsShopItems.find((item) => item.id === rewardId);

    if (!reward) return { success: false, message: 'Reward not found' };

    if (totalPoints < reward.cost) {
      return { success: false, message: 'Insufficient points' };
    }

    if (purchasedRewards.includes(rewardId)) {
      return { success: false, message: 'Already purchased' };
    }

    setTotalPoints(totalPoints - reward.cost);
    setPurchasedRewards([...purchasedRewards, rewardId]);

    return { success: true, message: 'Reward purchased!' };
  };

  // Get current level progress
  const getLevelProgress = () => {
    const currentLevelData = levels.find((l) => l.level === userLevel);
    const progress = (userXP / currentLevelData.xpRequired) * 100;
    return {
      progress,
      currentXP: userXP,
      requiredXP: currentLevelData.xpRequired,
      title: currentLevelData.title,
    };
  };

  // Get leaderboard data (mock for now)
  const getLeaderboardData = (type = 'global') => {
    // Mock leaderboard data
    const mockUsers = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        location: 'Port Louis',
        points: 15420,
        level: 45,
        activities: 234,
      },
      {
        id: '2',
        name: 'Mike Chen',
        avatar: 'https://i.pravatar.cc/150?img=2',
        location: 'Flic en Flac',
        points: 14850,
        level: 43,
        activities: 218,
      },
      {
        id: '3',
        name: 'Emma Davis',
        avatar: 'https://i.pravatar.cc/150?img=3',
        location: 'Grand Baie',
        points: 14320,
        level: 42,
        activities: 205,
      },
      {
        id: '4',
        name: 'Current User',
        avatar: 'https://i.pravatar.cc/150?img=4',
        location: 'Curepipe',
        points: totalPoints,
        level: userLevel,
        activities: 156,
        isCurrentUser: true,
      },
      {
        id: '5',
        name: 'Alex Kumar',
        avatar: 'https://i.pravatar.cc/150?img=5',
        location: 'Quatre Bornes',
        points: 12100,
        level: 38,
        activities: 145,
      },
      {
        id: '6',
        name: 'Lisa Anderson',
        avatar: 'https://i.pravatar.cc/150?img=6',
        location: 'Tamarin',
        points: 11450,
        level: 36,
        activities: 132,
      },
    ];

    return mockUsers.sort((a, b) => b.points - a.points);
  };

  const value = {
    // State
    userLevel,
    userXP,
    totalPoints,
    currentStreak,
    longestStreak,
    achievements,
    dailyChallenges,
    weeklyGoals,
    pointsBreakdown,
    levels,
    rewardsShopItems,
    purchasedRewards,

    // Functions
    addXP,
    addPoints,
    updateStreak,
    completeActivity,
    completeDailyChallenge,
    purchaseReward,
    getLevelProgress,
    getLeaderboardData,
    generateDailyChallenges,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

export default GamificationContext;
