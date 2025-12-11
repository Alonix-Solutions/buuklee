import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM } from '../utils/shadows';

const SearchBar = ({
  value = '',
  onChangeText,
  onFocus,
  onBlur,
  onSubmit,
  placeholder = 'Search...',
  showSuggestions = false,
  suggestions = [],
  recentSearches = [],
  onSuggestionPress,
  onRecentSearchPress,
  onClearRecent,
  autoFocus = false,
  enableVoiceSearch = false,
  onVoiceSearch,
  containerStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  // Animation values
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate expand/collapse
    Animated.spring(expandAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();

    // Animate border color
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    // Show dropdown when focused and has content
    const shouldShow = isFocused && (value.length > 0 || recentSearches.length > 0);
    setShowDropdown(shouldShow);

    // Animate dropdown
    Animated.spring(dropdownAnim, {
      toValue: shouldShow ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [isFocused, value, recentSearches]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();
  };

  const handleBlur = () => {
    // Delay blur to allow dropdown item press
    setTimeout(() => {
      setIsFocused(false);
      onBlur && onBlur();
    }, 200);
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  const handleSuggestionPress = (suggestion) => {
    onSuggestionPress && onSuggestionPress(suggestion);
    Keyboard.dismiss();
  };

  const handleRecentPress = (search) => {
    onRecentSearchPress && onRecentSearchPress(search);
    Keyboard.dismiss();
  };

  const handleVoicePress = () => {
    onVoiceSearch && onVoiceSearch();
  };

  // Animated styles
  const containerScale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const dropdownOpacity = dropdownAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 5);

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            transform: [{ scale: containerScale }],
            borderColor: borderColor,
          },
        ]}
      >
        <TouchableOpacity onPress={() => inputRef.current?.focus()} activeOpacity={1}>
          <Ionicons name="search" size={20} color={isFocused ? COLORS.primary : COLORS.gray} />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmit}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {value.length > 0 && (
          <Animated.View
            style={{
              transform: [{ scale: expandAnim }],
            }}
          >
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {enableVoiceSearch && value.length === 0 && (
          <TouchableOpacity onPress={handleVoicePress} style={styles.voiceButton}>
            <Ionicons name="mic" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Dropdown with suggestions and recent searches */}
      {showDropdown && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              maxHeight: dropdownHeight,
              opacity: dropdownOpacity,
            },
          ]}
        >
          <ScrollView
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search Suggestions */}
            {value.length > 0 && filteredSuggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suggestions</Text>
                {filteredSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={`suggestion-${index}`}
                    style={styles.dropdownItem}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Ionicons name="search-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.dropdownItemText}>
                      <Text style={styles.highlightedText}>
                        {suggestion.substring(0, value.length)}
                      </Text>
                      {suggestion.substring(value.length)}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.lightGray} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Searches */}
            {value.length === 0 && recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={onClearRecent}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <TouchableOpacity
                    key={`recent-${index}`}
                    style={styles.dropdownItem}
                    onPress={() => handleRecentPress(search)}
                  >
                    <Ionicons name="time-outline" size={18} color={COLORS.gray} />
                    <Text style={styles.dropdownItemText}>{search}</Text>
                    <TouchableOpacity onPress={() => handleRecentPress(search)}>
                      <Ionicons name="arrow-up-outline" size={16} color={COLORS.gray} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No suggestions state */}
            {value.length > 0 && filteredSuggestions.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={32} color={COLORS.lightGray} />
                <Text style={styles.noResultsText}>No suggestions found</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 10,
    ...SHADOW_SMALL,
  },
  input: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  voiceButton: {
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    overflow: 'hidden',
    ...SHADOW_MEDIUM,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  section: {
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  clearAllText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
  },
  highlightedText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginTop: 8,
  },
});

export default SearchBar;
