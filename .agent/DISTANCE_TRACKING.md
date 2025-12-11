# 🗺️ LIVE MAP - DISTANCE TRACKING FEATURE

**Date:** 2025-12-10  
**Status:** ✅ IMPLEMENTATION GUIDE

---

## 🎯 DISTANCE TRACKING

Track the distance user has traveled in real-time during map usage.

---

## 📊 IMPLEMENTATION

### **Add Distance Tracking State:**

```javascript
const LiveActivitiesMapScreen = ({ navigation }) => {
  // ... existing state ...
  
  const [userLocation, setUserLocation] = useState(null);
  const [previousLocation, setpreviousLocation] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0); // in meters
  const [isTrackingDistance, setIsTrackingDistance] = useState(false);
  
  // ... rest of component
};
```

---

### **Calculate Distance Between Two Points:**

```javascript
// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
};
```

---

### **Update Location Tracking with Distance:**

```javascript
const startUserLocationTracking = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required');
      return;
    }

    locationWatchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const newLocation = { latitude, longitude };

        // Calculate distance if we have a previous location
        if (previousLocation && isTrackingDistance) {
          const distance = calculateDistance(
            previousLocation.latitude,
            previousLocation.longitude,
            latitude,
            longitude
          );

          // Only add if movement is significant (> 5 meters to filter GPS noise)
          if (distance > 5) {
            setTotalDistance(prev => prev + distance);
          }
        }

        // Update locations
        setPreviousLocation(userLocation);
        setUserLocation(newLocation);

        // Center map if tracking
        if (isTrackingUser && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 500);
        }

        // Emit to socket
        if (selectedActivity) {
          socketService.emit('participant:location', {
            activityId: selectedActivity._id,
            userId: user._id || user.id,
            location: { latitude, longitude },
            distance: totalDistance,
            timestamp: Date.now(),
          });
        }
      }
    );

    setIsTrackingUser(true);
  } catch (error) {
    console.error('Start location tracking error:', error);
  }
};
```

---

### **Format Distance for Display:**

```javascript
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(2)}km`;
  }
};
```

---

### **Add Distance Display to UI:**

```javascript
// Add floating distance card
<View style={styles.distanceCard}>
  <View style={styles.distanceHeader}>
    <Ionicons name="footsteps" size={20} color={COLORS.primary} />
    <Text style={styles.distanceLabel}>Distance Traveled</Text>
  </View>
  <Text style={styles.distanceValue}>
    {formatDistance(totalDistance)}
  </Text>
  <TouchableOpacity
    style={styles.resetButton}
    onPress={() => {
      setTotalDistance(0);
      setPreviousLocation(null);
    }}
  >
    <Text style={styles.resetText}>Reset</Text>
  </TouchableOpacity>
</View>

// Styles
distanceCard: {
  position: 'absolute',
  top: Platform.OS === 'ios' ? 200 : 190,
  right: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 16,
  padding: 16,
  minWidth: 140,
  borderWidth: 1.5,
  borderColor: 'rgba(255, 255, 255, 0.6)',
  ...SHADOW_MEDIUM,
},
distanceHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  gap: 8,
},
distanceLabel: {
  fontSize: SIZES.xs,
  color: COLORS.gray,
  fontWeight: '600',
},
distanceValue: {
  fontSize: 24,
  fontWeight: '700',
  color: COLORS.primary,
  marginBottom: 8,
},
resetButton: {
  paddingVertical: 4,
  paddingHorizontal: 8,
  backgroundColor: COLORS.lightestGray,
  borderRadius: 8,
  alignSelf: 'flex-start',
},
resetText: {
  fontSize: SIZES.xs,
  color: COLORS.gray,
  fontWeight: '600',
},
```

---

### **Add Distance Toggle Button:**

```javascript
<TouchableOpacity
  style={[
    styles.trackingToggle,
    isTrackingDistance && styles.trackingToggleActive,
  ]}
  onPress={() => {
    setIsTrackingDistance(!isTrackingDistance);
    if (!isTrackingDistance) {
      // Reset when starting
      setTotalDistance(0);
      setPreviousLocation(null);
    }
  }}
>
  <Ionicons
    name={isTrackingDistance ? 'pause' : 'play'}
    size={20}
    color={isTrackingDistance ? COLORS.white : COLORS.primary}
  />
  <Text
    style={[
      styles.trackingToggleText,
      isTrackingDistance && styles.trackingToggleTextActive,
    ]}
  >
    {isTrackingDistance ? 'Tracking' : 'Start'}
  </Text>
</TouchableOpacity>

// Styles
trackingToggle: {
  position: 'absolute',
  bottom: 180,
  right: 20,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.white,
  borderRadius: 20,
  paddingVertical: 10,
  paddingHorizontal: 16,
  gap: 8,
  borderWidth: 1.5,
  borderColor: 'rgba(255, 255, 255, 0.6)',
  ...SHADOW_MEDIUM,
},
trackingToggleActive: {
  backgroundColor: COLORS.primary,
},
trackingToggleText: {
  fontSize: SIZES.sm,
  fontWeight: '600',
  color: COLORS.primary,
},
trackingToggleTextActive: {
  color: COLORS.white,
},
```

---

### **Add Distance to Bottom Sheet:**

```javascript
// In renderBottomSheet, add a stat item
<StatItem
  icon="footsteps"
  label="Your Distance"
  value={formatDistance(totalDistance)}
  color={COLORS.primary}
