import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { capitalize } from '../utils/helpers';
import { useAuth } from './AuthContext';

const SocialContext = createContext({});

export const SocialProvider = ({ children }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [likedActivities, setLikedActivities] = useState([]);
  const [feed, setFeed] = useState([]);
  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load social data on mount
  useEffect(() => {
    if (user) {
      loadSocialData();
    }
  }, [user]);

  // Load social data from AsyncStorage
  const loadSocialData = async () => {
    try {
      const [followingData, followersData, likedData, feedData, commentsData] =
        await Promise.all([
          AsyncStorage.getItem('@following'),
          AsyncStorage.getItem('@followers'),
          AsyncStorage.getItem('@liked_activities'),
          AsyncStorage.getItem('@feed'),
          AsyncStorage.getItem('@comments'),
        ]);

      if (followingData) setFollowing(JSON.parse(followingData));
      if (followersData) setFollowers(JSON.parse(followersData));
      if (likedData) setLikedActivities(JSON.parse(likedData));
      if (feedData) setFeed(JSON.parse(feedData));
      if (commentsData) setComments(JSON.parse(commentsData));
    } catch (error) {
      console.error('Error loading social data:', error);
    }
  };

  // Follow a user
  const followUser = async (userId, userData) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // await socialAPI.followUser(userId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newFollowing = [
        ...following,
        {
          id: userId,
          ...userData,
          followedAt: Date.now(),
        },
      ];

      setFollowing(newFollowing);
      await AsyncStorage.setItem('@following', JSON.stringify(newFollowing));

      return { success: true };
    } catch (error) {
      console.error('Error following user:', error);
      return {
        success: false,
        error: error.message || 'Failed to follow user',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // await socialAPI.unfollowUser(userId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newFollowing = following.filter((u) => u.id !== userId);

      setFollowing(newFollowing);
      await AsyncStorage.setItem('@following', JSON.stringify(newFollowing));

      return { success: true };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return {
        success: false,
        error: error.message || 'Failed to unfollow user',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if following a user
  const isFollowing = (userId) => {
    return following.some((u) => u.id === userId);
  };

  // Get following list
  const getFollowing = () => {
    return following;
  };

  // Get followers list
  const getFollowers = () => {
    return followers;
  };

  // Like an activity
  const likeActivity = async (activityId, activityData) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // await socialAPI.likeActivity(activityId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newLikedActivities = [
        ...likedActivities,
        {
          id: activityId,
          ...activityData,
          likedAt: Date.now(),
        },
      ];

      setLikedActivities(newLikedActivities);
      await AsyncStorage.setItem(
        '@liked_activities',
        JSON.stringify(newLikedActivities)
      );

      // Update feed if activity exists there
      const updatedFeed = feed.map((item) => {
        if (item.id === activityId) {
          return {
            ...item,
            likes: (item.likes || 0) + 1,
            isLiked: true,
          };
        }
        return item;
      });

      setFeed(updatedFeed);
      await AsyncStorage.setItem('@feed', JSON.stringify(updatedFeed));

      return { success: true };
    } catch (error) {
      console.error('Error liking activity:', error);
      return {
        success: false,
        error: error.message || 'Failed to like activity',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Unlike an activity
  const unlikeActivity = async (activityId) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // await socialAPI.unlikeActivity(activityId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newLikedActivities = likedActivities.filter(
        (a) => a.id !== activityId
      );

      setLikedActivities(newLikedActivities);
      await AsyncStorage.setItem(
        '@liked_activities',
        JSON.stringify(newLikedActivities)
      );

      // Update feed if activity exists there
      const updatedFeed = feed.map((item) => {
        if (item.id === activityId) {
          return {
            ...item,
            likes: Math.max((item.likes || 0) - 1, 0),
            isLiked: false,
          };
        }
        return item;
      });

      setFeed(updatedFeed);
      await AsyncStorage.setItem('@feed', JSON.stringify(updatedFeed));

      return { success: true };
    } catch (error) {
      console.error('Error unliking activity:', error);
      return {
        success: false,
        error: error.message || 'Failed to unlike activity',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if activity is liked
  const isActivityLiked = (activityId) => {
    return likedActivities.some((a) => a.id === activityId);
  };

  // Get liked activities
  const getLikedActivities = () => {
    return likedActivities;
  };

  // Add comment to activity
  const addComment = async (activityId, commentText) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // await socialAPI.addComment(activityId, commentText);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newComment = {
        id: `comment_${Date.now()}`,
        activityId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        text: commentText,
        createdAt: Date.now(),
      };

      const activityComments = comments[activityId] || [];
      const updatedComments = {
        ...comments,
        [activityId]: [...activityComments, newComment],
      };

      setComments(updatedComments);
      await AsyncStorage.setItem('@comments', JSON.stringify(updatedComments));

      // Update feed comment count
      const updatedFeed = feed.map((item) => {
        if (item.id === activityId) {
          return {
            ...item,
            comments: (item.comments || 0) + 1,
          };
        }
        return item;
      });

      setFeed(updatedFeed);
      await AsyncStorage.setItem('@feed', JSON.stringify(updatedFeed));

      return { success: true, comment: newComment };
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        success: false,
        error: error.message || 'Failed to add comment',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete comment
  const deleteComment = async (activityId, commentId) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // await socialAPI.deleteComment(commentId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const activityComments = comments[activityId] || [];
      const updatedActivityComments = activityComments.filter(
        (c) => c.id !== commentId
      );

      const updatedComments = {
        ...comments,
        [activityId]: updatedActivityComments,
      };

      setComments(updatedComments);
      await AsyncStorage.setItem('@comments', JSON.stringify(updatedComments));

      // Update feed comment count
      const updatedFeed = feed.map((item) => {
        if (item.id === activityId) {
          return {
            ...item,
            comments: Math.max((item.comments || 0) - 1, 0),
          };
        }
        return item;
      });

      setFeed(updatedFeed);
      await AsyncStorage.setItem('@feed', JSON.stringify(updatedFeed));

      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete comment',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Get comments for activity
  const getActivityComments = (activityId) => {
    return comments[activityId] || [];
  };

  // Get feed
  const getFeed = async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // const response = await socialAPI.getFeed(page, limit);

      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate mock feed if empty
      if (feed.length === 0 && page === 1) {
        const mockFeed = generateMockFeed();
        setFeed(mockFeed);
        await AsyncStorage.setItem('@feed', JSON.stringify(mockFeed));
        return { success: true, data: mockFeed };
      }

      return { success: true, data: feed };
    } catch (error) {
      console.error('Error getting feed:', error);
      return {
        success: false,
        error: error.message || 'Failed to load feed',
        data: [],
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh feed
  const refreshFeed = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // const response = await socialAPI.getFeed(1, 20);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newFeed = generateMockFeed();
      setFeed(newFeed);
      await AsyncStorage.setItem('@feed', JSON.stringify(newFeed));

      return { success: true, data: newFeed };
    } catch (error) {
      console.error('Error refreshing feed:', error);
      return {
        success: false,
        error: error.message || 'Failed to refresh feed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Share activity
  const shareActivity = async (activityId, platform = 'native') => {
    try {
      // TODO: Implement actual sharing functionality
      // This would use react-native-share or similar

      console.log(`Sharing activity ${activityId} to ${platform}`);

      return { success: true };
    } catch (error) {
      console.error('Error sharing activity:', error);
      return {
        success: false,
        error: error.message || 'Failed to share activity',
      };
    }
  };

  // Generate mock feed data
  const generateMockFeed = () => {
    const activityTypes = ['running', 'cycling', 'hiking', 'swimming'];
    const mockUsers = [
      {
        id: 'user_1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      {
        id: 'user_2',
        name: 'Mike Chen',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      {
        id: 'user_3',
        name: 'Emma Davis',
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
      {
        id: 'user_4',
        name: 'Alex Martinez',
        avatar: 'https://i.pravatar.cc/150?img=7',
      },
    ];

    return Array.from({ length: 10 }, (_, i) => {
      const mockUser = mockUsers[i % mockUsers.length];
      const activityType = activityTypes[i % activityTypes.length];

      return {
        id: `activity_${i + 1}`,
        userId: mockUser.id,
        userName: mockUser.name,
        userAvatar: mockUser.avatar,
        type: activityType,
        title: `${capitalize(activityType)} Session`,
        description: 'Great workout today! Feeling energized 💪',
        distance: 5000 + Math.random() * 10000,
        duration: 1800000 + Math.random() * 3600000,
        averagePace: 5 + Math.random() * 3,
        photos: i % 3 === 0 ? ['https://picsum.photos/400/300?random=' + i] : [],
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        isLiked: Math.random() > 0.5,
        createdAt: Date.now() - i * 3600000,
        route: generateMockRoute(),
      };
    });
  };

  // Generate mock route coordinates
  const generateMockRoute = () => {
    const centerLat = -1.286389;
    const centerLng = 36.817223;
    const points = 20;

    return Array.from({ length: points }, (_, i) => ({
      latitude: centerLat + (Math.random() - 0.5) * 0.01,
      longitude: centerLng + (Math.random() - 0.5) * 0.01,
    }));
  };

  const value = {
    following,
    followers,
    likedActivities,
    feed,
    isLoading,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowing,
    getFollowers,
    likeActivity,
    unlikeActivity,
    isActivityLiked,
    getLikedActivities,
    addComment,
    deleteComment,
    getActivityComments,
    getFeed,
    refreshFeed,
    shareActivity,
  };

  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
};

// Custom hook to use social context
export const useSocial = () => {
  const context = useContext(SocialContext);

  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }

  return context;
};

export default SocialContext;
