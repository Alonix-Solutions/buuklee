import React from 'react';
import { View, StyleSheet } from 'react-native';
import TabBarToggle from '../components/TabBarToggle';
import { useTabBar } from '../context/TabBarContext';

/**
 * Wrapper component that adds tab bar toggle button to screens
 * Use this to wrap screens that should have the toggle button
 */
const withTabBarToggle = (WrappedComponent) => {
    return (props) => {
        const { isTabBarVisible, toggleTabBar } = useTabBar();

        return (
            <View style={styles.container}>
                <WrappedComponent {...props} />
                <TabBarToggle
                    isVisible={isTabBarVisible}
                    onToggle={toggleTabBar}
                />
            </View>
        );
    };
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default withTabBarToggle;
