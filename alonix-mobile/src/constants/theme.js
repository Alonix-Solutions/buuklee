// Theme constants inspired by Booking.com, Strava, and Uber

export const COLORS = {
  // Primary brand colors
  primary: '#4F46E5', // Indigo
  primaryDark: '#4338CA',
  primaryLight: '#818CF8',

  // Secondary colors
  secondary: '#FC5200', // Strava orange
  secondaryLight: '#FF6B35',

  // Accent colors
  accent: '#10B981', // Success green
  accentDark: '#059669',

  // Activity type colors
  running: '#FF6B6B',
  cycling: '#4ECDC4',
  hiking: '#95E1D3',
  swimming: '#38B2AC',

  // Difficulty colors
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
  extreme: '#7C2D12',

  // Neutral colors
  black: '#000000',
  darkGray: '#1F2937',
  gray: '#6B7280',
  lightGray: '#D1D5DB',
  lightestGray: '#F3F4F6',
  white: '#FFFFFF',

  // UI colors
  background: '#FFFFFF',
  backgroundGray: '#F9FAFB',
  border: '#E5E7EB',

  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Map colors
  userLocation: '#4F46E5',
  routePath: '#FC5200',
  waypoint: '#F59E0B',
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Spacing
  padding: 16,
  margin: 16,
  borderRadius: 12,

  // Component sizes
  icon: 24,
  iconSmall: 16,
  iconLarge: 32,
  avatar: 40,
  avatarLarge: 60,

  // Button
  buttonHeight: 48,
  buttonRadius: 24,

  // Tab bar
  tabBarHeight: 60,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semiBold: 'System',
};

// SHADOWS moved to utils/shadows.js to prevent circular dependencies
// Import { SHADOW_SMALL, SHADOW_MEDIUM, SHADOW_LARGE } from '../utils/shadows' instead


export const ACTIVITY_ICONS = {
  running: '🏃',
  cycling: '🚴',
  hiking: '🥾',
  swimming: '🏊',
};

export const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  extreme: 'Extreme',
};
