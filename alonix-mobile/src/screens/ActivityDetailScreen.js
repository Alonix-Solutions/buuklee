import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
  Dimensions,
  Linking,
} from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import gpsService from '../services/gpsService';
import activityService from '../services/activityService';
import roommateService from '../services/roommateService';
import moment from 'moment';

const { width } = Dimensions.get('window');

const ActivityDetailScreen = ({ navigation, route }) => {
  const { challengeId, activity: initialActivity } = route.params || {};
  const { user } = useAuth();
  const {
    isActivityLiked,
    likeActivity,
    unlikeActivity,
    addComment,
    getActivityComments,
    shareActivity,
  } = useSocial();

  const [activity, setActivity] = useState(initialActivity);
  const [loading, setLoading] = useState(!initialActivity);
  const [joining, setJoining] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Roommate Feature State
  const [roommateRequests, setRoommateRequests] = useState([]);
  const [showRoommateForm, setShowRoommateForm] = useState(false);
  const [roommateForm, setRoommateForm] = useState({ accommodation: '', budget: '' });

  const loadRoommateRequests = async (id) => {
    try {
      const requests = await roommateService.getRequests(id);
      setRoommateRequests(requests || []);
    } catch (error) {
      console.log('Failed to load roommate requests', error);
      setRoommateRequests([]);
    }
  };

  const handleSubmitRoommateRequest = async () => {
    try {
      if (!roommateForm.accommodation || !roommateForm.budget) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const id = challengeId || activity.id || activity._id;
      await roommateService.createRequest({
        activityId: id,
        accommodation: { name: roommateForm.accommodation },
        budget: { max: parseFloat(roommateForm.budget) },
        preferences: { gender: 'Any' } // Default for now
      });

      setShowRoommateForm(false);
      setRoommateForm({ accommodation: '', budget: '' });
      Alert.alert('Success', 'Roommate request posted!');
      loadRoommateRequests(id);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to post request');
    }
  };

  useEffect(() => {
    if (challengeId && !initialActivity) {
      loadActivity();
    } else if (initialActivity) {
      checkParticipantStatus(initialActivity);
    }
    loadComments();
    if (challengeId || (activity && (activity.id || activity._id))) {
      const id = challengeId || activity.id || activity._id;
      loadRoommateRequests(id);
      setIsLiked(isActivityLiked(id));
    }
  }, [challengeId]);



  useEffect(() => {
    if (activity) {
      checkParticipantStatus(activity);
    }
  }, [activity, user]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const loadedActivity = await activityService.getActivity(challengeId);
      if (loadedActivity) {
        setActivity(loadedActivity);
        checkParticipantStatus(loadedActivity);
      } else {
        Alert.alert(
          'Not Found',
          'This activity could not be found. It may have been deleted.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Load activity error:', error);
      Alert.alert(
        'Error',
        'Failed to load activity details. Please check your connection.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const checkParticipantStatus = (act = activity) => {
    if (!act || !user) return;

    const userId = user._id || user.id;
    const organizerId = act.organizerId?._id || act.organizerId || act.organizerId?.toString();

    setIsOrganizer(organizerId?.toString() === userId?.toString());

    const participants = act.participants || [];
    const participant = participants.find(p => {
      const pId = p.userId?._id || p.userId || p.userId?.toString();
      return pId?.toString() === userId?.toString();
    });

    setIsParticipant(!!participant);
  };

  const handleJoin = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join activities');
      return;
    }

    try {
      setJoining(true);
      const updatedActivity = await activityService.joinActivity(challengeId || activity._id || activity.id);

      if (updatedActivity) {
        setActivity(updatedActivity);
        setIsParticipant(true);
        Alert.alert('Success', 'You have joined this activity!');
      }
    } catch (error) {
      console.error('Join error:', error);
      Alert.alert('Error', error.message || 'Failed to join activity');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      'Leave Activity',
      'Are you sure you want to leave this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await activityService.leaveActivity(challengeId || activity._id || activity.id);
              if (success) {
                setIsParticipant(false);
                // Reload activity to update participant count
                if (challengeId) {
                  await loadActivity();
                }
                Alert.alert('Success', 'You have left this activity');
              }
            } catch (error) {
              console.error('Leave error:', error);
              Alert.alert('Error', error.message || 'Failed to leave activity');
            }
          }
        }
      ]
    );
  };

  const handleStartSession = async () => {
    if (!isOrganizer) {
      Alert.alert('Error', 'Only the organizer can start the activity session');
      return;
    }

    Alert.alert(
      'Start Activity Session',
      'This will begin live tracking for all participants. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              const session = await activityService.startSession(challengeId || activity._id || activity.id);
              if (session) {
                navigation.navigate('LiveTracking', {
                  activityId: challengeId || activity._id || activity.id,
                  sessionId: session.id
                });
              }
            } catch (error) {
              console.error('Start session error:', error);
              Alert.alert('Error', error.message || 'Failed to start session');
            }
          }
        }
      ]
    );
  };

  const loadComments = () => {
    const activityComments = getActivityComments(activity.id);
    setComments(activityComments);
  };

  const handleLike = async () => {
    if (isLiked) {
      const result = await unlikeActivity(activity.id);
      if (result.success) {
        setIsLiked(false);
        setActivity((prev) => ({
          ...prev,
          likes: Math.max((prev.likes || 0) - 1, 0),
        }));
      }
    } else {
      const result = await likeActivity(activity.id, activity);
      if (result.success) {
        setIsLiked(true);
        setActivity((prev) => ({
          ...prev,
          likes: (prev.likes || 0) + 1,
        }));
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    const result = await addComment(activity.id, newComment.trim());

    if (result.success) {
      setComments([...comments, result.comment]);
      setActivity((prev) => ({
        ...prev,
        comments: (prev.comments || 0) + 1,
      }));
      setNewComment('');
    } else {
      Alert.alert('Error', result.error || 'Failed to add comment');
    }

    setIsSubmittingComment(false);
  };

  const handleShare = async () => {
    try {
      const message = `Check out my ${activity.type} activity!\n\nDistance: ${gpsService.formatDistance(
        activity.distance
      )}\nDuration: ${gpsService.formatDuration(activity.duration)}\nPace: ${gpsService.formatPace(
        activity.averagePace
      )}/km`;

      await Share.share({
        message,
        title: activity.title,
      });

      shareActivity(activity.id);
    } catch (error) {
      console.error('Error sharing activity:', error);
    }
  };

  const getActivityIcon = () => {
    const activityType = activity.activityType || activity.type;
    const icons = {
      running: 'walk',
      cycling: 'bicycle',
      hiking: 'trending-up',
      swimming: 'water',
      walking: 'walk',
    };
    return icons[activityType] || 'fitness';
  };

  const getActivityColor = () => {
    const activityType = activity.activityType || activity.type;
    const colors = {
      running: COLORS.running || COLORS.primary,
      cycling: COLORS.cycling || COLORS.primary,
      hiking: COLORS.hiking || COLORS.primary,
      swimming: COLORS.swimming || COLORS.primary,
      walking: COLORS.primary,
    };
    return colors[activityType] || COLORS.primary;
  };

  const formatDate = (timestamp) => {
    return moment(timestamp).format('MMMM D, YYYY [at] h:mm A');
  };

  const formatRelativeTime = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  const mapRegion =
    activity.route && activity.route.length > 0
      ? {
        latitude: activity.route[0].latitude,
        longitude: activity.route[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
      : {
        latitude: -1.286389,
        longitude: 36.817223,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

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
        <Text style={styles.headerTitle}>Activity</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {/* User Info */}
            <View style={styles.userSection}>
              <Image
                source={{ uri: activity.organizerId?.profilePhoto || activity.userAvatar || 'https://via.placeholder.com/50' }}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{activity.organizerId?.name || activity.userName || 'Organizer'}</Text>
                <Text style={styles.activityDate}>{formatDate(activity.date || activity.createdAt)}</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: getActivityColor() }]}>
                <Ionicons name={getActivityIcon()} size={20} color={COLORS.white} />
              </View>
            </View>

            {/* Title and Description */}
            <View style={styles.titleSection}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              {activity.description && (
                <Text style={styles.activityDescription}>{activity.description}</Text>
              )}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {!!activity.distance && (
                <View style={styles.statCard}>
                  <Ionicons name="fitness" size={24} color={COLORS.primary} />
                  <Text style={styles.statValue}>
                    {gpsService.formatDistance(activity.distance)}
                  </Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
              )}

              {!!activity.duration && (
                <View style={styles.statCard}>
                  <Ionicons name="time" size={24} color={COLORS.secondary} />
                  <Text style={styles.statValue}>
                    {gpsService.formatDuration(activity.duration)}
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              )}

              {!!activity.averagePace && (
                <View style={styles.statCard}>
                  <Ionicons name="speedometer" size={24} color={COLORS.accent} />
                  <Text style={styles.statValue}>
                    {gpsService.formatPace(activity.averagePace)}
                  </Text>
                  <Text style={styles.statLabel}>Avg Pace</Text>
                </View>
              )}

              {activity.difficulty && (
                <View style={styles.statCard}>
                  <Ionicons name="barbell" size={24} color={COLORS.warning} />
                  <Text style={styles.statValue}>{activity.difficulty}</Text>
                  <Text style={styles.statLabel}>Difficulty</Text>
                </View>
              )}
            </View>

            {/* Additional Stats */}
            {!!activity.elevation && (
              <View style={styles.elevationCard}>
                <Text style={styles.sectionTitle}>Elevation</Text>
                <View style={styles.elevationStats}>
                  <View style={styles.elevationItem}>
                    <Ionicons name="arrow-up" size={20} color={COLORS.accent} />
                    <Text style={styles.elevationValue}>
                      {Math.round(activity.elevation.gain || activity.elevation || 0)}m
                    </Text>
                    <Text style={styles.elevationLabel}>Gain</Text>
                  </View>
                  <View style={styles.elevationItem}>
                    <Ionicons name="trending-up" size={20} color={COLORS.gray} />
                    <Text style={styles.elevationValue}>
                      {Math.round(activity.elevation.max || activity.elevation || 0)}m
                    </Text>
                    <Text style={styles.elevationLabel}>Max</Text>
                  </View>
                  {activity.elevation.min !== null && activity.elevation.min !== undefined && (
                    <View style={styles.elevationItem}>
                      <Ionicons name="trending-down" size={20} color={COLORS.gray} />
                      <Text style={styles.elevationValue}>
                        {Math.round(activity.elevation.min)}m
                      </Text>
                      <Text style={styles.elevationLabel}>Min</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {activity && (activity.status === 'upcoming' || activity.status === 'live') && (
              <View style={styles.actionSection}>
                {isOrganizer && activity.status === 'upcoming' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleStartSession}
                  >
                    <Ionicons name="play" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Start Activity</Text>
                  </TouchableOpacity>
                )}

                {isOrganizer && activity.status === 'live' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => navigation.navigate('LiveTracking', {
                      activityId: challengeId || activity._id || activity.id
                    })}
                  >
                    <Ionicons name="location" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>View Live Tracking</Text>
                  </TouchableOpacity>
                )}

                {!isOrganizer && !isParticipant && activity.status === 'upcoming' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleJoin}
                    disabled={joining || activity.currentParticipants >= activity.maxParticipants}
                  >
                    {joining ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <>
                        <Ionicons name="person-add" size={20} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>
                          {activity.currentParticipants >= activity.maxParticipants ? 'Full' : 'Join Activity'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {!isOrganizer && isParticipant && activity.status === 'upcoming' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={handleLeave}
                  >
                    <Ionicons name="person-remove" size={20} color={COLORS.primary} />
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Leave Activity</Text>
                  </TouchableOpacity>
                )}

                {isParticipant && activity.status === 'live' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => navigation.navigate('LiveTracking', {
                      activityId: challengeId || activity._id || activity.id
                    })}
                  >
                    <Ionicons name="location" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Join Live Tracking</Text>
                  </TouchableOpacity>
                )}

                {/* Participants Count */}
                <View style={styles.participantsInfo}>
                  <Ionicons name="people" size={16} color={COLORS.gray} />
                  <Text style={styles.participantsText}>
                    {String(activity.currentParticipants || 0)} / {String(activity.maxParticipants || 0)} participants
                  </Text>
                </View>
              </View>
            )}

            {/* Transport Options */}
            {(isParticipant || !isOrganizer) && activity.status === 'upcoming' && (
              <View style={styles.transportSection}>
                <Text style={styles.sectionTitle}>🚗 Transport Options</Text>

                {/* Organizer's Ride */}
                {activity.transport?.organizerOffers?.available &&
                  activity.transport.organizerOffers.totalSeats > activity.transport.organizerOffers.bookedSeats && (
                    <View style={styles.transportCard}>
                      <View style={styles.transportHeader}>
                        <View style={styles.transportUserInfo}>
                          <Image
                            source={{ uri: activity.organizerId?.profilePhoto || 'https://via.placeholder.com/40' }}
                            style={styles.transportAvatar}
                          />
                          <View>
                            <Text style={styles.transportName}>
                              {activity.organizerId?.name || 'Organizer'}
                            </Text>
                            <Text style={styles.transportRole}>Organizer</Text>
                          </View>
                        </View>
                        <View style={styles.transportBadge}>
                          <Ionicons name="star" size={14} color={COLORS.warning} />
                        </View>
                      </View>

                      <View style={styles.transportDetails}>
                        <View style={styles.transportDetailRow}>
                          <Ionicons name="people" size={16} color={COLORS.gray} />
                          <Text style={styles.transportDetailText}>
                            {String(activity.transport.organizerOffers.totalSeats - activity.transport.organizerOffers.bookedSeats)} seats available
                          </Text>
                        </View>
                        <View style={styles.transportDetailRow}>
                          <Ionicons name="cash" size={16} color={COLORS.gray} />
                          <Text style={styles.transportDetailText}>
                            {activity.transport.organizerOffers.pricePerSeat > 0
                              ? `Rs ${String(activity.transport.organizerOffers.pricePerSeat)}/seat`
                              : 'Free'}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.transportBookButton}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.transportBookText}>Request Seat</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                      </TouchableOpacity>
                    </View>
                  )}

                {/* Taxi Option */}
                <TouchableOpacity
                  style={styles.transportCard}
                  onPress={() => navigation.navigate('RideRequest', {
                    activityId: challengeId || activity._id || activity.id,
                    destination: activity.meetingPoint,
                    activityName: activity.title
                  })}
                  activeOpacity={0.8}
                >
                  <View style={styles.transportHeader}>
                    <View style={styles.transportUserInfo}>
                      <View style={styles.taxiIcon}>
                        <Ionicons name="car" size={24} color={COLORS.primary} />
                      </View>
                      <View>
                        <Text style={styles.transportName}>Book a Taxi</Text>
                        <Text style={styles.transportRole}>To meeting point</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                  </View>
                </TouchableOpacity>

                {/* Offer Ride Option */}
                {isParticipant && (
                  <TouchableOpacity
                    style={[styles.transportCard, styles.offerRideCard]}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('CreateRide')}
                  >
                    <View style={styles.transportHeader}>
                      <View style={styles.transportUserInfo}>
                        <View style={styles.offerRideIcon}>
                          <Ionicons name="car-sport" size={20} color={COLORS.white} />
                        </View>
                        <View>
                          <Text style={styles.transportName}>Offer a Ride</Text>
                          <Text style={styles.transportRole}>Have extra seats?</Text>
                        </View>
                      </View>
                      <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Accommodation Options */}
            {(isParticipant || !isOrganizer) && activity.status === 'upcoming' && activity.meetingPoint && (
              <View style={styles.accommodationSection}>
                <Text style={styles.sectionTitle}>🏨 Nearby Accommodation</Text>
                <Text style={styles.sectionSubtitle}>
                  Need a place to stay? Book hotels near the meeting point
                </Text>

                {/* Sample Nearby Hotels */}
                <View style={styles.hotelsList}>
                  <TouchableOpacity
                    style={styles.hotelCard}
                    onPress={() => {
                      const message = encodeURIComponent(
                        `Hi! I'm interested in booking a room for the activity "${activity.title}" on ${activity.date ? new Date(activity.date).toLocaleDateString() : 'upcoming date'}.\n\nActivity location: ${activity.meetingPoint?.address}\n\nPlease let me know about availability and pricing. Thank you!`
                      );
                      Linking.openURL(`https://wa.me/2301234567?text=${message}`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: 'https://via.placeholder.com/100x80' }}
                      style={styles.hotelImage}
                    />
                    <View style={styles.hotelInfo}>
                      <Text style={styles.hotelName}>Nearby Hotel</Text>
                      <View style={styles.hotelDetailRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                        <Text style={styles.hotelDistance}>2.5 km from meeting point</Text>
                      </View>
                      <View style={styles.hotelDetailRow}>
                        <Ionicons name="cash-outline" size={14} color={COLORS.gray} />
                        <Text style={styles.hotelPrice}>From Rs 2,500/night</Text>
                      </View>
                    </View>
                    <View style={styles.whatsappBadge}>
                      <Ionicons name="logo-whatsapp" size={20} color={COLORS.success} />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.hotelCard}
                    onPress={() => {
                      const message = encodeURIComponent(
                        `Hi! I'm interested in booking accommodation for "${activity.title}".\n\nDate: ${activity.date ? new Date(activity.date).toLocaleDateString() : 'TBD'}\nLocation: ${activity.meetingPoint?.address}\n\nPlease share availability and rates.`
                      );
                      Linking.openURL(`https://wa.me/2301234567?text=${message}`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: 'https://via.placeholder.com/100x80' }}
                      style={styles.hotelImage}
                    />
                    <View style={styles.hotelInfo}>
                      <Text style={styles.hotelName}>Budget Inn</Text>
                      <View style={styles.hotelDetailRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                        <Text style={styles.hotelDistance}>3.8 km from meeting point</Text>
                      </View>
                      <View style={styles.hotelDetailRow}>
                        <Ionicons name="cash-outline" size={14} color={COLORS.gray} />
                        <Text style={styles.hotelPrice}>From Rs 1,800/night</Text>
                      </View>
                    </View>
                    <View style={styles.whatsappBadge}>
                      <Ionicons name="logo-whatsapp" size={20} color={COLORS.success} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Roommate Matching */}
                {isParticipant && (
                  <View style={styles.roommateSection}>
                    <View style={styles.roommatHeader}>
                      <Text style={styles.roommateTitle}>💰 Looking for Roommates?</Text>
                      <Text style={styles.roommateSubtext}>Split costs with other participants</Text>
                    </View>

                    {/* Roommate Requests List */}
                    {roommateRequests.length > 0 ? (
                      roommateRequests.map((req, index) => (
                        <View key={index} style={styles.roommateCard}>
                          <Image
                            source={{ uri: req.userId?.profilePhoto || 'https://via.placeholder.com/40' }}
                            style={styles.roommateAvatar}
                          />
                          <View style={styles.roommateInfo}>
                            <Text style={styles.roommateName}>{req.userId?.name || 'Participant'}</Text>
                            <Text style={styles.roommateHotel}>
                              {req.accommodation?.name || 'Any Hotel'} • {req.budget ? `Budget: Rs ${req.budget.max}` : 'Flexible'}
                            </Text>
                            <View style={styles.costSplit}>
                              <Text style={styles.costSplitText}>
                                Prefers: {req.preferences?.gender} • {req.preferences?.smoking ? 'Smoker' : 'Non-smoker'}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.requestButton}
                            activeOpacity={0.8}
                            onPress={() => {
                              Linking.openURL(`https://wa.me/2301234567?text=Hi, I saw you are looking for a roommate for ${activity.title}!`);
                            }}
                          >
                            <Ionicons name="chatbubble" size={16} color={COLORS.white} />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={{ textAlign: 'center', color: COLORS.gray, marginVertical: 10 }}>
                        No one is looking yet. Be the first!
                      </Text>
                    )}

                    {/* Add Request Form */}
                    {!showRoommateForm ? (
                      <TouchableOpacity
                        style={styles.offerRoommateButton}
                        activeOpacity={0.8}
                        onPress={() => setShowRoommateForm(true)}
                      >
                        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.offerRoommateText}>I'm looking for a roommate too!</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ marginTop: 10 }}>
                        <Text style={styles.label}>Where do you plan to stay?</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Nearby Hotel or 'Any'"
                          value={roommateForm.accommodation}
                          onChangeText={(t) => setRoommateForm({ ...roommateForm, accommodation: t })}
                        />
                        <Text style={styles.label}>Max Budget (Rs)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. 2000"
                          keyboardType="numeric"
                          value={roommateForm.budget}
                          onChangeText={(t) => setRoommateForm({ ...roommateForm, budget: t })}
                        />
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton, { flex: 1 }]}
                            onPress={() => setShowRoommateForm(false)}
                          >
                            <Text style={{ color: COLORS.darkGray }}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton, { flex: 1 }]}
                            onPress={handleSubmitRoommateRequest}
                          >
                            <Text style={{ color: COLORS.white }}>Post</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.accommodationNote}>
                  <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.accommodationNoteText}>
                    Tap any hotel to book via WhatsApp. Prices and availability are indicative.
                  </Text>
                </View>
              </View>
            )}

            {/* Route Map */}
            {activity.route && activity.route.length > 0 && (
              <View style={styles.mapSection}>
                <Text style={styles.sectionTitle}>Route</Text>
                <View style={styles.mapContainer}>
                  <MapView style={styles.map} initialRegion={mapRegion} scrollEnabled={false}>
                    <Polyline
                      coordinates={activity.route}
                      strokeColor={getActivityColor()}
                      strokeWidth={4}
                    />
                  </MapView>
                </View>
              </View>
            )}

            {/* Photos */}
            {activity.photos && activity.photos.length > 0 && (
              <View style={styles.photosSection}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(event) => {
                    const index = Math.round(
                      event.nativeEvent.contentOffset.x / width
                    );
                    setSelectedPhotoIndex(index);
                  }}
                  scrollEventThrottle={16}
                >
                  {activity.photos.map((photo, index) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.activityPhoto}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
                {activity.photos.length > 1 && (
                  <View style={styles.photoIndicator}>
                    {activity.photos.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.photoIndicatorDot,
                          index === selectedPhotoIndex && styles.photoIndicatorDotActive,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Engagement Stats */}
            <View style={styles.engagementSection}>
              <TouchableOpacity style={styles.engagementButton} onPress={handleLike}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isLiked ? COLORS.error : COLORS.gray}
                />
                <Text style={styles.engagementText}>{String(activity.likes || 0)}</Text>
              </TouchableOpacity>

              <View style={styles.engagementButton}>
                <Ionicons name="chatbubble-outline" size={28} color={COLORS.gray} />
                <Text style={styles.engagementText}>{String(activity.comments || 0)}</Text>
              </View>
            </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionTitle}>
                Comments ({String(comments.length)})
              </Text>

              {/* Comment Input */}
              <View style={styles.commentInputContainer}>
                <Image source={{ uri: user?.avatar }} style={styles.commentAvatar} />
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons
                      name="send"
                      size={24}
                      color={newComment.trim() ? COLORS.primary : COLORS.lightGray}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Image
                      source={{ uri: comment.userAvatar }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUserName}>{comment.userName}</Text>
                        <Text style={styles.commentTime}>
                          {formatRelativeTime(comment.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noComments}>
                  <Ionicons name="chatbubbles-outline" size={48} color={COLORS.lightGray} />
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                  <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                </View>
              )}
            </View>

            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activityDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  activityBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  activityTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: COLORS.white,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  statCard: {
    width: '50%',
    padding: 15,
    alignItems: 'center',
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
  elevationCard: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  elevationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  elevationItem: {
    alignItems: 'center',
  },
  elevationValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 4,
  },
  elevationLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  mapSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    ...SHADOW_MEDIUM,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  map: {
    flex: 1,
  },
  photosSection: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    paddingTop: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  activityPhoto: {
    width: width,
    height: 300,
  },
  photoIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  photoIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 4,
  },
  photoIndicatorDotActive: {
    backgroundColor: COLORS.primary,
  },
  engagementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    marginTop: 8,
    gap: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engagementText: {
    fontSize: SIZES.md,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  commentsSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    maxHeight: 80,
  },
  sendButton: {
    padding: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  commentTime: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
  },
  commentText: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noCommentsText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  actionSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.primaryLight + '20',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 6,
  },
  participantsText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  transportSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  transportCard: {
    backgroundColor: COLORS.lightestGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transportUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transportAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  transportName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  transportRole: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginTop: 2,
  },
  transportBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transportDetails: {
    marginBottom: 12,
  },
  transportDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  transportDetailText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  transportBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  transportBookText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  taxiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerRideCard: {
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
  },
  offerRideIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accommodationSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: 16,
  },
  hotelsList: {
    marginBottom: 20,
  },
  hotelCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightestGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  hotelImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  hotelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hotelName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  hotelDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  hotelDistance: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
  },
  hotelPrice: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    fontWeight: '600',
  },
  whatsappBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  roommateSection: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  roommatHeader: {
    marginBottom: 12,
  },
  roommateTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  roommateSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  roommateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  roommateAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  roommateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roommateName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  roommateHotel: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginBottom: 6,
  },
  costSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costSplitText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  savingsBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  requestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerRoommateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  offerRoommateText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  accommodationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  accommodationNoteText: {
    flex: 1,
    fontSize: SIZES.xs,
    color: COLORS.darkGray,
    lineHeight: 16,
  },
});

export default ActivityDetailScreen;
