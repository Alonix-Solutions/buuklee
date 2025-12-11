import React, { createContext, useState, useContext } from 'react';

const TabBarContext = createContext();

export const TabBarProvider = ({ children }) => {
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);

    const toggleTabBar = () => {
        setIsTabBarVisible(prev => !prev);
    };

    const showTabBar = () => {
        setIsTabBarVisible(true);
    };

    const hideTabBar = () => {
        setIsTabBarVisible(false);
    };

    return (
        <TabBarContext.Provider
            value={{
                isTabBarVisible,
                toggleTabBar,
                showTabBar,
                hideTabBar,
            }}
        >
            {children}
        </TabBarContext.Provider>
    );
};

export const useTabBar = () => {
    const context = useContext(TabBarContext);
    if (!context) {
        throw new Error('useTabBar must be used within TabBarProvider');
    }
    return context;
};

export default TabBarContext;
