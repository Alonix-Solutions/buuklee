import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatElevation,
} from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import socketService from '../services/socketService';
import gpsService from '../services/gpsService';
import healthService from '../services/healthService';
import ErrorBoundary from '../components/ErrorBoundary';

const LiveTrackingScreen = ({ route, navigation }) => {
  const { activityId, sessionId } = route.params || {};
  const { user } = useAuth();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);
  // Initial loading state
  const [loadingState, setLoadingState] = useState('Initializing...');
  const [participants, setParticipants] = useState([]);
  const [groupStats, setGroupStats] = useState({});
  const [myLocation, setMyLocation] = useState(null);
  const [myRoute, setMyRoute] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [heartRate, setHeartRate] = useState(null);
  const [heartRateQuality, setHeartRateQuality] = useState('good');
  const locationUpdateInterval = useRef(null);

  const cleanup = () => {
    setIsTracking(false);
    if (locationUpdateInterval.current) {
      locationUpdateInterval.current(); // This is now the unsubscribe function
    }
    gpsService.stopTracking();
    healthService.stopHeartRateMonitoring(); // Stop HR monitoring
    if (activityId) {
      socketService.leaveActivity(activityId);
      removeSocketListeners();
    }
  };



  const initTracking = async () => {
    try {
      // Show map immediately
      setLoading(false);

      // Connect to socket in background
      const token = await require('../services/api').default.getToken();
      if (token) {
        socketService.connect(token).catch(err => {
          console.log('Socket connection failed:', err.message);
        });
      }

      // Join activity room
      if (user && activityId) {
        socketService.joinActivity(activityId, user._id || user.id);
      }

      // Setup socket listeners
      setupSocketListeners();

      // Load session data in background (don't wait)
      loadSessionData().catch(err => {
        console.error('Failed to load session data:', err);
      });

      // Start location tracking in background
      startLocationTracking().catch(err => {
        console.error('Failed to start tracking:', err);
      });

    } catch (error) {
      console.error('Initialize tracking error:', error);
      setLoading(false);
    }
  };
  const StatCard = ({ icon, label, value, unit }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ParticipantRow = React.memo(({ participant, rank }) => {
    const stats = participant.stats || {};
    const health = participant.health || {}; // Get health data
    const location = participant.currentLocation?.coordinates || [0, 0];

    // Determine battery icon and color
    const getBatteryIcon = (level) => {
      if (level >= 80) return { name: 'battery-full', color: COLORS.success };
      if (level >= 50) return { name: 'battery-half', color: COLORS.success };
      if (level >= 20) return { name: 'battery-dead', color: COLORS.warning };
      return { name: 'battery-dead', color: COLORS.error };
    };

    const battery = getBatteryIcon(health.batteryLevel || 100);

    return (
      <View style={styles.participantRow}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        <Image
          source={{ uri: participant.userId?.profilePhoto || 'https://via.placeholder.com/40' }}
          style={styles.participantPhoto}
        />
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{participant.userName || participant.userId?.name || 'Participant'}</Text>
          <View style={styles.participantStats}>
            <Text style={styles.participantStat}>
              {formatDistance(stats.distance || 0)}
            </Text>
            <Text style={styles.participantStat}> • </Text>
            <Text style={styles.participantStat}>
              {health.steps || 0} steps
            </Text>
          </View>
        </View>

        <View style={styles.rightStats}>
          {health.heartRate > 0 && (
            <View style={styles.statBadge}>
              <Ionicons name="heart" size={14} color={COLORS.error} />
              <Text style={styles.statBadgeText}>{health.heartRate}</Text>
            </View>
          )}

          {(health.batteryLevel !== undefined) && (
            <View style={styles.statBadge}>
              <Ionicons name={battery.name} size={14} color={battery.color} />
              <Text style={styles.statBadgeText}>{health.batteryLevel}%</Text>
            </View>
          )}
        </View>
      </View>
    );
  }, (prevProps, nextProps) => {
    // Only re-render if rank or relevant participant data changed
    return prevProps.rank === nextProps.rank &&
      prevProps.participant.stats?.distance === nextProps.participant.stats?.distance &&
      prevProps.participant.health?.heartRate === nextProps.participant.health?.heartRate &&
      prevProps.participant.health?.batteryLevel === nextProps.participant.health?.batteryLevel;
  });





  const loadSessionData = async () => {
    try {
      const sessionData = await activityService.getSessionParticipants(activityId);
      if (sessionData) {
        setParticipants(sessionData.participants || []);
        setGroupStats(sessionData.groupStats || {});
      }
    } catch (error) {
      console.error('Load session data error:', error);
      // If no active session, start with empty participants
      // This is OK - participants will join via socket
      setParticipants([]);
      setGroupStats({});
    }
  };

  const setupSocketListeners = () => {
    // Listen for participant location updates
    socketService.on('participant-location', (data) => {
      setParticipants((prev) => {
        const updated = [...prev];

        // data.location is sent as [lng, lat]
        const coords = Array.isArray(data.location)
          ? data.location
          : Array.isArray(data.location?.coordinates)
            ? data.location.coordinates
            : null;

        if (!coords || coords.length < 2) {
          return updated;
        }

        const idStr = String(data.userId);
        const index = updated.findIndex((p) =>
          (p.userId?._id || p.userId || p.userId?.toString()) === idStr
        );

        if (index !== -1) {
          const existing = updated[index];
          const existingRoute = existing.route?.coordinates || [];

          updated[index] = {
            ...existing,
            currentLocation: {
              type: 'Point',
              coordinates: coords,
            },
            route: {
              type: 'LineString',
              coordinates: [...existingRoute, coords],
            },
            stats: { ...existing.stats, ...data.stats },
            health: { ...existing.health, ...data.health }, // Update health data
            lastUpdate: new Date(),
          };
        } else {
          // Participant not yet in local state: add them with initial route
          updated.push({
            userId: data.userId,
            userName: data.userName,
            currentLocation: {
              type: 'Point',
              coordinates: coords,
            },
            route: {
              type: 'LineString',
              coordinates: [coords],
            },
            stats: data.stats || {},
            health: data.health || {},
            lastUpdate: new Date(),
          });
        }

        return updated;
      });
    });

    // Listen for group stats updates
    socketService.on('group-stats', (data) => {
      setGroupStats(data.stats || {});
    });

    // Listen for safety alerts
    socketService.on('safety-alert', (data) => {
      Alert.alert('Safety Alert', data.message || 'Safety alert detected');
    });

    // Listen for emergency alerts
    socketService.on('emergency-alert', (data) => {
      Alert.alert(
        '🚨 EMERGENCY ALERT',
        `${data.userName} has triggered an SOS alert!`,
        [
          {
            text: 'View Location', onPress: () => {
              // Navigate to location or show on map
            }
          },
          { text: 'OK' }
        ]
      );
    });

    // Listen for session started
    socketService.on('session-started', (data) => {
      Alert.alert('Session Started', 'Activity session has begun!');
      loadSessionData();
    });

    // Listen for session ended
    socketService.on('session-ended', (data) => {
      Alert.alert('Session Ended', 'Activity session has ended.');
      cleanup();
      navigation.goBack();
    });
  };

  const removeSocketListeners = () => {
    socketService.off('participant-location');
    socketService.off('group-stats');
    socketService.off('safety-alert');
    socketService.off('emergency-alert');
    socketService.off('session-started');
    socketService.off('session-ended');
  };

  const startLocationTracking = async () => {
    try {
      const hasPermission = await gpsService.requestPermissions();
      if (!hasPermission.foreground) {
        Alert.alert('Permission Required', 'Location permission is required for live tracking');
        return;
      }

      setIsTracking(true);

      // Start GPS tracking
      // Subscribe to GPS updates
      const unsubscribe = gpsService.subscribe(async (data) => {
        const { location, activity: activityStats } = data;
        setMyLocation(location);

        // Update local route path state
        const currentStats = gpsService.getCurrentActivityStats();
        if (currentStats && currentStats.locations) {
          const routePoints = currentStats.locations.map(loc => ({
            latitude: loc.latitude,
            longitude: loc.longitude
          }));
          setMyRoute(routePoints);
        }

        // Send location update via socket
        if (
          user &&
          activityId &&
          socketService.socket?.connected &&
          location &&
          typeof location.latitude === 'number' && !isNaN(location.latitude) &&
          typeof location.longitude === 'number' && !isNaN(location.longitude)
        ) {
          socketService.sendLocationUpdate(
            activityId,
            user._id || user.id,
            {
              longitude: location.longitude,
              latitude: location.latitude
            },
            {
              distance: activityStats.totalDistance || 0,
              duration: activityStats.totalTime || 0,
              pace: activityStats.averagePace || 0,
              speed: activityStats.averageSpeed || 0,
              elevation: activityStats.maxAltitude || 0,
              calories: activityStats.calories || 0,
            },
            {
              heartRate: data.health?.heartRate || 0,
              steps: data.health?.steps || 0,
              batteryLevel: data.health?.batteryLevel || 100
            }
          );
        }
      });

      // Store unsubscribe function to clean up later
      locationUpdateInterval.current = unsubscribe;

      // Start GPS tracking
      await gpsService.startTracking();

    } catch (error) {
      console.error('Start location tracking error:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const handleSOS = () => {
    Alert.alert(
      '🚨 Emergency SOS',
      'Are you sure you want to trigger an emergency alert? This will notify all participants.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            if (user && activityId && myLocation) {
              socketService.sendSOSAlert(
                activityId,
                user._id || user.id,
                {
                  longitude: myLocation.longitude,
                  latitude: myLocation.latitude
                },
                'Emergency SOS triggered'
              );
            }
          }
        }
      ]
    );
  };



  useEffect(() => {
    if (activityId) {
      initTracking();
    }

    return () => {
      cleanup();
    };
  }, [activityId]);

  // Calculate map region from participants - memoize to avoid recalculation
  const mapRegion = React.useMemo(() => {
    if (participants.length === 0 && myLocation) {
      return {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const coords = participants
      .filter(p => p.currentLocation?.coordinates)
      .map(p => ({
        latitude: p.currentLocation.coordinates[1],
        longitude: p.currentLocation.coordinates[0]
      }));

    if (coords.length === 0) {
      return {
        latitude: -20.4425,
        longitude: 57.3205,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const lats = coords.map(c => c.latitude);
    const lngs = coords.map(c => c.longitude);

    return {
      latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
      longitude: (Math.max(...lngs) + Math.min(...lngs)) / 2,
      latitudeDelta: Math.max(...lats) - Math.min(...lats) + 0.01,
      longitudeDelta: Math.max(...lngs) - Math.min(...lngs) + 0.01,
    };
  }, [participants, myLocation]);

  // Sort participants by distance for leaderboard - memoize to avoid re-sorting
  const sortedParticipants = React.useMemo(() => {
    return [...participants].sort((a, b) => {
      const distA = a.stats?.distance || 0;
      const distB = b.stats?.distance || 0;
      return distB - distA;
    });
  }, [participants]);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Live Map View */}
        <MapView
          key="live-tracking-map"
          style={styles.map}
          initialRegion={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          loadingEnabled={true}
          loadingIndicatorColor={COLORS.primary}
          loadingBackgroundColor={COLORS.white}
        >
          {/* My Route Path */}
          {myRoute.length > 1 && (
            <Polyline
              coordinates={myRoute}
              strokeColor={COLORS.secondary} // Different color for my path
              strokeWidth={4}
            />
          )}

          {/* Participant Routes */}
          {participants.map((participant) => {
            if (!participant.route?.coordinates || participant.route.coordinates.length < 2) return null;

            const routeCoords = participant.route.coordinates.map(coord => ({
              latitude: coord[1],
              longitude: coord[0]
            }));

            return (
              <Polyline
                key={participant.userId?._id || participant.userId}
                coordinates={routeCoords}
                strokeColor={COLORS.primary}
                strokeWidth={3}
              />
            );
          })}

          {/* Participant Markers */}
          {sortedParticipants.map((participant, index) => {
            const coords = participant.currentLocation?.coordinates;
            if (!coords || coords.length < 2) return null;

            const isMe = (participant.userId?._id || participant.userId) === (user?._id || user?.id);
            const rank = index + 1;

            return (
              <Marker
                key={participant.userId?._id || participant.userId}
                coordinate={{
                  latitude: coords[1],
                  longitude: coords[0]
                }}
                title={participant.userName || participant.userId?.name}
                description={`Rank: ${rank} • ${formatDistance(participant.stats?.distance || 0)}`}
                tracksViewChanges={false}
              >
                <View style={styles.markerContainer}>
                  <Image
                    source={{ uri: participant.userId?.profilePhoto || 'https://via.placeholder.com/40' }}
                    style={[
                      styles.markerPhoto,
                      {
                        borderColor: rank === 1 ? COLORS.warning : isMe ? COLORS.primary : COLORS.white,
                        borderWidth: rank === 1 || isMe ? 3 : 2
                      }
                    ]}
                  />
                  <View style={styles.markerArrow} />
                  {isMe && (
                    <View style={styles.meBadge}>
                      <Text style={styles.meBadgeText}>YOU</Text>
                    </View>
                  )}
                </View>
              </Marker>
            );
          })}

          {/* My Location Marker */}
          {myLocation && !sortedParticipants.find(p =>
            (p.userId?._id || p.userId) === (user?._id || user?.id)
          ) && (
              <Marker
                coordinate={myLocation}
                title="You"
                tracksViewChanges={false}
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.markerPhoto, { backgroundColor: COLORS.primary, borderColor: COLORS.primary, borderWidth: 3 }]} />
                  <View style={styles.markerArrow} />
                </View>
              </Marker>
            )}
        </MapView>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
        </TouchableOpacity>

        {/* Live Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSOS}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Bottom Sheet */}
        <View style={styles.bottomSheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>Live Tracking</Text>
          <Text style={styles.subtitle}>
            {participants.length} {participants.length === 1 ? 'participant' : 'participants'} active
          </Text>

          {/* Toggle Tabs */}
          <View style={styles.toggleTabs}>
            <TouchableOpacity
              style={[styles.toggleTab, !showLeaderboard && styles.activeToggleTab]}
              onPress={() => setShowLeaderboard(false)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleTabText,
                  !showLeaderboard && styles.activeToggleTabText,
                ]}
              >
                Live Stats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleTab, showLeaderboard && styles.activeToggleTab]}
              onPress={() => setShowLeaderboard(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleTabText,
                  showLeaderboard && styles.activeToggleTabText,
                ]}
              >
                Leaderboard
              </Text>
            </TouchableOpacity>
          </View>

          {!showLeaderboard ? (
            <View>
              {/* Live Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <StatCard
                    icon="navigate"
                    label="Total Distance"
                    value={String(formatDistance(groupStats.totalDistance || 0))}
                  />
                  <StatCard
                    icon="speedometer"
                    label="Avg Speed"
                    value={String(((groupStats.averageSpeed || 0) * 3.6).toFixed(1))}
                    unit="km/h"
                  />
                </View>
                {myLocation && (
                  <View style={styles.myStatsContainer}>
                    <Text style={styles.myStatsTitle}>Your Stats</Text>
                    <View style={styles.statsRow}>
                      <StatCard
                        icon="fitness"
                        label="Distance"
                        value={String(formatDistance(gpsService.getCurrentActivityStats()?.totalDistance || 0))}
                      />
                      <StatCard
                        icon="time"
                        label="Duration"
                        value={String(formatDuration(gpsService.getCurrentActivityStats()?.totalTime || 0))}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <ScrollView
              style={styles.leaderboard}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.leaderboardTitle}>
                {sortedParticipants.length} {sortedParticipants.length === 1 ? 'Participant' : 'Participants'}
              </Text>
              {sortedParticipants.length > 0 ? (
                sortedParticipants.map((participant, index) => (
                  <ParticipantRow
                    key={participant.userId?._id || participant.userId || index}
                    participant={participant}
                    rank={index + 1}
                  />
                ))
              ) : (
                <View style={styles.emptyLeaderboard}>
                  <Text style={styles.emptyText}>No participants yet</Text>
                </View>
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.primary,
    transform: [{ rotate: '180deg' }],
    marginTop: -4,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  liveBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  liveText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SIZES.padding,
    paddingTop: 12,
    paddingBottom: 90, // Adjusted for floating navigation
    maxHeight: '60%',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  toggleTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightestGray,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggleTab: {
    backgroundColor: COLORS.white,
  },
  toggleTabText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeToggleTabText: {
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statCard: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: COLORS.warning,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  sosButton: {
    position: 'absolute',
    bottom: 200,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosButtonText: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  myStatsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  myStatsTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  emptyLeaderboard: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  meBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  meBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.white,
  },
  leaderboard: {
    flex: 1,
  },
  leaderboardTitle: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    marginBottom: 16,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightestGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  participantPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  participantStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantStat: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  heartRate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartRateText: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: 4,
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightestGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statBadgeText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
});

export default LiveTrackingScreen;
