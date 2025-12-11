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
import { SHADOW_LARGE } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';
import { pickProfilePhoto, pickCoverPhoto } from '../services/imageService';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('Running enthusiast | Weekend warrior | Island explorer');
  const [location, setLocation] = useState('Port Louis, Mauritius');
  const [phone, setPhone] = useState('+230 5XXX XXXX');
  const [email, setEmail] = useState(user?.email || '');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');

  // Photo state
  const [profilePhoto, setProfilePhoto] = useState(
    user?.avatar || 'https://i.pravatar.cc/150?img=5'
  );
  const [coverPhoto, setCoverPhoto] = useState(
    'https://picsum.photos/seed/cover1/800/300'
  );

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        location: location.trim(),
        phone: phone.trim(),
        website: website.trim(),
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        twitter: twitter.trim(),
        avatar: profilePhoto,
        coverPhoto: coverPhoto,
      };

      const result = await updateProfile(profileData);

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeProfilePhoto = async () => {
    setIsUploading(true);
    const photo = await pickProfilePhoto();
    setIsUploading(false);

    if (photo) {
      setProfilePhoto(photo.uri);
    }
  };

  const handleChangeCoverPhoto = async () => {
    setIsUploading(true);
    const photo = await pickCoverPhoto();
    setIsUploading(false);

    if (photo) {
      setCoverPhoto(photo.uri);
    }
  };

  const FormInput = ({ label, value, onChangeText, placeholder, multiline, keyboardType, maxLength }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.lightGray}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );

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
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleUpdateProfile}
          style={styles.headerButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={[styles.headerButtonText, styles.saveButton]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Photo */}
        <TouchableOpacity
          style={styles.coverPhotoContainer}
          onPress={handleChangeCoverPhoto}
          activeOpacity={0.8}
        >
          <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
          <View style={styles.coverPhotoOverlay}>
            <View style={styles.changeCoverButton}>
              <Ionicons name="camera" size={24} color={COLORS.white} />
              <Text style={styles.changeCoverText}>Change Cover</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Profile Photo */}
        <View style={styles.profilePhotoSection}>
          <TouchableOpacity
            onPress={handleChangeProfilePhoto}
            activeOpacity={0.8}
          >
            <View style={styles.profilePhotoContainer}>
              <Image
                source={{ uri: profilePhoto }}
                style={styles.profilePhoto}
              />
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color={COLORS.white} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <FormInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              maxLength={50}
            />

            <FormInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              maxLength={150}
            />

            <FormInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
              maxLength={50}
            />
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <FormInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
            />

            <FormInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+230 5XXX XXXX"
              keyboardType="phone-pad"
            />
          </View>

          {/* Social Media Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Media</Text>

            <FormInput
              label="Website"
              value={website}
              onChangeText={setWebsite}
              placeholder="https://yourwebsite.com"
              keyboardType="url"
            />

            <View style={styles.socialInputContainer}>
              <View style={styles.socialIconContainer}>
                <Ionicons name="logo-instagram" size={20} color="#E4405F" />
              </View>
              <TextInput
                style={styles.socialInput}
                value={instagram}
                onChangeText={setInstagram}
                placeholder="Instagram username"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>

            <View style={styles.socialInputContainer}>
              <View style={styles.socialIconContainer}>
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              </View>
              <TextInput
                style={styles.socialInput}
                value={facebook}
                onChangeText={setFacebook}
                placeholder="Facebook username"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>

            <View style={styles.socialInputContainer}>
              <View style={styles.socialIconContainer}>
                <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
              </View>
              <TextInput
                style={styles.socialInput}
                value={twitter}
                onChangeText={setTwitter}
                placeholder="Twitter username"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
            <Text style={styles.privacyText}>
              Your contact information will only be visible to your connections
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Uploading Overlay */}
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.uploadingText}>Processing image...</Text>
          </View>
        </View>
      )}
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
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerButtonText: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '500',
  },
  saveButton: {
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  coverPhotoContainer: {
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeCoverButton: {
    alignItems: 'center',
  },
  changeCoverText: {
    color: COLORS.white,
    fontSize: SIZES.base,
    fontWeight: '600',
    marginTop: 8,
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 16,
  },
  profilePhotoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  formContainer: {
    paddingHorizontal: SIZES.padding,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    textAlign: 'right',
    marginTop: 4,
  },
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  socialIconContainer: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  socialInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
  },
  privacyNote: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.info,
    marginLeft: 8,
    lineHeight: 20,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOW_LARGE,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
