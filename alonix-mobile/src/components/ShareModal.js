import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows';
import ActivityShareCard from './ActivityShareCard';
import SocialShareService from '../services/SocialShareService';
import gpsService from '../services/gpsService';

const { height, width } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.75;

const ShareModal = ({ visible, onClose, activity, user, type = 'activity' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareStats, setShareStats] = useState({ total: 0 });

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const copyAnimValue = useRef(new Animated.Value(0)).current;
  const shareCardRef = useRef(null);

  useEffect(() => {
    if (visible) {
      openModal();
      loadShareStats();
    } else {
      closeModal();
    }
  }, [visible]);

  useEffect(() => {
    if (copySuccess) {
      Animated.sequence([
        Animated.timing(copyAnimValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(copyAnimValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setCopySuccess(false));
    }
  }, [copySuccess]);

  const loadShareStats = async () => {
    if (!activity?.id) return;
    const stats = await SocialShareService.getShareStats(activity.id);
    setShareStats(stats);
  };

  const openModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowQRCode(false);
    });
  };

  const formatActivityStats = () => {
    if (!activity) return {};

    return {
      distance: gpsService.formatDistance(activity.distance),
      duration: gpsService.formatDuration(activity.duration),
      pace: gpsService.formatPace(activity.averagePace || activity.avgPace),
      elevation: activity.elevation?.gain || activity.elevation,
      calories: activity.calories,
    };
  };

  const handleShareToPlatform = async (platform) => {
    if (!activity) return;

    setIsLoading(true);

    try {
      const stats = formatActivityStats();
      const shareLink = SocialShareService.createShareLink(activity.id, platform, user?.id);
      const message = SocialShareService.formatMessageForPlatform(
        platform,
        activity,
        stats,
        shareLink
      );

      // For platforms that support images, generate the share card
      let imageUri = null;
      if (['instagram', 'facebook'].includes(platform) && shareCardRef.current) {
        const result = await SocialShareService.generateActivityImage(shareCardRef.current);
        if (result.success) {
          imageUri = result.uri;
        }
      }

      const result = await SocialShareService.shareToPlatform(platform, message, imageUri);

      if (result.success) {
        await SocialShareService.trackShare(activity.id, platform);
        await loadShareStats();
        Alert.alert('Success', `Shared to ${platform}!`);
      } else {
        Alert.alert('Error', result.error || 'Failed to share');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Something went wrong while sharing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemShare = async () => {
    if (!activity) return;

    setIsLoading(true);

    try {
      const stats = formatActivityStats();
      const shareLink = SocialShareService.createShareLink(activity.id, 'system', user?.id);
      const message = SocialShareService.formatMessageForPlatform(
        'general',
        activity,
        stats,
        shareLink
      );

      // Generate image if card is available
      let imageUri = null;
      if (shareCardRef.current) {
        const result = await SocialShareService.generateActivityImage(shareCardRef.current);
        if (result.success) {
          imageUri = result.uri;
        }
      }

      const result = await SocialShareService.shareViaSystem(
        message,
        imageUri,
        `Share ${activity.title}`
      );

      if (result.success) {
        await SocialShareService.trackShare(activity.id, 'system');
        await loadShareStats();
      }
    } catch (error) {
      console.error('System share error:', error);
      Alert.alert('Error', 'Failed to share');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!activity) return;

    const shareLink = SocialShareService.createShareLink(activity.id, 'link', user?.id);
    const result = await SocialShareService.copyToClipboard(shareLink);

    if (result.success) {
      setCopySuccess(true);
      await SocialShareService.trackShare(activity.id, 'link');
      await loadShareStats();
    } else {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  const getQRCodeData = () => {
    if (!activity?.id) return '';
    return SocialShareService.generateQRCodeData(activity.id, type);
  };

  const platformButtons = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'logo-facebook',
      color: '#1877F2',
      gradient: ['#1877F2', '#0C63D4'],
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
      gradient: ['#F58529', '#DD2A7B'],
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: 'logo-twitter',
      color: '#1DA1F2',
      gradient: ['#1DA1F2', '#0C85D0'],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      gradient: ['#25D366', '#1EBE57'],
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: 'paper-plane',
      color: '#0088CC',
      gradient: ['#0088CC', '#006BA8'],
    },
  ];

  const copyButtonScale = copyAnimValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  if (!activity) return null;

  const stats = formatActivityStats();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Share Activity</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Activity Preview Card - Hidden but used for image generation */}
            <View style={styles.hiddenCardContainer}>
              <ActivityShareCard
                ref={shareCardRef}
                activity={activity}
                user={user}
                stats={stats}
                achievements={activity.achievements}
              />
            </View>

            {/* Stats Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Activity Preview</Text>
              <View style={styles.statsCard}>
                <Text style={styles.activityTitle} numberOfLines={2}>
                  {activity.title}
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.previewStat}>
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                    <Text style={styles.previewStatText}>{stats.distance}</Text>
                  </View>
                  <View style={styles.previewStat}>
                    <Ionicons name="time" size={20} color={COLORS.secondary} />
                    <Text style={styles.previewStatText}>{stats.duration}</Text>
                  </View>
                  <View style={styles.previewStat}>
                    <Ionicons name="speedometer" size={20} color={COLORS.accent} />
                    <Text style={styles.previewStatText}>{stats.pace}/km</Text>
                  </View>
                </View>
                {shareStats.total > 0 && (
                  <View style={styles.shareCount}>
                    <Ionicons name="share-social" size={16} color={COLORS.gray} />
                    <Text style={styles.shareCountText}>
                      Shared {shareStats.total} time{shareStats.total !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Platform Buttons */}
            <View style={styles.platformsSection}>
              <Text style={styles.sectionTitle}>Share to Social Media</Text>
              <View style={styles.platformGrid}>
                {platformButtons.map((platform) => (
                  <TouchableOpacity
                    key={platform.id}
                    style={[styles.platformButton, { backgroundColor: platform.color }]}
                    onPress={() => handleShareToPlatform(platform.id)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={platform.icon} size={28} color={COLORS.white} />
                    <Text style={styles.platformName}>{platform.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              {/* System Share */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSystemShare}
                disabled={isLoading}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="share-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Share via...</Text>
                  <Text style={styles.actionSubtitle}>Use system share menu</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>

              {/* Copy Link */}
              <Animated.View style={{ transform: [{ scale: copyButtonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    copySuccess && styles.actionButtonSuccess,
                  ]}
                  onPress={handleCopyLink}
                  disabled={isLoading}
                >
                  <View style={[styles.actionIcon, copySuccess && styles.actionIconSuccess]}>
                    <Ionicons
                      name={copySuccess ? 'checkmark' : 'link'}
                      size={24}
                      color={copySuccess ? COLORS.success : COLORS.accent}
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>
                      {copySuccess ? 'Link Copied!' : 'Copy Link'}
                    </Text>
                    <Text style={styles.actionSubtitle}>
                      {copySuccess ? 'Ready to share' : 'Copy shareable link to clipboard'}
                    </Text>
                  </View>
                  <Ionicons
                    name={copySuccess ? 'checkmark-circle' : 'copy-outline'}
                    size={20}
                    color={copySuccess ? COLORS.success : COLORS.gray}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* QR Code */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleQRCode}
                disabled={isLoading}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="qr-code" size={24} color={COLORS.secondary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>QR Code</Text>
                  <Text style={styles.actionSubtitle}>
                    {showQRCode ? 'Hide QR code' : 'Show QR code for scanning'}
                  </Text>
                </View>
                <Ionicons
                  name={showQRCode ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.gray}
                />
              </TouchableOpacity>

              {/* QR Code Display */}
              {showQRCode && (
                <View style={styles.qrCodeContainer}>
                  <View style={styles.qrCodeWrapper}>
                    <QRCode
                      value={getQRCodeData()}
                      size={200}
                      backgroundColor={COLORS.white}
                      color={COLORS.darkGray}
                      logo={require('../../assets/icon.png')}
                      logoSize={40}
                      logoBackgroundColor={COLORS.white}
                    />
                  </View>
                  <Text style={styles.qrCodeText}>Scan to view activity</Text>
                </View>
              )}
            </View>

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Preparing to share...</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...SHADOW_LARGE,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  hiddenCardContainer: {
    position: 'absolute',
    left: -10000,
    top: -10000,
  },
  previewSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 16,
    padding: 16,
    ...SHADOW_SMALL,
  },
  activityTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewStat: {
    alignItems: 'center',
    gap: 6,
  },
  previewStatText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  shareCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  shareCountText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  platformsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformButton: {
    width: (width - 64) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_MEDIUM,
  },
  platformName: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
    marginTop: 8,
  },
  actionsSection: {
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOW_SMALL,
  },
  actionButtonSuccess: {
    backgroundColor: COLORS.success + '15',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...SHADOW_SMALL,
  },
  actionIconSuccess: {
    backgroundColor: COLORS.success + '20',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  qrCodeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 8,
    ...SHADOW_SMALL,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...SHADOW_MEDIUM,
  },
  qrCodeText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 12,
    fontWeight: '500',
  },
  loadingOverlay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 12,
  },
});

export default ShareModal;
