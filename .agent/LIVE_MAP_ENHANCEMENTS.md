# 🗺️ LIVE MAP ENHANCEMENTS - DRAGGABLE SHEET & REAL-TIME TRACKING

**Date:** 2025-12-10  
**Status:** ⏳ IMPLEMENTATION GUIDE

---

## 🎯 ENHANCEMENTS TO ADD

### 1. **Draggable Bottom Sheet** 📱

The bottom sheet should be draggable to allow full map view.

**Implementation:**

```javascript
// Add to LiveActivitiesMapScreen component

// Create PanResponder for dragging
const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      // Update slideAnim based on drag
      const newValue = Math.max(0, Math.min(height, gestureState.dy));
      slideAnim.setValue(newValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      // Snap to positions based on velocity and position
      if (gestureState.dy > 100 || gestureState.vy > 0.5) {
        // Snap down (close)
        closeBottomSheet();
      } else if (gestureState.dy < -100 || gestureState.vy < -0.5) {
        // Snap to full height
        Animated.spring(slideAnim, {
          toValue: -height * 0.3,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      } else {
        // Snap to half height
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    },
  })
).current;

// Update renderBottomSheet to use PanResponder
const renderBottomSheet = () => {
  if (!selectedActivity) return null;

  return (
    <Animated.View
      style={[
        styles.bottomSheet,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
      {...panResponder.panHandlers} // Add pan handlers
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {}} // Prevent closing when tapping handle
      >
        <View style={styles.sheetHandle} />
      </TouchableOpacity>
      
      {/* Rest of bottom sheet content */}
    </Animated.View>
  );
};
```

**Features:**
- ✅ Drag down to close
- ✅ Drag up to expand
- ✅ Snap to positions (closed, half, full)
- ✅ Velocity-based snapping
- ✅ Smooth animations

---

### 2. **Real-Time User Location Tracking** 📍

Track user's location and update map in real-time.

**Implementation:**

```javascript
import * as Location from 'expo-location';
import gpsService from '../services/gpsService';

// Add to component state
const [userLocation, setUserLocation] = useState(null);
const [isTrackingUser, setIsTrackingUser] = useState(false);
const locationWatchId = useRef(null);

// Start tracking user location
const startUserLocationTracking = async () => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required');
      return;
    }

    // Start watching location
    locationWatchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000, // Update every second
        distanceInterval: 10, // Or every 10 meters
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        
        // Update user location state
        setUserLocation({ latitude, longitude });

        // Center map on user if tracking
        if (isTrackingUser && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 500);
        }

        // Emit location to socket for real-time sharing
        if (selectedActivity) {
          socketService.emit('participant:location', {
            activityId: selectedActivity._id,
            userId: user._id || user.id,
            location: { latitude, longitude },
            timestamp: Date.now(),
          });
        }
      }
    );

    setIsTrackingUser(true);
  } catch (error) {
    console.error('Start location tracking error:', error);
    Alert.alert('Error', 'Failed to start location tracking');
  }
};

// Stop tracking
const stopUserLocationTracking = () => {
  if (locationWatchId.current) {
    locationWatchId.current.remove();
    locationWatchId.current = null;
  }
  setIsTrackingUser(false);
};

// Cleanup on unmount
useEffect(() => {
  startUserLocationTracking();

  return () => {
    stopUserLocationTracking();
  };
}, []);

// Update My Location button
<TouchableOpacity
  style={[
    styles.myLocationButton,
    isTrackingUser && styles.myLocationButtonActive,
  ]}
  onPress={() => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
      setIsTrackingUser(!isTrackingUser);
    }
  }}
>
  <Ionicons
    name={isTrackingUser ? 'navigate' : 'locate'}
    size={24}
    color={isTrackingUser ? COLORS.white : COLORS.primary}
  />
</TouchableOpacity>

// Add active style
myLocationButtonActive: {
  backgroundColor: COLORS.primary,
},
```

**Features:**
- ✅ Real-time location updates (every 1s or 10m)
- ✅ Auto-center map on user movement
- ✅ Toggle tracking on/off
- ✅ Share location via Socket.io
- ✅ Visual indicator when tracking
- ✅ High accuracy GPS

---

### 3. **Three-State Bottom Sheet** 📐

Support three positions: closed, half, full.

**Implementation:**

```javascript
const SHEET_STATES = {
  CLOSED: height,
  HALF: 0,
  FULL: -height * 0.3,
};

const [sheetState, setSheetState] = useState('CLOSED');

const animateToState = (state) => {
  setSheetState(state);
  Animated.spring(slideAnim, {
    toValue: SHEET_STATES[state],
    useNativeDriver: true,
    tension: 50,
    friction: 8,
  }).start();
};

// Update pan responder release
onPanResponderRelease: (_, gestureState) => {
  const currentY = slideAnim._value;
  
  if (gestureState.dy > 100) {
    // Dragging down
    if (currentY < SHEET_STATES.HALF) {
      animateToState('HALF');
    } else {
      animateToState('CLOSED');
    }
  } else if (gestureState.dy < -100) {
    // Dragging up
    if (currentY > SHEET_STATES.HALF) {
      animateToState('HALF');
    } else {
      animateToState('FULL');
    }
  } else {
    // Snap to nearest
    const distances = {
      CLOSED: Math.abs(currentY - SHEET_STATES.CLOSED),
      HALF: Math.abs(currentY - SHEET_STATES.HALF),
      FULL: Math.abs(currentY - SHEET_STATES.FULL),
    };
    const nearest = Object.keys(distances).reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );
    animateToState(nearest);
  }
},
```

