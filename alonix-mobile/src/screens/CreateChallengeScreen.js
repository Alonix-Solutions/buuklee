import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL, SHADOW_MEDIUM } from '../utils/shadows';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import MapPointPicker from '../components/MapPointPicker';

const CreateChallengeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showMeetingPointPicker, setShowMeetingPointPicker] = useState(false);
  const [showStartPointPicker, setShowStartPointPicker] = useState(false);
  const [showFinishPointPicker, setShowFinishPointPicker] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'running',
    difficulty: 'medium',
    distance: '',
    duration: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    entryFee: '',
    prizes: '',
    rules: '',
    address: '',
    meetingPoint: null,
    startPoint: null,
    finishPoint: null,
    sameAsStartFinish: true,
    offerTransport: false,
    transportSeats: '',
    transportPrice: '',
  });

  const challengeTypes = [
    { id: 'running', label: 'Running', icon: 'footsteps-outline' },
    { id: 'cycling', label: 'Cycling', icon: 'bicycle-outline' },
    { id: 'swimming', label: 'Swimming', icon: 'water-outline' },
    { id: 'hiking', label: 'Hiking', icon: 'trail-sign-outline' },
    { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
    { id: 'mixed', label: 'Mixed', icon: 'fitness-outline' },
  ];

  const difficultyLevels = [
    { id: 'easy', label: 'Easy', color: COLORS.success },
    { id: 'medium', label: 'Medium', color: COLORS.warning },
    { id: 'hard', label: 'Hard', color: COLORS.error },
  ];

  const formatDateValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (field, event, selectedDate) => {
    if (event.type === 'dismissed') {
      if (field === 'startDate') setShowStartPicker(false);
      if (field === 'endDate') setShowEndPicker(false);
      return;
    }

    if (selectedDate) {
      const formatted = formatDateValue(selectedDate);
      setFormData((prev) => ({
        ...prev,
        [field]: formatted,
      }));
    }

    if (field === 'startDate') setShowStartPicker(false);
    if (field === 'endDate') setShowEndPicker(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a challenge title');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!formData.distance.trim() && !formData.duration.trim()) {
      Alert.alert('Error', 'Please enter either distance or duration goal');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter a meeting point address');
      return;
    }

    if (!user || !(user._id || user.id)) {
      Alert.alert('Login Required', 'Please log in before creating a challenge.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        activityType: formData.type,
        type: 'challenge',
        difficulty: formData.difficulty,
        distance: formData.distance ? Number(formData.distance) : undefined,
        duration: formData.duration ? Number(formData.duration) : undefined,
        // Backend expects 'date' field (often same as startDate)
        date: formData.startDate || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        maxParticipants: formData.maxParticipants
          ? Number(formData.maxParticipants)
          : undefined,
        entryFee: formData.entryFee ? Number(formData.entryFee) : 0,
        prizes: formData.prizes || undefined,
        rules: formData.rules || undefined,
        meetingPoint: formData.meetingPoint ? {
          address: formData.meetingPoint.address,
          coordinates: [formData.meetingPoint.longitude, formData.meetingPoint.latitude],
        } : undefined,
        startPoint: formData.startPoint ? {
          address: formData.startPoint.address,
          coordinates: [formData.startPoint.longitude, formData.startPoint.latitude],
        } : undefined,
        finishPoint: formData.finishPoint ? {
          address: formData.finishPoint.address,
          coordinates: [formData.finishPoint.longitude, formData.finishPoint.latitude],
        } : undefined,
        transport: formData.offerTransport ? {
          organizerOffers: {
            available: true,
            totalSeats: Number(formData.transportSeats) || 0,
            bookedSeats: 0,
            pricePerSeat: Number(formData.transportPrice) || 0,
            pickupPoint: formData.meetingPoint ? {
              coordinates: [formData.meetingPoint.longitude, formData.meetingPoint.latitude],
              address: formData.meetingPoint.address
            } : undefined
          }
        } : undefined,
      };

      const created = await activityService.createActivity(payload);

      if (!created) {
        Alert.alert('Error', 'Failed to create challenge. Please try again.');
        return;
      }

      Alert.alert('Success', 'Challenge created successfully!', [
        {
          text: 'View challenge',
          onPress: () =>
            navigation.replace('ActivityDetail', {
              challengeId: created._id || created.id,
              activity: created,
            }),
        },
      ]);
    } catch (error) {
      console.error('Create challenge error:', error);
      console.log('Create challenge error status:', error.status);
      console.log('Create challenge error data:', error.data);
      Alert.alert(
        'Error',
        error.message || 'Something went wrong while creating the challenge.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const TypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Challenge Type *</Text>
      <View style={styles.typeGrid}>
        {challengeTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              formData.type === type.id && styles.typeCardSelected,
            ]}
            onPress={() => setFormData({ ...formData, type: type.id })}
            activeOpacity={0.7}
          >
            <Ionicons
              name={type.icon}
              size={28}
              color={formData.type === type.id ? COLORS.white : COLORS.primary}
            />
            <Text
              style={[
                styles.typeLabel,
                formData.type === type.id && styles.typeLabelSelected,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const DifficultySelector = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Difficulty Level *</Text>
      <View style={styles.difficultyRow}>
        {difficultyLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.difficultyCard,
              formData.difficulty === level.id && {
                backgroundColor: level.color,
                borderColor: level.color,
              },
            ]}
            onPress={() => setFormData({ ...formData, difficulty: level.id })}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.difficultyLabel,
                formData.difficulty === level.id && styles.difficultyLabelSelected,
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Create Challenge</Text>
            <Text style={styles.headerSubtitle}>
              Design your fitness challenge
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Challenge Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 5K Morning Run Challenge"
            placeholderTextColor={COLORS.gray}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your challenge, rules, and what participants can expect..."
            placeholderTextColor={COLORS.gray}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TypeSelector />

        <DifficultySelector />

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Challenge Goals</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Distance (km)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                placeholderTextColor={COLORS.gray}
                value={formData.distance}
                onChangeText={(text) => setFormData({ ...formData, distance: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Duration (mins)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30"
                placeholderTextColor={COLORS.gray}
                value={formData.duration}
                onChangeText={(text) => setFormData({ ...formData, duration: text })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Meeting Point */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>📍 Location Points</Text>

          {/* Meeting Point */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Meeting Point *</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setShowMeetingPointPicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <View style={styles.mapButtonContent}>
                <Text style={styles.mapButtonText}>
                  {formData.meetingPoint?.address || 'Tap to select meeting point on map'}
                </Text>
                {formData.meetingPoint && (
                  <Text style={styles.mapButtonCoords}>
                    {formData.meetingPoint.latitude.toFixed(4)}, {formData.meetingPoint.longitude.toFixed(4)}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {/* Start Point */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Start Point</Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormData({
                  ...formData,
                  sameAsStartFinish: !formData.sameAsStartFinish,
                  startPoint: formData.sameAsStartFinish ? formData.meetingPoint : null
                })}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, formData.sameAsStartFinish && styles.checkboxChecked]}>
                  {formData.sameAsStartFinish && (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Same as meeting point</Text>
              </TouchableOpacity>
            </View>

            {!formData.sameAsStartFinish && (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setShowStartPointPicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="play-circle" size={20} color={COLORS.success} />
                <View style={styles.mapButtonContent}>
                  <Text style={styles.mapButtonText}>
                    {formData.startPoint?.address || 'Tap to select start point'}
                  </Text>
                  {formData.startPoint && (
                    <Text style={styles.mapButtonCoords}>
                      {formData.startPoint.latitude.toFixed(4)}, {formData.startPoint.longitude.toFixed(4)}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>

          {/* Finish Point */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Finish Point *</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setShowFinishPointPicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="flag" size={20} color={COLORS.error} />
              <View style={styles.mapButtonContent}>
                <Text style={styles.mapButtonText}>
                  {formData.finishPoint?.address || 'Tap to select finish point'}
                </Text>
                {formData.finishPoint && (
                  <Text style={styles.mapButtonCoords}>
                    {formData.finishPoint.latitude.toFixed(4)}, {formData.finishPoint.longitude.toFixed(4)}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Transport Offering */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>🚗 Offer Transport</Text>
          <Text style={styles.sectionDescription}>
            Do you have available car seats for participants?
          </Text>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setFormData({ ...formData, offerTransport: !formData.offerTransport })}
            activeOpacity={0.7}
          >
            <View style={styles.toggleInfo}>
              <Ionicons
                name="car-sport"
                size={24}
                color={formData.offerTransport ? COLORS.primary : COLORS.gray}
              />
              <Text style={styles.toggleLabel}>I can offer rides</Text>
            </View>
            <View style={[
              styles.toggle,
              formData.offerTransport && styles.toggleActive
            ]}>
              <View style={[
                styles.toggleThumb,
                formData.offerTransport && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>

          {formData.offerTransport && (
            <View style={styles.transportDetails}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Available Seats</Text>
                <TextInput
                  style={styles.input}
                  value={formData.transportSeats}
                  onChangeText={(text) => setFormData({ ...formData, transportSeats: text })}
                  placeholder="e.g., 3"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
                <Text style={styles.helper}>Number of seats you can offer</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price Per Seat (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.transportPrice}
                  onChangeText={(text) => setFormData({ ...formData, transportPrice: text })}
                  placeholder="e.g., 200 (leave empty for free)"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
                <Text style={styles.helper}>Cost per seat in MUR (0 = free ride)</Text>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  Your pickup point will be the meeting point by default. Participants can request to join your ride.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Challenge Period</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowStartPicker(true)}
              >
                <View style={[styles.input, styles.dateInput]}>
                  <Text
                    style={
                      formData.startDate
                        ? styles.dateText
                        : styles.datePlaceholder
                    }
                  >
                    {formData.startDate || 'Select date'}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={COLORS.gray}
                  />
                </View>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={formData.startDate ? new Date(formData.startDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => handleDateChange('startDate', event, date)}
                />
              )}
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowEndPicker(true)}
              >
                <View style={[styles.input, styles.dateInput]}>
                  <Text
                    style={
                      formData.endDate
                        ? styles.dateText
                        : styles.datePlaceholder
                    }
                  >
                    {formData.endDate || 'Select date'}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={COLORS.gray}
                  />
                </View>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={formData.endDate ? new Date(formData.endDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => handleDateChange('endDate', event, date)}
                />
              )}
            </View>
          </View>
        </View>

        {/* Participants & Fees */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Participation Details</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Max Participants</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50"
                placeholderTextColor={COLORS.gray}
                value={formData.maxParticipants}
                onChangeText={(text) =>
                  setFormData({ ...formData, maxParticipants: text })
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Entry Fee (Rs)</Text>
              <TextInput
                style={styles.input}
                placeholder="0 for free"
                placeholderTextColor={COLORS.gray}
                value={formData.entryFee}
                onChangeText={(text) => setFormData({ ...formData, entryFee: text })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Optional Fields */}
        <View style={styles.section}>
          <Text style={styles.label}>Prizes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe prizes for winners..."
            placeholderTextColor={COLORS.gray}
            value={formData.prizes}
            onChangeText={(text) => setFormData({ ...formData, prizes: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Additional Rules (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any specific rules or requirements..."
            placeholderTextColor={COLORS.gray}
            value={formData.rules}
            onChangeText={(text) => setFormData({ ...formData, rules: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={submitting}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                <Text style={styles.submitButtonText}>Create Challenge</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Map Picker Modals */}
      <Modal visible={showMeetingPointPicker} animationType="slide" presentationStyle="fullScreen">
        <MapPointPicker
          title="Select Meeting Point"
          initialLocation={formData.meetingPoint}
          onLocationSelect={(location) => {
            setFormData({
              ...formData,
              meetingPoint: location,
              address: location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`, // CRITICAL FIX: Update address field
              startPoint: formData.sameAsStartFinish ? location : formData.startPoint
            });
          }}
          onClose={() => setShowMeetingPointPicker(false)}
        />
      </Modal>

      <Modal visible={showStartPointPicker} animationType="slide" presentationStyle="fullScreen">
        <MapPointPicker
          title="Select Start Point"
          initialLocation={formData.startPoint || formData.meetingPoint}
          onLocationSelect={(location) => setFormData({ ...formData, startPoint: location })}
          onClose={() => setShowStartPointPicker(false)}
        />
      </Modal>

      <Modal visible={showFinishPointPicker} animationType="slide" presentationStyle="fullScreen">
        <MapPointPicker
          title="Select Finish Point"
          initialLocation={formData.finishPoint}
          onLocationSelect={(location) => setFormData({ ...formData, finishPoint: location })}
          onClose={() => setShowFinishPointPicker(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerTextContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: SIZES.md,
    color: COLORS.darkGray,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: SIZES.md,
    color: COLORS.darkGray,
  },
  datePlaceholder: {
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    ...SHADOW_SMALL,
  },
  typeCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginTop: 8,
  },
  typeLabelSelected: {
    color: COLORS.white,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  difficultyLabelSelected: {
    color: COLORS.white,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOW_MEDIUM,
    elevation: 4,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  submitButtonText: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOW_SMALL,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleThumbActive: {
    marginLeft: 'auto',
  },
  transportDetails: {
    marginTop: 16,
  },
  helper: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightestGray,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  mapButtonContent: {
    flex: 1,
  },
  mapButtonText: {
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  mapButtonCoords: {
    fontSize: SIZES.xs,
    color: COLORS.gray,
    marginTop: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
  },
  formGroup: {
    marginBottom: 20,
  },
});

export default CreateChallengeScreen;
