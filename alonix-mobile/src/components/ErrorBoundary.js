import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🔴 ERROR BOUNDARY CAUGHT:', {
            error: error.toString(),
            componentStack: errorInfo.componentStack,
            errorInfo: errorInfo
        });
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.error}>{this.state.error && this.state.error.toString()}</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding,
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: SIZES.xl,
        fontWeight: '700',
        color: COLORS.error,
        marginBottom: 16,
    },
    error: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: SIZES.base,
        fontWeight: '600',
    },
});

export default ErrorBoundary;
