import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { pickReviewPhotos } from '../services/imageService';

const WriteReviewScreen = ({ navigation, route }) => {
  const { serviceId, serviceType = 'challenge', serviceName = 'Activity' } = route.params || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState([]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // const result = await submitReview({
      //   serviceId,
      //   serviceType,
      //   rating,
      //   comment: reviewText,
      //   photos,
      // });

      Alert.alert(
        'Review Submitted',
        'Thank you for sharing your experience!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPhotos = async () => {
    const maxPhotos = 5;
    const remainingSlots = maxPhotos - photos.length;

    if (remainingSlots <= 0) {
      Alert.alert('Maximum Photos', 'You can add up to 5 photos only');
      return;
    }

    const selectedPhotos = await pickReviewPhotos(remainingSlots);

    if (selectedPhotos) {
      setPhotos([...photos, ...selectedPhotos]);
    }
  };

  const handleRemovePhoto = (index) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newPhotos = [...photos];
            newPhotos.splice(index, 1);
            setPhotos(newPhotos);
          },
        },
      ]
    );
  };

  const StarRatingInput = () => {
    const ratingDescriptions = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };

    return (
      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>Your Rating</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              activeOpacity={0.7}
              style={styles.starButton}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? COLORS.warning : COLORS.lightGray}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingDescription}>
            {ratingDescriptions[rating]}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Review</Text>
        <TouchableOpacity
          onPress={handleSubmitReview}
          style={styles.headerButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <Text style={styles.reviewingText}>You're reviewing</Text>
          <Text style={styles.serviceName}>{serviceName}</Text>
        </View>

        {/* Star Rating */}
        <StarRatingInput />

        {/* Review Text */}
        <View style={styles.reviewTextSection}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          <TextInput
            style={styles.reviewInput}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Share your experience with others..."
            placeholderTextColor={COLORS.lightGray}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={500}
          />
          <View style={styles.characterCountContainer}>
            <Text style={styles.characterCount}>
              {reviewText.length}/500 characters
            </Text>
            {reviewText.length < 10 && reviewText.length > 0 && (
              <Text style={styles.minimumWarning}>
                (Minimum 10 characters)
              </Text>
            )}
          </View>
        </View>

        {/* Review Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={COLORS.info} />
            <Text style={styles.tipsTitle}>Tips for writing a great review</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Be specific about your experience</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Mention what you liked or didn't like</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.tipText}>Keep it honest and helpful for others</Text>
            </View>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Share photos from your experience (up to 5)
          </Text>

          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            {photos.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleAddPhotos}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
          <Text style={styles.guidelinesText}>
            Please ensure your review is respectful and follows our community
            guidelines. Reviews containing inappropriate content, spam, or false
            information will be removed.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  submitButtonText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  serviceInfo: {
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    alignItems: 'center',
  },
  reviewingText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  ratingSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 24,
    paddingHorizontal: SIZES.padding,
    marginTop: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 8,
  },
  ratingDescription: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 12,
  },
  reviewTextSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: SIZES.padding,
    marginTop: 16,
  },
  reviewInput: {
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    height: 150,
  },
  characterCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  characterCount: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  minimumWarning: {
    fontSize: SIZES.sm,
    color: COLORS.warning,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: COLORS.info + '10',
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.info + '30',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.info,
    marginLeft: 8,
  },
  tipsList: {
    marginTop: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: SIZES.sm,
    color: COLORS.darkGray,
    marginLeft: 8,
    flex: 1,
  },
  photosSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: SIZES.padding,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  photoContainer: {
    width: '31.33%',
    aspectRatio: 1,
    margin: 6,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: '31.33%',
    aspectRatio: 1,
    margin: 6,
    borderWidth: 2,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
  },
  addPhotoText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  guidelinesCard: {
    backgroundColor: COLORS.lightestGray,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  guidelinesTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    lineHeight: 20,
  },
});

export default WriteReviewScreen;
