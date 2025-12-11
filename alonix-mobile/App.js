import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { MessagesProvider } from './src/context/MessagesContext';
import { BookingProvider } from './src/context/BookingContext';
import { SocialProvider } from './src/context/SocialContext';
import { TabBarProvider } from './src/context/TabBarContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <MessagesProvider>
          <BookingProvider>
            <SocialProvider>
              <TabBarProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </TabBarProvider>
            </SocialProvider>
          </BookingProvider>
        </MessagesProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
