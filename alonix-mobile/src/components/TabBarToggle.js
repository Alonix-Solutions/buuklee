import React, { useState } from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    Animated,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

/**
 * Floating Tab Bar Toggle Button
 * Swipe-like button to show/hide the navigation bar
 */
const TabBarToggle = ({ onToggle, isVisible = true }) => {
    const [animation] = useState(new Animated.Value(1));

    const handlePress = () => {
        // Pulse animation
        Animated.sequence([
            Animated.timing(animation, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(animation, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        onToggle();
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: animation }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.button}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={isVisible ? 'chevron-down' : 'chevron-up'}
                        size={12}
                        color={COLORS.primary}
                    />
                </View>
                <View style={styles.indicator}>
                    <View style={[styles.dot, !isVisible && styles.dotHidden]} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 85, // Above the tab bar
        right: 20, // Right corner
        zIndex: 1000,
    },
    button: {
        width: 28, // Even smaller
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Almost transparent
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass border
    },
    iconContainer: {
        position: 'absolute',
    },
    indicator: {
        position: 'absolute',
        top: -1,
        right: -1,
        width: 6, // Tiny indicator
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    dot: {
        width: 3, // Tiny dot
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.success,
    },
    dotHidden: {
        backgroundColor: COLORS.error,
    },
});

export default TabBarToggle;
