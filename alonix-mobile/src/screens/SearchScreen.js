import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import SearchBar from '../components/SearchBar';
import FilterModal from '../components/FilterModal';
import FilterChips from '../components/FilterChips';

const SearchScreen = ({ navigation }) => {
  const { user } = useAuth();

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [filters, setFilters] = useState({});

  const categories = [
    { id: 'all', label: 'All', icon: 'search' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'challenges', label: 'Challenges', icon: 'trophy' },
    { id: 'places', label: 'Places', icon: 'location' },
  ];

  useEffect(() => {
    loadRecentSearches();
    loadPopularSearches();
    loadSearchSuggestions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory, filters]);

  const loadRecentSearches = async () => {
    try {
      const recent = await AsyncStorage.getItem('@recent_searches');
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const loadPopularSearches = () => {
    const popular = [
      { id: '1', text: 'Marathon training', type: 'challenges', icon: 'trophy' },
      { id: '2', text: 'Mountain trails', type: 'places', icon: 'location' },
      { id: '3', text: 'Cycling routes', type: 'places', icon: 'location' },
      { id: '4', text: 'Running clubs', type: 'challenges', icon: 'people' },
      { id: '5', text: 'Fitness challenges', type: 'challenges', icon: 'trophy' },
    ];
    setPopularSearches(popular);
  };

  const loadSearchSuggestions = () => {
    const suggestionsList = [
      'Marathon training',
      'Mountain trails',
      'Cycling routes',
      'Running clubs',
      'Fitness challenges',
      'Karura Forest',
      'Ngong Hills',
      '5K run',
      '10K training',
      'Half marathon',
      'Triathlon',
      'Swimming pools',
      'Yoga classes',
      'Gym workouts',
      'Personal trainer',
    ];
    setSuggestions(suggestionsList);
  };



  const performSearch = async () => {
    try {
      setIsSearching(true);
      setShowResults(true);

      // Fetch real data for activities (Challenges)
      // For Users and Places, we might still need mock or separate services if not implemented
      const activitiesResponse = await activityService.getActivities({ search: searchQuery });

      const realChallenges = (activitiesResponse.activities || []).map(act => ({
        id: act._id || act.id,
        type: 'challenge',
        title: act.title,
        description: act.description,
        participants: act.currentParticipants || 0,
        difficulty: act.difficulty,
        icon: 'trophy', // Default icon
        price: act.price || 0,
        rating: 4.5, // Mock rating for now
        activity: act.activityType
      }));

      // Merge with mock users/places for now until those APIs exist
      const mockUsers = generateMockResults(searchQuery, 'users', {}).filter(i => i.type === 'user');
      const mockPlaces = generateMockResults(searchQuery, 'places', {}).filter(i => i.type === 'place');

      let combined = [];
      if (selectedCategory === 'all') {
        combined = [...mockUsers, ...realChallenges, ...mockPlaces];
      } else if (selectedCategory === 'challenges') {
        combined = realChallenges;
      } else {
        // Fallback to mock for others
        combined = generateMockResults(searchQuery, selectedCategory, filters);
      }

      setSearchResults(combined);
      await saveRecentSearch(searchQuery, selectedCategory);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const generateMockResults = (query, category, appliedFilters) => {
    const mockUsers = [
      {
        id: 'user_1',
        type: 'user',
        name: 'Sarah Johnson',
        username: '@sarahj',
        avatar: 'https://i.pravatar.cc/150?img=5',
        followers: 342,
        isFollowing: false,
      },
      {
        id: 'user_2',
        type: 'user',
        name: 'Mike Chen',
        username: '@mikechen',
        avatar: 'https://i.pravatar.cc/150?img=12',
        followers: 189,
        isFollowing: true,
      },
    ];

    const mockChallenges = [
      {
        id: 'challenge_1',
        type: 'challenge',
        title: 'Marathon Training Challenge',
        description: '12-week marathon preparation program',
        participants: 245,
        difficulty: 'hard',
        icon: 'trophy',
        price: 50,
        rating: 4.8,
        activity: 'running',
      },
      {
        id: 'challenge_2',
        type: 'challenge',
        title: '30-Day Cycling Challenge',
        description: 'Ride 500km in 30 days',
        participants: 567,
        difficulty: 'moderate',
        icon: 'bicycle',
        price: 30,
        rating: 4.5,
        activity: 'cycling',
      },
      {
        id: 'challenge_3',
        type: 'challenge',
        title: 'Beginner Running Program',
        description: 'Get started with running',
        participants: 892,
        difficulty: 'easy',
        icon: 'walk',
        price: 0,
        rating: 4.9,
        activity: 'running',
      },
    ];

    const mockPlaces = [
      {
        id: 'place_1',
        type: 'place',
        name: 'Karura Forest',
        location: 'Nairobi, Kenya',
        distance: 2.5,
        rating: 4.8,
        image: 'https://picsum.photos/400/300?random=1',
        amenities: ['parking', 'restrooms', 'water'],
      },
      {
        id: 'place_2',
        type: 'place',
        name: 'Ngong Hills',
        location: 'Ngong, Kenya',
        distance: 15,
        rating: 4.9,
        image: 'https://picsum.photos/400/300?random=2',
        amenities: ['parking'],
      },
      {
        id: 'place_3',
        type: 'place',
        name: 'Uhuru Park',
        location: 'Nairobi CBD',
        distance: 5,
        rating: 4.2,
        image: 'https://picsum.photos/400/300?random=3',
        amenities: ['parking', 'restrooms', 'water', 'food'],
      },
    ];

    let results = [];

    if (category === 'all') {
      results = [...mockUsers, ...mockChallenges, ...mockPlaces];
    } else if (category === 'users') {
      results = mockUsers;
    } else if (category === 'challenges') {
      results = mockChallenges;
    } else if (category === 'places') {
      results = mockPlaces;
    }

    // Filter by query
    results = results.filter((item) => {
      const searchText = query.toLowerCase();
      if (item.type === 'user') {
        return (
          item.name.toLowerCase().includes(searchText) ||
          item.username.toLowerCase().includes(searchText)
        );
      } else if (item.type === 'challenge') {
        return (
          item.title.toLowerCase().includes(searchText) ||
          item.description.toLowerCase().includes(searchText)
        );
      } else if (item.type === 'place') {
        return (
          item.name.toLowerCase().includes(searchText) ||
          item.location.toLowerCase().includes(searchText)
        );
      }
      return false;
    });

    // Apply filters
    if (appliedFilters.priceRange) {
      results = results.filter((item) => {
        if (item.type === 'challenge') {
          return item.price >= appliedFilters.priceRange[0] &&
            item.price <= appliedFilters.priceRange[1];
        }
        return true;
      });
    }

    if (appliedFilters.distance) {
      results = results.filter((item) => {
        if (item.type === 'place') {
          return item.distance <= appliedFilters.distance;
        }
        return true;
      });
    }

    if (appliedFilters.difficulty && appliedFilters.difficulty.length > 0) {
      results = results.filter((item) => {
        if (item.type === 'challenge') {
          return appliedFilters.difficulty.includes(item.difficulty);
        }
        return true;
      });
    }

    if (appliedFilters.activityTypes && appliedFilters.activityTypes.length > 0) {
      results = results.filter((item) => {
        if (item.type === 'challenge') {
          return appliedFilters.activityTypes.includes(item.activity);
        }
        return true;
      });
    }

    if (appliedFilters.rating) {
      results = results.filter((item) => {
        if (item.rating) {
          return item.rating >= appliedFilters.rating;
        }
        return true;
      });
    }

    if (appliedFilters.amenities && appliedFilters.amenities.length > 0) {
      results = results.filter((item) => {
        if (item.type === 'place' && item.amenities) {
          return appliedFilters.amenities.some((amenity) =>
            item.amenities.includes(amenity)
          );
        }
        return true;
      });
    }

    return results;
  };

  const saveRecentSearch = async (query, category) => {
    try {
      const newSearch = query.trim();
      if (!newSearch) return;

      const updatedRecent = [
        newSearch,
        ...recentSearches.filter((s) => s !== newSearch),
      ].slice(0, 10);

      setRecentSearches(updatedRecent);
      await AsyncStorage.setItem('@recent_searches', JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const handleSearchSelect = (searchText) => {
    setSearchQuery(searchText);
  };

  const handleClearRecent = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem('@recent_searches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const handleResultPress = (result) => {
    if (result.type === 'user') {
      navigation.navigate('UserProfile', {
        userId: result.id,
        userData: result,
      });
    } else if (result.type === 'challenge') {
      navigation.navigate('ChallengeDetail', { challengeId: result.id });
    } else if (result.type === 'place') {
      navigation.navigate('PlaceDetail', { placeId: result.id });
    }
  };

  const handleApplyFilters = (appliedFilters) => {
    setFilters(appliedFilters);
    setShowFilterModal(false);

    // Convert filters to active filter chips
    const chips = [];

    if (appliedFilters.priceRange &&
      (appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < 1000)) {
      chips.push({
        type: 'price',
        value: appliedFilters.priceRange,
      });
    }

    if (appliedFilters.distance && appliedFilters.distance < 50) {
      chips.push({
        type: 'distance',
        value: appliedFilters.distance,
      });
    }

    appliedFilters.difficulty?.forEach((diff) => {
      chips.push({
        type: 'difficulty',
        value: diff,
      });
    });

    appliedFilters.activityTypes?.forEach((activity) => {
      chips.push({
        type: 'activity',
        value: activity,
      });
    });

    if (appliedFilters.rating && appliedFilters.rating > 0) {
      chips.push({
        type: 'rating',
        value: appliedFilters.rating,
      });
    }

    setActiveFilters(chips);
  };

  const handleRemoveFilter = (filter) => {
    const newFilters = { ...filters };

    if (filter.type === 'price') {
      newFilters.priceRange = [0, 1000];
    } else if (filter.type === 'distance') {
      newFilters.distance = 50;
    } else if (filter.type === 'difficulty') {
      newFilters.difficulty = newFilters.difficulty?.filter((d) => d !== filter.value);
    } else if (filter.type === 'activity') {
      newFilters.activityTypes = newFilters.activityTypes?.filter((a) => a !== filter.value);
    } else if (filter.type === 'rating') {
      newFilters.rating = 0;
    }

    setFilters(newFilters);
    setActiveFilters(activeFilters.filter((f) =>
      !(f.type === filter.type && f.value === filter.value)
    ));
  };

  const renderUserResult = (item) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>{item.username}</Text>
        <Text style={styles.userFollowers}>{item.followers} followers</Text>
      </View>
      <View style={styles.resultAction}>
        {item.isFollowing ? (
          <View style={styles.followingBadge}>
            <Ionicons name="checkmark" size={16} color={COLORS.primary} />
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderChallengeResult = (item) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={[styles.challengeIcon, { backgroundColor: COLORS.primary }]}>
        <Ionicons name={item.icon} size={24} color={COLORS.white} />
      </View>
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeDescription}>{item.description}</Text>
        <View style={styles.challengeMeta}>
          <Text style={styles.challengeParticipants}>
            {item.participants} participants
          </Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  const renderPlaceResult = (item) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.placeImage} />
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <View style={styles.placeLocation}>
          <Ionicons name="location" size={14} color={COLORS.gray} />
          <Text style={styles.placeLocationText}>{item.location}</Text>
        </View>
        <View style={styles.placeMeta}>
          <View style={styles.placeRating}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={styles.placeRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.placeDistance}>{item.distance}km away</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => {
    if (item.type === 'user') {
      return renderUserResult(item);
    } else if (item.type === 'challenge') {
      return renderChallengeResult(item);
    } else if (item.type === 'place') {
      return renderPlaceResult(item);
    }
    return null;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: COLORS.easy,
      moderate: COLORS.medium,
      medium: COLORS.medium,
      hard: COLORS.hard,
      extreme: COLORS.extreme,
    };
    return colors[difficulty] || COLORS.gray;
  };

  const renderTrendingCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.trendingCard}
      onPress={() => handleSearchSelect(item.text)}
    >
      <View style={[styles.trendingIcon, { backgroundColor: COLORS.primary }]}>
        <Ionicons name={item.icon} size={24} color={COLORS.white} />
      </View>
      <Text style={styles.trendingText}>{item.text}</Text>
      <Ionicons name="trending-up" size={20} color={COLORS.success} />
    </TouchableOpacity>
  );

  const renderCategorySuggestion = (category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => {
        setSelectedCategory(category.id);
        setSearchQuery('');
      }}
    >
      <View style={[styles.categoryIcon, { backgroundColor: COLORS.primary }]}>
        <Ionicons name={category.icon} size={28} color={COLORS.white} />
      </View>
      <Text style={styles.categoryLabel}>{category.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search users, challenges, places..."
          suggestions={suggestions}
          recentSearches={recentSearches}
          onSuggestionPress={handleSearchSelect}
          onRecentSearchPress={handleSearchSelect}
          onClearRecent={handleClearRecent}
          enableVoiceSearch={true}
          onVoiceSearch={() => console.log('Voice search activated')}
          containerStyle={{ flex: 1 }}
        />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options" size={24} color={COLORS.primary} />
          {activeFilters.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={12}
              color={
                selectedCategory === category.id ? COLORS.white : COLORS.gray
              }
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Chips */}
      {activeFilters.length > 0 && (
        <FilterChips
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onAddFilter={() => setShowFilterModal(true)}
          onChipPress={() => setShowFilterModal(true)}
        />
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showResults ? (
          <View style={styles.resultsContainer}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {searchResults.length} results found
                  </Text>
                </View>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </>
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={64} color={COLORS.lightGray} />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try adjusting your search or filters
                </Text>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setActiveFilters([]);
                    setFilters({});
                  }}
                >
                  <Text style={styles.clearFiltersText}>Clear all filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Category Quick Access */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map(renderCategorySuggestion)}
              </View>
            </View>

            {/* Trending Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Searches</Text>
              <View style={styles.trendingContainer}>
                {popularSearches.map(renderTrendingCard)}
              </View>
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={handleClearRecent}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchItem}
                    onPress={() => handleSearchSelect(search)}
                  >
                    <Ionicons name="time-outline" size={20} color={COLORS.gray} />
                    <Text style={styles.searchItemText}>{search}</Text>
                    <Ionicons
                      name="arrow-up-outline"
                      size={20}
                      color={COLORS.gray}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
        resultCount={searchResults.length}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    gap: 12,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...SHADOW_SMALL,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
    flexGrow: 0, // Prevent container from expanding
    maxHeight: 60, // Force compact height
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Glassy white base
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)', // Crisp glass border
    gap: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  categoryItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 0,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  clearText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    rowGap: 15,
  },
  categoryCard: {
    width: '23%',
    aspectRatio: 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Glassy card
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)', // Glass border
    shadowColor: COLORS.gray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 10, // Smaller text
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  trendingContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    ...SHADOW_SMALL,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  trendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingText: {
    flex: 1,
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: 12,
  },
  searchItemText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  resultsContainer: {
    backgroundColor: COLORS.background, // Changed to background to show card separation
    marginTop: 8,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    // Removed border for cleaner look
  },
  resultsCount: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  userUsername: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  userFollowers: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginTop: 2,
  },
  resultAction: {
    paddingLeft: 10,
  },
  followingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  challengeDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  challengeParticipants: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  placeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  placeLocationText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  placeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  placeRatingText: {
    fontSize: SIZES.xs,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  placeDistance: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.lightGray,
    marginTop: 4,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  clearFiltersText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SearchScreen;