/>
```

---

### **Save Distance to Activity:**

```javascript
// When joining an activity, track distance
const joinActivity = async (activityId) => {
  try {
    setSelectedActivity(activity);
    setIsTrackingDistance(true); // Auto-start tracking
    setTotalDistance(0); // Reset
    
    // ... rest of join logic
  } catch (error) {
    console.error('Join activity error:', error);
  }
};

// When leaving activity, save distance
const leaveActivity = async () => {
  try {
    if (selectedActivity && totalDistance > 0) {
      await activityService.updateParticipantStats(
        selectedActivity._id,
        user._id,
        {
          distance: totalDistance / 1000, // Convert to km
          completedAt: new Date(),
        }
      );
    }
    
    setIsTrackingDistance(false);
    setTotalDistance(0);
    setSelectedActivity(null);
  } catch (error) {
    console.error('Leave activity error:', error);
  }
};
```

---

## 🎨 VISUAL DESIGN

### **Distance Card:**
```
┌─────────────────┐
│ 🦶 Distance     │
│                 │
│    2.45km       │ ← Large, bold
│                 │
│  [Reset]        │ ← Small button
└─────────────────┘
```

### **Tracking Toggle:**
```
┌──────────────┐
│ ▶ Start      │ ← When inactive (white bg)
└──────────────┘

┌──────────────┐
│ ⏸ Tracking   │ ← When active (blue bg)
└──────────────┘
```

---

## 📊 FEATURES

### **Distance Tracking:**
- ✅ Real-time calculation
- ✅ GPS noise filtering (>5m threshold)
- ✅ Haversine formula (accurate)
- ✅ Meters/Kilometers display
- ✅ Reset functionality
- ✅ Start/Stop toggle

### **Integration:**
- ✅ Socket.io emission
- ✅ Activity stats update
- ✅ Bottom sheet display
- ✅ Persistent tracking

### **Accuracy:**
- ✅ High GPS accuracy
- ✅ Noise filtering
- ✅ Cumulative tracking
- ✅ Real-time updates

---

## 🚀 USAGE

### **User Flow:**

1. **Open Map:**
   - Distance card shows 0m
   - Toggle shows "Start"

2. **Tap Start:**
   - Toggle turns blue
   - Distance tracking begins
   - Card updates in real-time

3. **Move Around:**
   - Distance increases
   - Updates every 10m or 1s
   - Filters GPS noise

4. **Tap Pause:**
   - Tracking stops
   - Distance preserved
   - Can resume later

5. **Tap Reset:**
   - Distance resets to 0
   - Previous location cleared
   - Ready for new tracking

---

## ⚡ PERFORMANCE

### **Optimizations:**

1. **GPS Filtering:**
   ```javascript
   if (distance > 5) { // Only count significant movement
     setTotalDistance(prev => prev + distance);
   }
   ```

2. **Update Throttling:**
   ```javascript
   timeInterval: 1000, // Max 1 update/sec
   distanceInterval: 10, // Or 10m movement
   ```

3. **Efficient Calculation:**
   ```javascript
   // Haversine is O(1) - very fast
   const distance = calculateDistance(lat1, lon1, lat2, lon2);
   ```

---

## 📱 COMPLETE EXAMPLE

```javascript
const LiveActivitiesMapScreen = ({ navigation }) => {
  // State
  const [userLocation, setUserLocation] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [isTrackingDistance, setIsTrackingDistance] = useState(false);

  // Calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Format distance
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  // Track location
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    locationWatchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const newLocation = { latitude, longitude };

        if (previousLocation && isTrackingDistance) {
          const distance = calculateDistance(
            previousLocation.latitude,
            previousLocation.longitude,
            latitude,
            longitude
          );

          if (distance > 5) {
            setTotalDistance(prev => prev + distance);
          }
        }

        setPreviousLocation(userLocation);
        setUserLocation(newLocation);
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView ... />

      {/* Distance Card */}
      <View style={styles.distanceCard}>
        <View style={styles.distanceHeader}>
          <Ionicons name="footsteps" size={20} color={COLORS.primary} />
          <Text style={styles.distanceLabel}>Distance</Text>
        </View>
        <Text style={styles.distanceValue}>
          {formatDistance(totalDistance)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setTotalDistance(0);
            setPreviousLocation(null);
          }}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Tracking Toggle */}
      <TouchableOpacity
        style={[
          styles.trackingToggle,
          isTrackingDistance && styles.trackingToggleActive,
        ]}
        onPress={() => setIsTrackingDistance(!isTrackingDistance)}
      >
        <Ionicons
          name={isTrackingDistance ? 'pause' : 'play'}
          size={20}
          color={isTrackingDistance ? COLORS.white : COLORS.primary}
        />
        <Text>{isTrackingDistance ? 'Tracking' : 'Start'}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## ✅ BENEFITS

1. **User Engagement:**
   - See progress in real-time
   - Gamification element
   - Achievement tracking

2. **Activity Stats:**
   - Accurate distance data
   - Historical tracking
   - Leaderboard integration

3. **Professional Feel:**
   - Real-time updates
   - Accurate calculations
   - Polished UI

---

**Status:** ✅ Ready to implement  
**Complexity:** Medium  
**Time:** 1-2 hours  
**Dependencies:** expo-location

🎉 **Complete distance tracking solution!**
