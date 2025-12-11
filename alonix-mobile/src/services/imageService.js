import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Image Service for handling photo selection and camera capture
 * Uses expo-image-picker for cross-platform compatibility
 */

/**
 * Request camera permissions
 * @returns {Promise<boolean>} Permission granted status
 */
export const requestCameraPermission = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Request media library permissions
 * @returns {Promise<boolean>} Permission granted status
 */
export const requestMediaLibraryPermission = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Gallery Permission Required',
        'Please enable gallery access in your device settings to select photos.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

/**
 * Pick a single image from the device gallery
 * @param {Object} options - Image picker options
 * @returns {Promise<Object|null>} Selected image object or null
 */
export const pickImageFromGallery = async (options = {}) => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: options.aspect || [1, 1],
      quality: options.quality || 0.8,
      ...options,
    };

    const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }

    return null;
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    Alert.alert('Error', 'Failed to pick image from gallery');
    return null;
  }
};

/**
 * Pick multiple images from the device gallery
 * @param {Object} options - Image picker options
 * @returns {Promise<Array|null>} Array of selected images or null
 */
export const pickMultipleImages = async (options = {}) => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: options.quality || 0.8,
      ...options,
    };

    const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets;
    }

    return null;
  } catch (error) {
    console.error('Error picking multiple images:', error);
    Alert.alert('Error', 'Failed to pick images from gallery');
    return null;
  }
};

/**
 * Take a photo using the device camera
 * @param {Object} options - Camera options
 * @returns {Promise<Object|null>} Captured photo object or null
 */
export const takePhoto = async (options = {}) => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return null;

    const defaultOptions = {
      allowsEditing: true,
      aspect: options.aspect || [1, 1],
      quality: options.quality || 0.8,
      ...options,
    };

    const result = await ImagePicker.launchCameraAsync(defaultOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }

    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo');
    return null;
  }
};

/**
 * Show action sheet to select image source (camera or gallery)
 * @param {Object} options - Image picker options
 * @returns {Promise<Object|null>} Selected/captured image or null
 */
export const selectImageSource = (options = {}) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const photo = await takePhoto(options);
            resolve(photo);
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const photo = await pickImageFromGallery(options);
            resolve(photo);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Pick profile photo (square aspect ratio)
 * @returns {Promise<Object|null>} Selected profile photo or null
 */
export const pickProfilePhoto = async () => {
  return await selectImageSource({
    aspect: [1, 1],
    quality: 0.8,
  });
};

/**
 * Pick cover photo (wide aspect ratio)
 * @returns {Promise<Object|null>} Selected cover photo or null
 */
export const pickCoverPhoto = async () => {
  return await selectImageSource({
    aspect: [16, 9],
    quality: 0.9,
  });
};

/**
 * Pick review photos (allows multiple selection)
 * @param {number} maxPhotos - Maximum number of photos to select
 * @returns {Promise<Array|null>} Array of selected photos or null
 */
export const pickReviewPhotos = async (maxPhotos = 5) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Add Photos',
      `Select up to ${maxPhotos} photos for your review`,
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const photo = await takePhoto({ quality: 0.8 });
            resolve(photo ? [photo] : null);
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const photos = await pickMultipleImages({ quality: 0.8 });
            if (photos && photos.length > maxPhotos) {
              Alert.alert('Too Many Photos', `Please select up to ${maxPhotos} photos only`);
              resolve(null);
            } else {
              resolve(photos);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Get image dimensions
 * @param {string} uri - Image URI
 * @returns {Promise<Object>} Image dimensions {width, height}
 */
export const getImageDimensions = (uri) => {
  return new Promise((resolve, reject) => {
    const Image = require('react-native').Image;
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};

/**
 * Format image size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatImageSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default {
  requestCameraPermission,
  requestMediaLibraryPermission,
  pickImageFromGallery,
  pickMultipleImages,
  takePhoto,
  selectImageSource,
  pickProfilePhoto,
  pickCoverPhoto,
  pickReviewPhotos,
  getImageDimensions,
  formatImageSize,
};
