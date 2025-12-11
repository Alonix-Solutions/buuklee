import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocialShareService {
  constructor() {
    this.shareCountKey = '@alonix_share_counts';
  }

  // Generate shareable activity image from a component ref
  async generateActivityImage(viewRef, options = {}) {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        ...options,
      });
      return { success: true, uri };
    } catch (error) {
      console.error('Error capturing activity image:', error);
      return { success: false, error: error.message };
    }
  }

  // Create share link with UTM parameters
  createShareLink(activityId, platform = 'general', userId = null) {
    const baseUrl = 'https://alonix.app'; // Replace with your actual domain
    const params = new URLSearchParams({
      activity_id: activityId,
      utm_source: platform,
      utm_medium: 'social',
      utm_campaign: 'activity_share',
    });

    if (userId) {
      params.append('shared_by', userId);
    }

    return `${baseUrl}/activity/${activityId}?${params.toString()}`;
  }

  // Generate deep link for app-to-app sharing
  createDeepLink(activityId, type = 'activity') {
    return `alonix://${type}/${activityId}`;
  }

  // Format message for specific platform
  formatMessageForPlatform(platform, activity, stats, shareLink) {
    const baseMessage = `${activity.title}\n\n`;
    const statsText = this.formatStats(stats);

    switch (platform) {
      case 'facebook':
        return `${baseMessage}${statsText}\n\nJoin me on Alonix!\n${shareLink}`;

      case 'twitter':
        // Twitter has character limit
        const shortStats = `${stats.distance}km • ${stats.duration} • ${stats.pace}/km`;
        return `${activity.title}\n${shortStats}\n\n#Alonix #Fitness #${activity.type}\n${shareLink}`;

      case 'instagram':
        // Instagram typically uses image with minimal text
        return `${baseMessage}${statsText}\n\n#Alonix #Fitness #${activity.type} #${activity.location || 'Mauritius'}`;

      case 'whatsapp':
        return `Check out my ${activity.type} activity! 🏃\n\n${baseMessage}${statsText}\n\nDownload Alonix: ${shareLink}`;

      case 'telegram':
        return `🏃 *${activity.title}*\n\n${statsText}\n\nJoin me on Alonix!\n${shareLink}`;

      default:
        return `${baseMessage}${statsText}\n\nCheck it out on Alonix: ${shareLink}`;
    }
  }

  // Format stats into readable text
  formatStats(stats) {
    const lines = [];

    if (stats.distance) {
      lines.push(`📍 Distance: ${stats.distance}`);
    }
    if (stats.duration) {
      lines.push(`⏱️ Time: ${stats.duration}`);
    }
    if (stats.pace) {
      lines.push(`⚡ Pace: ${stats.pace}/km`);
    }
    if (stats.elevation) {
      lines.push(`⛰️ Elevation: ${stats.elevation}m`);
    }
    if (stats.calories) {
      lines.push(`🔥 Calories: ${stats.calories}`);
    }

    return lines.join('\n');
  }

  // Share via native system share
  async shareViaSystem(message, imageUri = null, title = 'Share Activity') {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        return { success: false, error: 'Sharing is not available on this device' };
      }

      if (imageUri) {
        // Share image with text
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          dialogTitle: title,
          UTI: 'public.png',
        });
      } else {
        // Share text only - use React Native's Share
        const Share = require('react-native').Share;
        await Share.share({
          message,
          title,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error sharing via system:', error);
      return { success: false, error: error.message };
    }
  }

  // Share to specific platform
  async shareToPlatform(platform, message, imageUri = null) {
    try {
      let url = '';

      switch (platform) {
        case 'facebook':
          // Facebook doesn't support pre-filled text on mobile, just open sharing
          if (imageUri) {
            return await this.shareViaSystem(message, imageUri, 'Share to Facebook');
          }
          url = `fb://facewebmodal/f?href=https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message)}`;
          break;

        case 'twitter':
          url = `twitter://post?message=${encodeURIComponent(message)}`;
          break;

        case 'instagram':
          // Instagram sharing requires special handling
          if (imageUri) {
            return await this.shareToInstagram(imageUri, message);
          }
          return { success: false, error: 'Instagram requires an image to share' };

        case 'whatsapp':
          url = `whatsapp://send?text=${encodeURIComponent(message)}`;
          break;

        case 'telegram':
          url = `tg://msg?text=${encodeURIComponent(message)}`;
          break;

        default:
          return await this.shareViaSystem(message, imageUri);
      }

      // Try to open the platform's app
      const { Linking } = require('react-native');
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        // Fallback to system share
        return await this.shareViaSystem(message, imageUri);
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Special handling for Instagram
  async shareToInstagram(imageUri, caption) {
    try {
      const { Linking } = require('react-native');

      // Copy image to a location Instagram can access
      const newUri = `${FileSystem.documentDirectory}instagram_share.png`;
      await FileSystem.copyAsync({
        from: imageUri,
        to: newUri,
      });

      // Try to open Instagram with the image
      const instagramUrl = `instagram://library?AssetPath=${newUri}`;
      const canOpen = await Linking.canOpenURL(instagramUrl);

      if (canOpen) {
        await Linking.openURL(instagramUrl);
        return { success: true };
      } else {
        // Fallback to system share
        return await this.shareViaSystem(caption, imageUri, 'Share to Instagram');
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      return { success: false, error: error.message };
    }
  }

  // Copy link to clipboard
  async copyToClipboard(text) {
    try {
      const { Clipboard } = require('react-native');
      await Clipboard.setString(text);
      return { success: true };
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return { success: false, error: error.message };
    }
  }

  // Track share count
  async trackShare(activityId, platform) {
    try {
      const countsJson = await AsyncStorage.getItem(this.shareCountKey);
      const counts = countsJson ? JSON.parse(countsJson) : {};

      if (!counts[activityId]) {
        counts[activityId] = {};
      }

      if (!counts[activityId][platform]) {
        counts[activityId][platform] = 0;
      }

      counts[activityId][platform]++;
      counts[activityId].total = (counts[activityId].total || 0) + 1;
      counts[activityId].lastSharedAt = new Date().toISOString();

      await AsyncStorage.setItem(this.shareCountKey, JSON.stringify(counts));

      return { success: true, count: counts[activityId].total };
    } catch (error) {
      console.error('Error tracking share:', error);
      return { success: false, error: error.message };
    }
  }

  // Get share count for activity
  async getShareCount(activityId) {
    try {
      const countsJson = await AsyncStorage.getItem(this.shareCountKey);
      const counts = countsJson ? JSON.parse(countsJson) : {};
      return counts[activityId]?.total || 0;
    } catch (error) {
      console.error('Error getting share count:', error);
      return 0;
    }
  }

  // Get all share stats
  async getShareStats(activityId) {
    try {
      const countsJson = await AsyncStorage.getItem(this.shareCountKey);
      const counts = countsJson ? JSON.parse(countsJson) : {};
      return counts[activityId] || { total: 0 };
    } catch (error) {
      console.error('Error getting share stats:', error);
      return { total: 0 };
    }
  }

  // Generate QR code data
  generateQRCodeData(activityId, type = 'activity') {
    const deepLink = this.createDeepLink(activityId, type);
    return deepLink;
  }

  // Clean up temporary files
  async cleanupTempFiles() {
    try {
      const tempDir = `${FileSystem.documentDirectory}temp_shares/`;
      const dirInfo = await FileSystem.getInfoAsync(tempDir);

      if (dirInfo.exists) {
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
      }

      return { success: true };
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SocialShareService();