**States:**
- **CLOSED:** `height` (off-screen)
- **HALF:** `0` (50% visible)
- **FULL:** `-height * 0.3` (70% visible)

---

### 4. **User Location Marker** 📍

Show user's current location on map.

```javascript
// Add custom user marker
{userLocation && (
  <Marker
    coordinate={userLocation}
    anchor={{ x: 0.5, y: 0.5 }}
  >
    <View style={styles.userLocationMarker}>
      <View style={styles.userLocationDot} />
      <Animated.View
        style={[
          styles.userLocationPulse,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
    </View>
  </Marker>
)}

// Styles
userLocationMarker: {
  width: 40,
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
},
userLocationDot: {
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: COLORS.primary,
  borderWidth: 3,
  borderColor: COLORS.white,
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 5,
},
userLocationPulse: {
  position: 'absolute',
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: COLORS.primary + '30',
},
```

---

### 5. **Map Padding When Sheet Open** 🗺️

Adjust map padding so markers aren't hidden by bottom sheet.

```javascript
// Add to MapView
<MapView
  ref={mapRef}
  provider={PROVIDER_GOOGLE}
  style={styles.map}
  initialRegion={MAURITIUS_CENTER}
  mapType={mapType}
  showsUserLocation={false} // Use custom marker
  showsMyLocationButton={false}
  showsCompass
  showsScale
  mapPadding={{
    top: 0,
    right: 0,
    bottom: sheetState === 'CLOSED' ? 0 : height * 0.4,
    left: 0,
  }}
>
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Draggable Sheet
- [ ] Add PanResponder import
- [ ] Create panResponder instance
- [ ] Add pan handlers to bottom sheet
- [ ] Implement snap logic
- [ ] Test dragging behavior

### Phase 2: Location Tracking
- [ ] Add expo-location import
- [ ] Request location permissions
- [ ] Start location watching
- [ ] Update user location state
- [ ] Emit location to socket
- [ ] Add cleanup on unmount

### Phase 3: UI Enhancements
- [ ] Add user location marker
- [ ] Update my location button
- [ ] Add tracking indicator
- [ ] Implement three-state sheet
- [ ] Add map padding

### Phase 4: Testing
- [ ] Test sheet dragging
- [ ] Test location tracking
- [ ] Test map centering
- [ ] Test socket emissions
- [ ] Test performance

---

## 🚀 EXPECTED BEHAVIOR

### User Flow:

1. **Screen Opens:**
   - Map loads centered on Mauritius
   - User location tracking starts
   - Blue dot appears at user location
   - Map updates as user moves

2. **Tap Activity Marker:**
   - Bottom sheet slides up (HALF state)
   - Map centers on activity
   - Map padding adjusts

3. **Drag Sheet Up:**
   - Sheet expands to FULL state
   - More details visible
   - Map padding increases

4. **Drag Sheet Down:**
   - Sheet collapses to HALF
   - Or closes completely (CLOSED)
   - Map padding adjusts

5. **Tap My Location:**
   - Map centers on user
   - Tracking mode toggles
   - Button color changes

6. **Move Around:**
   - If tracking ON: map follows user
   - If tracking OFF: map stays fixed
   - Location shared via socket

---

## 🎨 VISUAL INDICATORS

### Tracking Active:
- My Location button: Blue background
- Icon: Navigate (filled)
- User marker: Pulsing blue dot

### Tracking Inactive:
- My Location button: White background
- Icon: Locate (outline)
- User marker: Static blue dot

### Sheet States:
- CLOSED: Handle at bottom edge
- HALF: Handle at mid-screen
- FULL: Handle near top

---

## ⚡ PERFORMANCE TIPS

1. **Throttle Location Updates:**
   ```javascript
   timeInterval: 1000, // Max 1 update/sec
   distanceInterval: 10, // Or 10m movement
   ```

2. **Debounce Map Animations:**
   ```javascript
   const debouncedAnimate = debounce((region) => {
     mapRef.current?.animateToRegion(region, 500);
   }, 200);
   ```

3. **Optimize Socket Emissions:**
   ```javascript
   // Only emit if significant movement
   if (distance > 10) {
     socketService.emit('participant:location', data);
   }
   ```

---

## ✅ BENEFITS

1. **Better UX:**
   - Full map visibility
   - Intuitive dragging
   - Real-time tracking

2. **Enhanced Features:**
   - Follow user movement
   - Share location live
   - Three viewing modes

3. **Professional Feel:**
   - Smooth animations
   - Native-like behavior
   - Polished interactions

---

**Status:** Ready to implement  
**Complexity:** Medium  
**Time Estimate:** 2-3 hours  
**Dependencies:** expo-location

---

## 🔧 QUICK START

1. Install expo-location:
   ```bash
   npx expo install expo-location
   ```

2. Add permissions to app.json:
   ```json
   {
     "expo": {
       "ios": {
         "infoPlist": {
           "NSLocationWhenInUseUsageDescription": "We need your location to show you on the map"
         }
       },
       "android": {
         "permissions": ["ACCESS_FINE_LOCATION"]
       }
     }
   }
   ```

3. Implement features from this guide

4. Test on device (location doesn't work in simulator)

---

**Ready to enhance the live map!** 🚀
