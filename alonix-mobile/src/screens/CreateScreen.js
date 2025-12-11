import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM } from '../utils/shadows';

const CreateScreen = ({ navigation }) => {
  const CreateOption = ({ icon, title, description, color, onPress }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New</Text>
        <Text style={styles.subtitle}>
          What would you like to create today?
        </Text>
      </View>

      <View style={styles.content}>
        <CreateOption
          icon="bicycle-outline"
          title="Create Challenge"
          description="Organize a fitness challenge for friends or public"
          color={COLORS.primary}
          onPress={() => navigation.navigate('CreateChallenge')}
        />

        <CreateOption
          icon="car-outline"
          title="Offer Ride Share"
          description="Share a ride to a challenge and split costs"
          color={COLORS.success}
          onPress={() => navigation.navigate('CreateRide')}
        />

        <CreateOption
          icon="people-outline"
          title="Create Club"
          description="Start a fitness club for your community"
          color={COLORS.secondary}
          onPress={() => { }}
        />

        <CreateOption
          icon="megaphone-outline"
          title="Post Achievement"
          description="Share your latest fitness accomplishment"
          color={COLORS.warning}
          onPress={() => { }}
        />

        <CreateOption
          icon="calendar-outline"
          title="Schedule Event"
          description="Plan a club event or group activity"
          color={COLORS.info}
          onPress={() => { }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: 32,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  content: {
    padding: SIZES.padding,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOW_MEDIUM,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    lineHeight: 18,
  },
});

export default CreateScreen;
