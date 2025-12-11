import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM } from '../utils/shadows';
import { capitalize } from '../utils/helpers';
import moment from 'moment';

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    user: {
      name: 'Alice Martinez',
      photo: 'https://i.pravatar.cc/150?img=1',
    },
    rating: 5,
    date: '2025-11-10T10:30:00',
    comment: 'Amazing experience! The cycling route was challenging but incredibly scenic. Well organized and the group was friendly. Would definitely recommend!',
    photos: [
      'https://picsum.photos/seed/review1-1/400/300',
      'https://picsum.photos/seed/review1-2/400/300',
    ],
    helpful: 24,
    isHelpful: false,
  },
  {
    id: 2,
    user: {
      name: 'Bob Chen',
      photo: 'https://i.pravatar.cc/150?img=12',
    },
    rating: 4,
    date: '2025-11-08T14:20:00',
    comment: 'Great challenge overall. The sunrise view from the top was breathtaking. Lost one star because the meeting time was a bit too early for me.',
    photos: [
      'https://picsum.photos/seed/review2-1/400/300',
    ],
    helpful: 18,
    isHelpful: true,
  },
  {
    id: 3,
    user: {
      name: 'Diana Lee',
      photo: 'https://i.pravatar.cc/150?img=9',
    },
    rating: 5,
    date: '2025-11-05T09:15:00',
    comment: 'Exceeded my expectations! The organizer was professional and safety-conscious. Beautiful route with plenty of photo opportunities.',
    photos: [],
    helpful: 32,
    isHelpful: false,
  },
  {
    id: 4,
    user: {
      name: 'Mike Johnson',
      photo: 'https://i.pravatar.cc/150?img=8',
    },
    rating: 3,
    date: '2025-11-02T16:45:00',
    comment: 'Decent experience but could be better. The pace was too slow for experienced runners. Good for beginners though.',
    photos: [],
    helpful: 12,
    isHelpful: false,
  },
  {
    id: 5,
    user: {
      name: 'Sarah Thompson',
      photo: 'https://i.pravatar.cc/150?img=5',
    },
    rating: 5,
    date: '2025-10-28T11:30:00',
    comment: 'Perfect challenge for intermediate cyclists! The coastal views were stunning and the group energy was fantastic. Will join again!',
    photos: [
      'https://picsum.photos/seed/review5-1/400/300',
      'https://picsum.photos/seed/review5-2/400/300',
      'https://picsum.photos/seed/review5-3/400/300',
    ],
    helpful: 45,
    isHelpful: true,
  },
];

const ReviewsScreen = ({ navigation, route }) => {
  const { serviceId, serviceType = 'challenge', serviceName = 'Activity' } = route.params || {};
  const [reviews, setReviews] = useState(mockReviews);
  const [sortBy, setSortBy] = useState('recent'); // recent, helpful, rating

  // Calculate statistics
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const handleToggleHelpful = (reviewId) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          isHelpful: !review.isHelpful,
          helpful: review.isHelpful ? review.helpful - 1 : review.helpful + 1,
        };
      }
      return review;
    }));
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    let sorted = [...reviews];

    switch (sortType) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'helpful':
        sorted.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
    }

    setReviews(sorted);
  };

  const handleWriteReview = () => {
    navigation.navigate('WriteReview', { serviceId, serviceType, serviceName });
  };

  const StarRating = ({ rating, size = 16 }) => (
    <View style={styles.starRating}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? COLORS.warning : COLORS.lightGray}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );

  const RatingBar = ({ rating, count, total }) => {
    const percentage = (count / total) * 100;

    return (
      <View style={styles.ratingBar}>
        <Text style={styles.ratingBarLabel}>{rating}</Text>
        <Ionicons name="star" size={12} color={COLORS.warning} />
        <View style={styles.ratingBarTrack}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  const ReviewCard = ({ review }) => (
    <View style={styles.reviewCard}>
      {/* User Info */}
      <View style={styles.reviewHeader}>
        <Image source={{ uri: review.user.photo }} style={styles.userPhoto} />
        <View style={styles.reviewUserInfo}>
          <Text style={styles.reviewUserName}>{review.user.name}</Text>
          <View style={styles.reviewMeta}>
            <StarRating rating={review.rating} size={14} />
            <Text style={styles.reviewDate}>
              {moment(review.date).fromNow()}
            </Text>
          </View>
        </View>
      </View>

      {/* Review Content */}
      <Text style={styles.reviewComment}>{review.comment}</Text>

      {/* Review Photos */}
      {review.photos && review.photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.reviewPhotosContainer}
        >
          {review.photos.map((photo, index) => (
            <TouchableOpacity key={index} activeOpacity={0.8}>
              <Image source={{ uri: photo }} style={styles.reviewPhoto} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Helpful Button */}
      <TouchableOpacity
        style={styles.helpfulButton}
        onPress={() => handleToggleHelpful(review.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={review.isHelpful ? 'thumbs-up' : 'thumbs-up-outline'}
          size={16}
          color={review.isHelpful ? COLORS.primary : COLORS.gray}
        />
        <Text
          style={[
            styles.helpfulText,
            review.isHelpful && styles.helpfulTextActive,
          ]}
        >
          Helpful ({review.helpful})
        </Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Rating Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            <StarRating rating={Math.round(averageRating)} size={20} />
            <Text style={styles.totalReviews}>
              Based on {reviews.length} reviews
            </Text>
          </View>

          <View style={styles.summaryRight}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <RatingBar
                key={rating}
                rating={rating}
                count={ratingCounts[rating]}
                total={reviews.length}
              />
            ))}
          </View>
        </View>

        {/* Write Review Button */}
        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={handleWriteReview}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.white} />
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortButtons}>
            {['recent', 'helpful', 'rating'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.sortButton,
                  sortBy === type && styles.sortButtonActive,
                ]}
                onPress={() => handleSortChange(type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === type && styles.sortButtonTextActive,
                  ]}
                >
                  {capitalize(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>

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
  summaryCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    ...SHADOW_MEDIUM,
  },
  summaryLeft: {
    alignItems: 'center',
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: 'rgba(200, 200, 200, 0.3)', // Neutral divider
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 8,
  },
  summaryRight: {
    flex: 1,
    paddingLeft: 24,
    justifyContent: 'center',
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBarLabel: {
    fontSize: SIZES.sm,
    color: COLORS.darkGray,
    fontWeight: '600',
    width: 12,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.lightestGray,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    width: 24,
    textAlign: 'right',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    ...SHADOW_SMALL,
  },
  writeReviewText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginTop: 16,
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.lightestGray,
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray,
  },
  sortButtonTextActive: {
    color: COLORS.white,
  },
  reviewsList: {
    paddingHorizontal: SIZES.padding,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...SHADOW_SMALL,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starRating: {
    flexDirection: 'row',
    marginRight: 12,
  },
  reviewDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  reviewComment: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewPhotosContainer: {
    marginBottom: 12,
  },
  reviewPhoto: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: COLORS.lightGray,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  helpfulText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    fontWeight: '600',
    marginLeft: 6,
  },
  helpfulTextActive: {
    color: COLORS.primary,
  },
});

export default ReviewsScreen;
