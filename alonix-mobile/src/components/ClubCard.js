import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_MEDIUM } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import { formatDateTime } from '../utils/helpers';

const ClubCard = ({ club, onPress }) => {
  const getTypeIcon = (type) => {
    const icons = {
      running: 'walk-outline',
      cycling: 'bicycle-outline',
      hiking: 'compass-outline',
      'multi-sport': 'fitness-outline',
    };
    return icons[type] || 'fitness-outline';
  };

  const getTypeColor = (type) => {
    const colors = {
      running: '#FF6B6B',
      cycling: '#4ECDC4',
      hiking: '#95E1D3',
      'multi-sport': '#A78BFA',
    };
    return colors[type] || COLORS.primary;
  };

  const typeColor = getTypeColor(club.type);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Cover Photo */}
      <Image source={{ uri: club.coverPhoto }} style={styles.coverPhoto} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo and Info */}
        <View style={styles.header}>
          <Image source={{ uri: club.logo }} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>
              {club.name}
            </Text>
            <View style={styles.typeRow}>
              <Ionicons
                name={getTypeIcon(club.type)}
                size={14}
                color={typeColor}
              />
              <Text style={[styles.typeText, { color: typeColor }]}>
                {capitalize(club.type).replace('-', ' ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {club.description}
        </Text>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.info}>
            <Ionicons name="people-outline" size={16} color={COLORS.gray} />
            <Text style={styles.infoText}>
              {typeof club.members === 'number'
                ? club.members
                : (Array.isArray(club.members) ? club.members.length : 0)} members
            </Text>
          </View>

          <View style={styles.info}>
            <Ionicons name="location-outline" size={16} color={COLORS.gray} />
            <Text style={styles.infoText}>
              {typeof club.location === 'string'
                ? club.location
                : (club.location?.address || 'Mauritius')}
            </Text>
          </View>
        </View>

        {/* Next Event */}
        {club.nextEvent && (
          <View style={styles.nextEvent}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <Text style={styles.nextEventText} numberOfLines={1}>
              Next: {club.nextEvent.title}
            </Text>
          </View>
        )}

        {/* Membership Badge */}
        <View style={styles.membershipBadge}>
          <Ionicons
            name={club.membershipType === 'open' ? 'lock-open-outline' : 'lock-closed-outline'}
            size={12}
            color={club.membershipType === 'open' ? COLORS.success : COLORS.warning}
          />
          <Text style={[
            styles.membershipText,
            { color: club.membershipType === 'open' ? COLORS.success : COLORS.warning }
          ]}>
            {club.membershipType === 'open' ? 'Open to join' : 'Application required'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
    ...SHADOW_MEDIUM,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Neutral Liquid Glass
    shadowColor: COLORS.darkGray,
    shadowOpacity: 0.1,
  },
  coverPhoto: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGray,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    marginLeft: 4,
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  nextEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '15',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  nextEventText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ClubCard;
