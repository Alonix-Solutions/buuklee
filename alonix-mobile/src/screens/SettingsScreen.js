import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [useMetric, setUseMetric] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingsItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={COLORS.primary} />
        </View>
        <View style={styles.settingsItemText}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      )}
    </TouchableOpacity>
  );

  const SettingsToggle = ({ icon, title, subtitle, value, onValueChange }) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={COLORS.primary} />
        </View>
        <View style={styles.settingsItemText}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '40' }}
        thumbColor={value ? COLORS.primary : COLORS.white}
        ios_backgroundColor={COLORS.lightGray}
      />
    </View>
  );

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Privacy"
            subtitle="Control who can see your activities"
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon')}
          />
          <SettingsItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => Alert.alert('Change Password', 'Password change coming soon')}
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsToggle
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive notifications about activities"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingsItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Manage email preferences"
            onPress={() => Alert.alert('Email', 'Email settings coming soon')}
          />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingsItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert('Language', 'Language selection coming soon')}
          />
          <SettingsToggle
            icon="speedometer-outline"
            title="Use Metric Units"
            subtitle={useMetric ? 'Kilometers' : 'Miles'}
            value={useMetric}
            onValueChange={setUseMetric}
          />
          <SettingsToggle
            icon="location-outline"
            title="Location Services"
            subtitle="Enable for tracking and navigation"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
          />
          <SettingsToggle
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark theme"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </SettingsSection>

        {/* Activity Section */}
        <SettingsSection title="Activity">
          <SettingsItem
            icon="trophy-outline"
            title="Achievements"
            subtitle="View your unlocked achievements"
            onPress={() => navigation.navigate('Achievements')}
          />
          <SettingsItem
            icon="stats-chart-outline"
            title="Activity Data"
            subtitle="Manage your activity history"
            onPress={() => Alert.alert('Activity Data', 'Data management coming soon')}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingsItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="FAQs and contact support"
            onPress={() => navigation.navigate('Help')}
          />
          <SettingsItem
            icon="star-outline"
            title="Rate App"
            subtitle="Share your feedback"
            onPress={() => Alert.alert('Rate App', 'Thank you for your support!')}
          />
          <SettingsItem
            icon="share-outline"
            title="Share App"
            subtitle="Invite your friends"
            onPress={() => Alert.alert('Share', 'Share functionality coming soon')}
          />
        </SettingsSection>

        {/* Legal Section */}
        <SettingsSection title="Legal">
          <SettingsItem
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => navigation.navigate('Help', { section: 'terms' })}
          />
          <SettingsItem
            icon="shield-outline"
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => navigation.navigate('Help', { section: 'privacy' })}
          />
          <SettingsItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('About Alonix', 'Social Fitness & Tourism Platform\nVersion 1.0.0\n\nMade with love in Mauritius')}
          />
        </SettingsSection>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    ...SHADOW_SMALL,
  },
  logoutText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: 8,
  },
});

export default SettingsScreen;
