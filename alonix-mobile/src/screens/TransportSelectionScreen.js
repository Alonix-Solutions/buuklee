import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM } from '../utils/shadows';

const { width, height } = Dimensions.get('window');

const TransportSelectionScreen = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleServicePress = (service, navigateTo, params = {}) => {
    setSelectedService(service);

    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        navigation.navigate(navigateTo, params);
      }, 150);
    });
  };

  const ServiceCard = ({
    icon,
    title,
    description,
    gradient,
    onPress,
    badge,
    stats,
    image
  }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Background Pattern */}
        <View style={styles.cardPattern}>
          <Ionicons name={icon} size={120} color="rgba(255,255,255,0.1)" />
        </View>

        {/* Badge */}
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={36} color={COLORS.white} />
          </View>

          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>

          {/* Stats */}
          {stats && (
            <View style={styles.statsRow}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Ionicons name={stat.icon} size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statText}>{stat.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ icon, label, onPress, color }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Transportation Hub</Text>
            <Text style={styles.headerSubtitle}>Choose your journey</Text>
          </View>

          <TouchableOpacity style={styles.helpButton} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Travel Made Easy</Text>
          <Text style={styles.welcomeSubtext}>
            Book rides or rent vehicles for your adventures
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickActionButton
            icon="map-outline"
            label="View Map"
            color={COLORS.primary}
            onPress={() => navigation.navigate('UberStyleRide')}
          />
          <QuickActionButton
            icon="time-outline"
            label="My Bookings"
            color={COLORS.success}
            onPress={() => navigation.navigate('MyBookings')}
          />
          <QuickActionButton
            icon="star-outline"
            label="Favorites"
            color={COLORS.warning}
            onPress={() => { }}
          />
        </View>

        {/* Main Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Available Services</Text>

          <ServiceCard
            icon="car-sport-outline"
            title="Book a Ride"
            description="Professional drivers ready to take you anywhere"
            gradient={['#667eea', '#764ba2']}
            badge="Popular"
            stats={[
              { icon: 'time-outline', text: '3 min' },
              { icon: 'cash-outline', text: 'From Rs 300' },
              { icon: 'star', text: '4.8' },
            ]}
            onPress={() => handleServicePress('ride', 'UberStyleRide')}
          />

          <ServiceCard
            icon="car-outline"
            title="Rent a Car"
            description="Freedom to explore at your own pace"
            gradient={['#f093fb', '#f5576c']}
            stats={[
              { icon: 'calendar-outline', text: 'Daily/Weekly' },
              { icon: 'shield-checkmark', text: 'Insured' },
              { icon: 'star', text: '4.9' },
            ]}
            onPress={() => handleServicePress('car', 'CarRental')}
          />

          <ServiceCard
            icon="bicycle-outline"
            title="E-Bikes & Scooters"
            description="Quick and eco-friendly city transport"
            gradient={['#4facfe', '#00f2fe']}
            badge="New"
            stats={[
              { icon: 'leaf-outline', text: 'Eco' },
              { icon: 'flash-outline', text: 'Electric' },
              { icon: 'cash-outline', text: 'From Rs 50' },
            ]}
            onPress={() => { }}
          />
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>

          <View style={styles.featuresList}>
            <FeatureItem
              icon="shield-checkmark-outline"
              title="Safe & Secure"
              description="All rides are insured and tracked"
            />
            <FeatureItem
              icon="cash-outline"
              title="Best Prices"
              description="Competitive rates with no hidden fees"
            />
            <FeatureItem
              icon="time-outline"
              title="24/7 Support"
              description="Customer service always available"
            />
            <FeatureItem
              icon="star-outline"
              title="Top Rated"
              description="Verified drivers with 4.8+ ratings"
            />
          </View>
        </View>

        {/* Promo Banner */}
        <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FF6B6B', '#FFA07A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <Ionicons name="gift-outline" size={32} color={COLORS.white} />
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>First Ride Free!</Text>
                <Text style={styles.promoSubtitle}>Use code: ALONIX2025</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerTextContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  welcomeSection: {
    padding: SIZES.padding,
    paddingTop: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  servicesSection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_MEDIUM,
  },
  gradientCard: {
    padding: 20,
    minHeight: 180,
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  arrowContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  featuresSection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  featuresList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  promoBanner: {
    marginHorizontal: SIZES.padding,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOW_MEDIUM,
  },
  promoGradient: {
    padding: 20,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
});

export default TransportSelectionScreen;
