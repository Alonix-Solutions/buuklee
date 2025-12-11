import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Share,
  StatusBar,
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, ACTIVITY_ICONS } from '../constants/theme';
import { SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';

const { width, height } = Dimensions.get('window');

// Generate realistic running route in Karura Forest, Nairobi
const generateKaruraRoute = () => {
  const startLat = -1.2409;
  const startLng = 36.8314;
  const points = [];
  const elevations = [];
  const paces = [];
  const timestamps = [];

  let currentLat = startLat;
  let currentLng = startLng;
  let currentElevation = 1680; // Karura base elevation in meters
  let currentTime = new Date('2025-01-12T06:30:00');

  // Generate ~50 points over 5km route
  for (let i = 0; i < 50; i++) {
    // Create a semi-circular route with natural curves
    const angle = (i / 50) * Math.PI + Math.sin(i / 10) * 0.3;
    const radius = 0.015; // ~5km route

    currentLat = startLat + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.001;
    currentLng = startLng + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.001;

    // Simulate elevation changes (50-150m total change)
    const elevationChange = Math.sin(i / 8) * 30 + Math.cos(i / 12) * 20;
    currentElevation += elevationChange;

    // Simulate varying pace (4:00 - 6:30 min/km)
    const basePace = 5.0; // minutes per km
    const paceVariation = Math.sin(i / 15) * 0.8 + (Math.random() - 0.5) * 0.5;
    const pace = basePace + paceVariation;

    // Calculate time based on pace
    const segmentDistance = 0.1; // km
    const segmentTime = pace * segmentDistance * 60 * 1000; // milliseconds
    currentTime = new Date(currentTime.getTime() + segmentTime);

    points.push({
      latitude: currentLat,
      longitude: currentLng,
    });

    elevations.push(Math.round(currentElevation));
    paces.push(pace);
    timestamps.push(currentTime);
  }

  return { points, elevations, paces, timestamps };
};

// Generate kilometer split markers
const generateSplitMarkers = (points, elevations, paces) => {
  const splits = [];
  const totalDistance = 5.0; // km
  const pointsPerKm = points.length / totalDistance;

  for (let km = 1; km <= 5; km++) {
    const index = Math.floor(km * pointsPerKm) - 1;
    if (index >= 0 && index < points.length) {
      const splitPace = paces[index];
      const splitElevation = elevations[index];

      splits.push({
        id: km,
        coordinate: points[index],
        pace: splitPace.toFixed(2),
        elevation: splitElevation,
      });
    }
  }

  return splits;
};

// Generate segment highlights (PRs or achievements)
const generateSegments = (points) => {
  return [
    {
      id: 1,
      name: 'Forest Sprint',
      start: 10,
      end: 20,
      type: 'pr',
      achievement: '🏆 Personal Record',
      time: '2:15',
    },
    {
      id: 2,
      name: 'Hill Climb',
      start: 25,
      end: 35,
      type: 'kom',
      achievement: '👑 Top 10 Segment',
      time: '4:30',
    },
  ];
};

const StravaStyleMapScreen = ({ navigation }) => {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'elevation'
  const [show3D, setShow3D] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [expandedSegment, setExpandedSegment] = useState(null);

  const mapRef = useRef(null);
  const elevationAnimValue = useRef(new Animated.Value(0)).current;
  const statsAnimValue = useRef(new Animated.Value(1)).current;

  // Generate route data
  const { points, elevations, paces, timestamps } = generateKaruraRoute();
  const splitMarkers = generateSplitMarkers(points, elevations, paces);
  const segments = generateSegments(points);

  // Calculate statistics
  const totalDistance = 5.02; // km
  const totalDuration = 27 * 60 + 35; // 27:35 in seconds
  const avgPace = totalDuration / totalDistance / 60; // min/km
  const totalElevationGain = 127; // meters
  const calories = 385;
  const avgHeartRate = 152;
  const maxHeartRate = 178;

  const activityData = {
    name: 'Morning Run in Karura',
    type: 'running',
    date: 'January 12, 2025',
    time: '6:30 AM',
    weather: '☀️ 18°C',
  };

  // Fit map to route on mount
  useEffect(() => {
    if (mapRef.current && points.length > 0) {
      setTimeout(() => {
        mapRef.current.fitToCoordinates(points, {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, []);

  // Toggle elevation view animation
  const toggleElevationView = () => {
    const toValue = viewMode === 'map' ? 1 : 0;

    Animated.parallel([
      Animated.spring(elevationAnimValue, {
        toValue,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(statsAnimValue, {
        toValue: viewMode === 'map' ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setViewMode(viewMode === 'map' ? 'elevation' : 'map');
  };

  // Get color for pace gradient
  const getPaceColor = (pace) => {
    // Faster pace (lower number) = lighter orange
    // Slower pace (higher number) = darker red
    if (pace < 4.5) return '#FF9500'; // Fast - light orange
    if (pace < 5.0) return '#FF6B00'; // Medium - Strava orange
    if (pace < 5.5) return '#FF4500'; // Slower - orange-red
    return '#DC143C'; // Slow - crimson
  };

  // Create gradient polyline segments
  const createGradientPolylines = () => {
    const polylines = [];
    for (let i = 0; i < points.length - 1; i++) {
      polylines.push(
        <Polyline
          key={`segment-${i}`}
          coordinates={[points[i], points[i + 1]]}
          strokeColor={getPaceColor(paces[i])}
          strokeWidth={5}
        />
      );
    }
    return polylines;
  };

  // Share activity
  const handleShare = async () => {
    try {
      const message = `🏃 ${activityData.name}\n📍 Karura Forest, Nairobi\n⏱️ ${formatDuration(totalDuration)}\n📏 ${totalDistance.toFixed(2)} km\n⚡ ${formatPace(avgPace)} /km\n\nShared from Alonix 💪`;

      await Share.share({
        message,
        title: 'Check out my run!',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format pace
  const formatPace = (pace) => {
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const elevationTranslateY = elevationAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const statsOpacity = statsAnimValue;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.activityIcon}>{ACTIVITY_ICONS[activityData.type]}</Text>
            <Text style={styles.headerTitle}>{activityData.name}</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {activityData.date} • {activityData.time} • {activityData.weather}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={show3D ? 'satellite' : 'standard'}
        pitchEnabled={show3D}
        camera={show3D ? {
          center: points[0],
          pitch: 45,
          heading: 0,
          altitude: 1000,
          zoom: 14,
        } : undefined}
      >
        {/* Gradient route polylines */}
        {createGradientPolylines()}

        {/* Start marker */}
        <Marker coordinate={points[0]} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.startMarker}>
            <Ionicons name="flag" size={16} color={COLORS.white} />
          </View>
        </Marker>

        {/* Finish marker */}
        <Marker coordinate={points[points.length - 1]} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.finishMarker}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
          </View>
        </Marker>

        {/* Kilometer split markers */}
        {splitMarkers.map((split) => (
          <Marker
            key={split.id}
            coordinate={split.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => setSelectedSplit(split)}
          >
            <View style={styles.splitMarker}>
              <Text style={styles.splitMarkerText}>{split.id}</Text>
            </View>
          </Marker>
        ))}

        {/* Segment highlights */}
        {segments.map((segment) => {
          const segmentPoints = points.slice(segment.start, segment.end);
          return (
            <Polyline
              key={segment.id}
              coordinates={segmentPoints}
              strokeColor={segment.type === 'pr' ? '#FFD700' : '#9333EA'}
              strokeWidth={8}
              lineDashPattern={[10, 5]}
            />
          );
        })}

        {/* Heatmap overlay (simulated) */}
        {showHeatmap && (
          <Polyline
            coordinates={points}
            strokeColor="rgba(252, 82, 0, 0.3)"
            strokeWidth={20}
          />
        )}
      </MapView>

      {/* Map controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[styles.controlButton, show3D && styles.controlButtonActive]}
          onPress={() => setShow3D(!show3D)}
        >
          <MaterialCommunityIcons
            name="rotate-3d-variant"
            size={20}
            color={show3D ? COLORS.secondary : COLORS.darkGray}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, showHeatmap && styles.controlButtonActive]}
          onPress={() => setShowHeatmap(!showHeatmap)}
        >
          <MaterialCommunityIcons
            name="fire"
            size={20}
            color={showHeatmap ? COLORS.secondary : COLORS.darkGray}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            mapRef.current?.fitToCoordinates(points, {
              edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
              animated: true,
            });
          }}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      {/* Stats overlay */}
      <Animated.View style={[styles.statsContainer, { opacity: statsOpacity }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDistance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Distance (km)</Text>
            <Ionicons name="footsteps" size={16} color={COLORS.secondary} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatPace(avgPace)}</Text>
            <Text style={styles.statLabel}>Avg Pace (/km)</Text>
            <Ionicons name="speedometer" size={16} color={COLORS.secondary} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDuration(totalDuration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
            <Ionicons name="time" size={16} color={COLORS.secondary} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalElevationGain}m</Text>
            <Text style={styles.statLabel}>Elevation</Text>
            <Ionicons name="trending-up" size={16} color={COLORS.secondary} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
            <Ionicons name="flame" size={16} color={COLORS.secondary} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgHeartRate}</Text>
            <Text style={styles.statLabel}>Avg HR (bpm)</Text>
            <Ionicons name="heart" size={16} color={COLORS.secondary} />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Selected split popup */}
      {selectedSplit && (
        <View style={styles.splitPopup}>
          <View style={styles.splitPopupContent}>
            <Text style={styles.splitPopupTitle}>Kilometer {selectedSplit.id}</Text>
            <View style={styles.splitPopupRow}>
              <Ionicons name="speedometer" size={16} color={COLORS.gray} />
              <Text style={styles.splitPopupText}>
                Pace: {formatPace(parseFloat(selectedSplit.pace))} /km
              </Text>
            </View>
            <View style={styles.splitPopupRow}>
              <Ionicons name="trending-up" size={16} color={COLORS.gray} />
              <Text style={styles.splitPopupText}>
                Elevation: {selectedSplit.elevation}m
              </Text>
            </View>
            <TouchableOpacity
              style={styles.splitPopupClose}
              onPress={() => setSelectedSplit(null)}
            >
              <Ionicons name="close" size={20} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Elevation profile */}
      <Animated.View
        style={[
          styles.elevationContainer,
          { transform: [{ translateY: elevationTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.elevationHeader}
          onPress={toggleElevationView}
        >
          <View style={styles.elevationHeaderLeft}>
            <MaterialCommunityIcons
              name="chart-line"
              size={20}
              color={COLORS.secondary}
            />
            <Text style={styles.elevationTitle}>Elevation Profile</Text>
          </View>
          <Ionicons
            name={viewMode === 'map' ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={COLORS.darkGray}
          />
        </TouchableOpacity>

        <View style={styles.elevationContent}>
          <View style={styles.elevationGraph}>
            {elevations.map((elevation, index) => {
              const maxElevation = Math.max(...elevations);
              const minElevation = Math.min(...elevations);
              const range = maxElevation - minElevation;
              const heightPercent = ((elevation - minElevation) / range) * 100;

              return (
                <View
                  key={index}
                  style={[
                    styles.elevationBar,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: getPaceColor(paces[index]),
                    },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.elevationStats}>
            <View style={styles.elevationStatItem}>
              <Text style={styles.elevationStatValue}>{Math.max(...elevations)}m</Text>
              <Text style={styles.elevationStatLabel}>Max</Text>
            </View>
            <View style={styles.elevationStatItem}>
              <Text style={styles.elevationStatValue}>{Math.min(...elevations)}m</Text>
              <Text style={styles.elevationStatLabel}>Min</Text>
            </View>
            <View style={styles.elevationStatItem}>
              <Text style={styles.elevationStatValue}>{totalElevationGain}m</Text>
              <Text style={styles.elevationStatLabel}>Gain</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Segment achievements */}
      <View style={styles.segmentsContainer}>
        <Text style={styles.segmentsTitle}>🏆 Achievements</Text>
        {segments.map((segment) => (
          <TouchableOpacity
            key={segment.id}
            style={styles.segmentCard}
            onPress={() => setExpandedSegment(expandedSegment === segment.id ? null : segment.id)}
          >
            <View style={styles.segmentHeader}>
              <View>
                <Text style={styles.segmentName}>{segment.name}</Text>
                <Text style={styles.segmentAchievement}>{segment.achievement}</Text>
              </View>
              <Text style={styles.segmentTime}>{segment.time}</Text>
            </View>
            {expandedSegment === segment.id && (
              <View style={styles.segmentDetails}>
                <Text style={styles.segmentDetailText}>
                  You crushed this segment! Keep up the great work.
                </Text>
                <TouchableOpacity style={styles.segmentButton}>
                  <Text style={styles.segmentButtonText}>View Leaderboard</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Pace legend */}
      <View style={styles.paceLegend}>
        <Text style={styles.paceLegendTitle}>Pace</Text>
        <View style={styles.paceLegendGradient}>
          <View style={styles.paceLegendBar}>
            <View style={[styles.paceLegendSegment, { backgroundColor: '#FF9500' }]} />
            <View style={[styles.paceLegendSegment, { backgroundColor: '#FF6B00' }]} />
            <View style={[styles.paceLegendSegment, { backgroundColor: '#FF4500' }]} />
            <View style={[styles.paceLegendSegment, { backgroundColor: '#DC143C' }]} />
          </View>
          <View style={styles.paceLegendLabels}>
            <Text style={styles.paceLegendLabel}>Fast</Text>
            <Text style={styles.paceLegendLabel}>Slow</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: SIZES.padding,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  map: {
    width,
    height: height * 0.65,
  },
  mapControls: {
    position: 'absolute',
    right: SIZES.padding,
    top: 140,
    zIndex: 5,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...SHADOW_MEDIUM,
  },
  controlButtonActive: {
    backgroundColor: '#FFF5F0',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  statsContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  statsScroll: {
    paddingHorizontal: SIZES.padding,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    ...SHADOW_MEDIUM,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginBottom: 4,
    textAlign: 'center',
  },
  startMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  finishMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  splitMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  splitMarkerText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  splitPopup: {
    position: 'absolute',
    top: height * 0.4,
    left: SIZES.padding,
    right: SIZES.padding,
    zIndex: 20,
  },
  splitPopupContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    ...SHADOW_LARGE,
  },
  splitPopupTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  splitPopupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  splitPopupText: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  splitPopupClose: {
    position: 'absolute',
    top: SIZES.padding,
    right: SIZES.padding,
  },
  elevationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...SHADOW_LARGE,
  },
  elevationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  elevationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elevationTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  elevationContent: {
    padding: SIZES.padding,
  },
  elevationGraph: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundGray,
    borderRadius: SIZES.borderRadius,
    padding: 8,
    marginBottom: SIZES.padding,
  },
  elevationBar: {
    flex: 1,
    marginHorizontal: 0.5,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 2,
  },
  elevationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  elevationStatItem: {
    alignItems: 'center',
  },
  elevationStatValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  elevationStatLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  segmentsContainer: {
    position: 'absolute',
    bottom: 80,
    left: SIZES.padding,
    right: SIZES.padding,
    zIndex: 5,
  },
  segmentsTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  segmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 8,
    ...SHADOW_MEDIUM,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentName: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  segmentAchievement: {
    fontSize: SIZES.sm,
    color: COLORS.secondary,
    marginTop: 2,
  },
  segmentTime: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  segmentDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  segmentDetailText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 10,
  },
  segmentButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  segmentButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  paceLegend: {
    position: 'absolute',
    bottom: SIZES.padding,
    left: SIZES.padding,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.borderRadius,
    padding: 10,
    ...SHADOW_MEDIUM,
  },
  paceLegendTitle: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  paceLegendGradient: {
    width: 100,
  },
  paceLegendBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  paceLegendSegment: {
    flex: 1,
  },
  paceLegendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  paceLegendLabel: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
  },
});

export default StravaStyleMapScreen;
