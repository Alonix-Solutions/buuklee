import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, ActivityIndicator, Platform, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_LARGE } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { useMessages } from '../context/MessagesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CreateScreen from '../screens/CreateScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import ActivityCompletionScreen from '../screens/ActivityCompletionScreen';
import ActivityResultsScreen from '../screens/ActivityResultsScreen';
import HotelDetailScreen from '../screens/HotelDetailScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';
import RideSharingScreen from '../screens/RideSharingScreen';
import CarRentalScreen from '../screens/CarRentalScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import CarBookingScreen from '../screens/CarBookingScreen';
import DriverSelectionScreen from '../screens/DriverSelectionScreen';
import RideRequestScreen from '../screens/RideRequestScreen';
import DriverTrackingScreen from '../screens/DriverTrackingScreen';
import TransportSelectionScreen from '../screens/TransportSelectionScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ConversationScreen from '../screens/ConversationScreen';
import PaymentScreen from '../screens/PaymentScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ActivityTrackerScreen from '../screens/ActivityTrackerScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import HelpScreen from '../screens/HelpScreen';
import UberStyleRideScreen from '../screens/UberStyleRideScreen';
import StravaStyleMapScreen from '../screens/StravaStyleMapScreen';
import AirbnbStyleMapScreen from '../screens/AirbnbStyleMapScreen';
import CreateChallengeScreen from '../screens/CreateChallengeScreen';
import CreateRideScreen from '../screens/CreateRideScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LiveActivitiesMapScreen from '../screens/LiveActivitiesMapScreen';
import AuthNavigator from './AuthNavigator';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Helper to determine tab bar visibility
const getTabBarStyle = (route, tabBarAnimation) => {
  const routeName = getFocusedRouteNameFromRoute(route);

  // List of screens where tab bar should be hidden
  const hideOnScreens = [
    'UberStyleRide',
    'LiveTracking',
    'RideRequest',
    'DriverSelection',
    'TransportSelection',
    'LiveActivitiesMap',
    'ActivityCompletion',
    'ActivityResults',
    'CarDetail',
    'CarBooking'
  ];

  if (hideOnScreens.includes(routeName)) {
    return { display: 'none' };
  }

  return {
    position: 'absolute',
    bottom: 10,
    left: 30,
    right: 30,
    height: 60,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    transform: [{
      translateY: tabBarAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0], // Slide down to hide
      }),
    }],
  };
};

// Stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        fontWeight: '700',
      },
    }}
  >
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ title: 'Alonix' }}
    />
    <Stack.Screen
      name="ChallengeDetail"
      component={ChallengeDetailScreen}
      options={{ title: 'Challenge Details' }}
    />
    <Stack.Screen
      name="LiveActivitiesMap"
      component={LiveActivitiesMapScreen}
      options={{ title: 'Live Map', headerShown: false }}
    />
    <Stack.Screen
      name="LiveTracking"
      component={LiveTrackingScreen}
      options={{ title: 'Live Tracking', headerShown: false }}
    />
    <Stack.Screen
      name="ActivityCompletion"
      component={ActivityCompletionScreen}
      options={{ title: 'Activity Complete', headerShown: false }}
    />
    <Stack.Screen
      name="ActivityResults"
      component={ActivityResultsScreen}
      options={{ title: 'Results', headerShown: false }}
    />
    <Stack.Screen
      name="RideSharing"
      component={RideSharingScreen}
      options={{ title: 'Ride Sharing' }}
    />
    <Stack.Screen
      name="TransportSelection"
      component={TransportSelectionScreen}
      options={{ title: 'Transportation', headerShown: false }}
    />
    <Stack.Screen
      name="DriverSelection"
      component={DriverSelectionScreen}
      options={{ title: 'Select Driver' }}
    />
    <Stack.Screen
      name="RideRequest"
      component={RideRequestScreen}
      options={{ title: 'Book Ride', headerShown: false }}
    />
    <Stack.Screen
      name="DriverTracking"
      component={DriverTrackingScreen}
      options={{ title: 'Track Driver', headerShown: false }}
    />
    <Stack.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ title: 'Payment' }}
    />
    <Stack.Screen
      name="BookingConfirmation"
      component={BookingConfirmationScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MyBookings"
      component={MyBookingsScreen}
      options={{ title: 'My Bookings' }}
    />
    <Stack.Screen
      name="Search"
      component={SearchScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Create"
      component={CreateScreen}
      options={{ title: 'Create Activity' }}
    />
    <Stack.Screen
      name="UserProfile"
      component={UserProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ActivityDetail"
      component={ActivityDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Reviews"
      component={ReviewsScreen}
      options={{ title: 'Reviews' }}
    />
    <Stack.Screen
      name="WriteReview"
      component={WriteReviewScreen}
      options={{ title: 'Write Review' }}
    />
    <Stack.Screen
      name="UberStyleRide"
      component={UberStyleRideScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="StravaMap"
      component={StravaStyleMapScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AirbnbMap"
      component={AirbnbStyleMapScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CarRental"
      component={CarRentalScreen}
      options={{ title: 'Car Rental' }}
    />
    <Stack.Screen
      name="CarDetail"
      component={CarDetailScreen}
      options={{ title: 'Car Details', headerShown: false }}
    />
    <Stack.Screen
      name="CarBooking"
      component={CarBookingScreen}
      options={{ title: 'Book Car', headerShown: false }}
    />
    <Stack.Screen
      name="CreateChallenge"
      component={CreateChallengeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateRide"
      component={CreateRideScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ExploreStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        fontWeight: '700',
      },
    }}
  >
    <Stack.Screen
      name="ExploreMain"
      component={ExploreScreen}
      options={{ title: 'Explore' }}
    />
    <Stack.Screen
      name="ChallengeDetail"
      component={ChallengeDetailScreen}
      options={{ title: 'Challenge Details' }}
    />
    <Stack.Screen
      name="HotelDetail"
      component={HotelDetailScreen}
      options={{ title: 'Hotel Details' }}
    />
    <Stack.Screen
      name="ClubDetail"
      component={ClubDetailScreen}
      options={{ title: 'Club Details' }}
    />
    <Stack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
      options={{ title: 'Restaurant Details', headerShown: false }}
    />
    <Stack.Screen
      name="LiveTracking"
      component={LiveTrackingScreen}
      options={{ title: 'Live Tracking', headerShown: false }}
    />
    <Stack.Screen
      name="Search"
      component={SearchScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ActivityTracker"
      component={ActivityTrackerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ActivityDetail"
      component={ActivityDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="UserProfile"
      component={UserProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ title: 'Payment' }}
    />
    <Stack.Screen
      name="BookingConfirmation"
      component={BookingConfirmationScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Reviews"
      component={ReviewsScreen}
      options={{ title: 'Reviews' }}
    />
    <Stack.Screen
      name="WriteReview"
      component={WriteReviewScreen}
      options={{ title: 'Write Review' }}
    />
  </Stack.Navigator>
);

const ActivityStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        fontWeight: '700',
      },
    }}
  >
    <Stack.Screen
      name="ActivityMain"
      component={ActivityScreen}
      options={{ title: 'My Activity' }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen
      name="Messages"
      component={MessagesScreen}
      options={{ title: 'Messages' }}
    />
    <Stack.Screen
      name="Conversation"
      component={ConversationScreen}
      options={{ title: 'Chat' }}
    />
    <Stack.Screen
      name="ChallengeDetail"
      component={ChallengeDetailScreen}
      options={{ title: 'Challenge Details' }}
    />
    <Stack.Screen
      name="LiveTracking"
      component={LiveTrackingScreen}
      options={{ title: 'Live Tracking', headerShown: false }}
    />
    <Stack.Screen
      name="ActivityTracker"
      component={ActivityTrackerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ActivityDetail"
      component={ActivityDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="UserProfile"
      component={UserProfileScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MessagesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        fontWeight: '700',
      },
    }}
  >
    <Stack.Screen
      name="MessagesMain"
      component={MessagesScreen}
      options={{ title: 'Messages' }}
    />
    <Stack.Screen
      name="Conversation"
      component={ConversationScreen}
      options={{ title: 'Chat' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        fontWeight: '700',
      },
    }}
  >
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
    <Stack.Screen
      name="MyBookings"
      component={MyBookingsScreen}
      options={{ title: 'My Bookings' }}
    />
    <Stack.Screen
      name="Achievements"
      component={AchievementsScreen}
      options={{ title: 'Achievements' }}
    />
    <Stack.Screen
      name="Help"
      component={HelpScreen}
      options={{ title: 'Help & Support' }}
    />
    <Stack.Screen
      name="ActivityDetail"
      component={ActivityDetailScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const CarRentalStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        fontWeight: '700',
      },
    }}
  >
    <Stack.Screen
      name="CarRentalMain"
      component={CarRentalScreen}
      options={{ title: 'Car Rental' }}
    />
    <Stack.Screen
      name="CarDetail"
      component={CarDetailScreen}
      options={{ title: 'Car Details', headerShown: false }}
    />
    <Stack.Screen
      name="CarBooking"
      component={CarBookingScreen}
      options={{ title: 'Book Car', headerShown: false }}
    />
  </Stack.Navigator>
);

// Welcome/Onboarding Stack
const WelcomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => {
  const { unreadCount } = useNotifications();
  const { totalUnreadCount } = useMessages();
  const { isTabBarVisible } = require('../context/TabBarContext').useTabBar();
  const tabBarAnimation = React.useRef(new Animated.Value(1)).current;

  // Animate tab bar visibility
  React.useEffect(() => {
    Animated.timing(tabBarAnimation, {
      toValue: isTabBarVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: getTabBarStyle(route, tabBarAnimation),
        tabBarBackground: () => null,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let badge = null;
          const isCenter = route.name === 'Messages';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            badge = totalUnreadCount;
          } else if (route.name === 'Activity') {
            iconName = focused ? 'notifications' : 'notifications-outline';
            badge = unreadCount;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Center "Dome" Button (Droplet Style)
          if (isCenter) {
            return (
              <View style={{
                top: -20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <View style={{
                  width: 66,
                  height: 66,
                  borderRadius: 33,
                  backgroundColor: COLORS.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 8,
                  shadowColor: COLORS.primary,
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  borderWidth: 2,
                  borderColor: 'rgba(0, 194, 255, 0.5)', // Ocean Blue Glass rim
                }}>
                  <LinearGradient
                    colors={focused ? [COLORS.secondary, COLORS.secondaryLight] : [COLORS.primary, COLORS.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 29,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={iconName} size={28} color={COLORS.white} />
                    <LinearGradient
                      colors={['rgba(255,255,255,0.4)', 'transparent']}
                      style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 29,
                        borderTopLeftRadius: 29, borderTopRightRadius: 29,
                      }}
                    />
                  </LinearGradient>
                </View>
                {badge > 0 && (
                  <View style={[styles.badge, { top: 0, right: 0 }]}>
                    <View style={styles.badgeContent}>
                      <View style={styles.badgeInner} />
                    </View>
                  </View>
                )}
              </View>
            );
          }

          // Rain Droplet Active State for others
          // Individual Floating Droplets for others
          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: 10, // Constant alignment
            }}>
              {/* Always show glass background for visibility since bar is gone */}
              {/* Neutral Liquid Glass Frame */}
              <View style={{
                position: 'absolute',
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: focused ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255,255,255,0.1)',
                borderWidth: 1.5,
                borderColor: 'rgba(255, 255, 255, 0.6)', // Neutral Glass
                shadowColor: COLORS.darkGray,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: focused ? 0.2 : 0.05,
                shadowRadius: 4,
                elevation: 3,
              }}>
                {focused && (
                  <>
                    <View style={{ position: 'absolute', top: 6, right: 8, width: 4, height: 4, borderRadius: 2, backgroundColor: 'white', opacity: 0.9 }} />
                    <View style={{ position: 'absolute', top: 9, right: 12, width: 2, height: 2, borderRadius: 1, backgroundColor: 'white', opacity: 0.7 }} />
                  </>
                )}
              </View>

              <Ionicons
                name={iconName}
                size={22}
                color={focused ? COLORS.primary : COLORS.gray}
                style={{
                  opacity: focused ? 1 : 0.8,
                  transform: [{ scale: focused ? 1.1 : 1 }]
                }}
              />

              {focused && (
                <View style={{
                  position: 'absolute',
                  bottom: -8,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.primary,
                  opacity: 0.6,
                }} />
              )}

              {badge > 0 && !isCenter && (
                <View style={[styles.badge, { top: -4, right: -4 }]}>
                  <View style={styles.badgeContent}>
                    <View style={styles.badgeInner} />
                  </View>
                </View>
              )}
            </View>
          );
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen name="Messages" component={MessagesStack} />
      <Tab.Screen name="Activity" component={ActivityStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

// Root App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = React.useState(null);

  React.useEffect(() => {
    checkOnboarding();

    // Re-check onboarding periodically or on focus
    const interval = setInterval(checkOnboarding, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      setOnboardingComplete(completed === 'true');
    } catch (error) {
      console.error('Check onboarding error:', error);
      setOnboardingComplete(false);
    }
  };

  if (isLoading || onboardingComplete === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Show welcome screen if onboarding not complete
  if (!onboardingComplete) {
    return <WelcomeStack />;
  }

  return isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  badgeContent: {
    backgroundColor: COLORS.error,
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
});

export default AppNavigator;
