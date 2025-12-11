import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Explore Together',
        description: 'Discover amazing outdoor activities and connect with fellow adventurers in Mauritius',
        icon: 'compass',
        gradient: [COLORS.primary, COLORS.primaryDark],
    },
    {
        id: '2',
        title: 'Track Live',
        description: 'Real-time GPS tracking keeps everyone safe. Monitor your group, family, and friends during activities',
        icon: 'location',
        gradient: [COLORS.success, '#059669'],
    },
    {
        id: '3',
        title: 'Move Together',
        description: 'Join clubs, create challenges, and share your journey. Transport and accommodation made easy',
        icon: 'people',
        gradient: [COLORS.secondary, '#EA580C'],
    },
];

const WelcomeScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleGetStarted();
        }
    };

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem('onboarding_completed', 'true');
            // Force app to re-check onboarding status
            // The AppNavigator will automatically show Auth screen
            if (navigation.reset) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Welcome' }],
                });
            }
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    const handleSkip = async () => {
        await handleGetStarted();
    };

    const Slide = ({ item }) => (
        <View style={styles.slide}>
            <LinearGradient
                colors={item.gradient}
                style={styles.iconContainer}
            >
                <Ionicons name={item.icon} size={80} color={COLORS.white} />
            </LinearGradient>

            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    const Paginator = () => (
        <View style={styles.paginatorContainer}>
            {slides.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [10, 30, 10],
                    extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        style={[styles.dot, { width: dotWidth, opacity }]}
                        key={i.toString()}
                    />
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Skip Button */}
            {currentIndex < slides.length - 1 && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <View style={{ flex: 3 }}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => <Slide item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomContainer}>
                <Paginator />

                <TouchableOpacity
                    style={styles.button}
                    onPress={scrollTo}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>
                            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons
                            name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
                            size={20}
                            color={COLORS.white}
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 100,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    skipText: {
        fontSize: SIZES.base,
        color: COLORS.gray,
        fontWeight: '600',
    },
    slide: {
        width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.darkGray,
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    paginatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 64,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginHorizontal: 4,
    },
    button: {
        marginHorizontal: 40,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: SIZES.lg,
        fontWeight: '700',
    },
});

export default WelcomeScreen;
