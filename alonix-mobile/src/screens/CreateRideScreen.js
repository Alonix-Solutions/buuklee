import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import rideService from '../services/rideService';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateRideScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [seats, setSeats] = useState('3');
    const [price, setPrice] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [description, setDescription] = useState('');

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    const handleCreateRide = async () => {
        if (!origin || !destination || !price) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            const rideData = {
                origin: { address: origin },
                destination: { address: destination },
                date: date.toISOString(),
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                seats: parseInt(seats),
                price: parseFloat(price),
                description,
            };

            await rideService.createRide(rideData);

            Alert.alert('Success', 'Ride offer created successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Home', { screen: 'RideSharing' }) }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to create ride offer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.darkGray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Offer a Ride</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.label}>Origin</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Where are you starting from?"
                        value={origin}
                        onChangeText={setOrigin}
                    />

                    <Text style={styles.label}>Destination</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Where are you going?"
                        value={destination}
                        onChangeText={setDestination}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text>{date.toLocaleDateString()}</Text>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    <Text style={styles.label}>Time</Text>
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker
                            value={time}
                            mode="time"
                            display="default"
                            onChange={handleTimeChange}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Available Seats</Text>
                    <TextInput
                        style={styles.input}
                        value={seats}
                        onChangeText={setSeats}
                        keyboardType="numeric"
                        placeholder="3"
                    />

                    <Text style={styles.label}>Price per seat (Rs)</Text>
                    <TextInput
                        style={styles.input}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        placeholder="e.g. 200"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.input, { height: 80 }]}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        placeholder="Any details about the ride..."
                    />
                </View>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateRide}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.createButtonText}>Create Offer</Text>
                    )}
                </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding,
        paddingTop: 50,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.darkGray,
    },
    content: {
        padding: SIZES.padding,
    },
    section: {
        marginBottom: 20,
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: COLORS.darkGray,
        marginTop: 10,
    },
    input: {
        backgroundColor: COLORS.lightestGray,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    datePickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.lightestGray,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    createButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
});

export default CreateRideScreen;
