// Shadow helper functions
// Use these instead of spread operators in StyleSheet.create()

export const getShadow = (size = 'medium') => {
    const shadows = {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
        },
    };

    return shadows[size] || shadows.medium;
};

// Export individual shadows
export const SHADOW_SMALL = getShadow('small');
export const SHADOW_MEDIUM = getShadow('medium');
export const SHADOW_LARGE = getShadow('large');
