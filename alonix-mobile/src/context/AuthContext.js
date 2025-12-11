import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');

      if (authToken) {
        // Verify token by fetching current user
        try {
          await api.setToken(authToken);
          const response = await api.get(API_ENDPOINTS.AUTH.ME);
          
          if (response.success && response.user) {
            setUser(response.user);
            setIsAuthenticated(true);
          } else {
            // Invalid token, clear it
            await api.clearToken();
            await AsyncStorage.removeItem('auth_token');
          }
        } catch (error) {
          // Token invalid or expired
          console.log('Token validation failed:', error.message);
          await api.clearToken();
          await AsyncStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      }, { skipAuth: true });

      if (response.success && response.token && response.user) {
        // Save token and user
        await api.setToken(response.token);
        if (response.refreshToken) {
          await AsyncStorage.setItem('refresh_token', response.refreshToken);
        }

        // Transform user data to match frontend format
        const userData = {
          id: response.user._id || response.user.id,
          _id: response.user._id || response.user.id,
          name: response.user.name,
          email: response.user.email,
          avatar: response.user.profilePhoto,
          profilePhoto: response.user.profilePhoto,
          ...response.user
        };

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          error: response.error || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || error.data?.error || 'Login failed',
      };
    }
  };

  const register = async (name, email, password, phone = '') => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
        phone
      }, { skipAuth: true });

      if (response.success && response.token && response.user) {
        // Save token and user
        await api.setToken(response.token);
        if (response.refreshToken) {
          await AsyncStorage.setItem('refresh_token', response.refreshToken);
        }

        // Transform user data
        const userData = {
          id: response.user._id || response.user.id,
          _id: response.user._id || response.user.id,
          name: response.user.name,
          email: response.user.email,
          avatar: response.user.profilePhoto,
          profilePhoto: response.user.profilePhoto,
          ...response.user
        };

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          error: response.error || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || error.data?.error || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout API endpoint
      try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        // Continue with logout even if API call fails
        console.log('Logout API call failed, continuing with local logout');
      }

      // Clear AsyncStorage
      await api.clearToken();
      await AsyncStorage.removeItem('refresh_token');

      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email
      }, { skipAuth: true });

      return {
        success: response.success || false,
        message: response.message || 'Password reset instructions sent'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || error.data?.error || 'Failed to send reset email',
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user || !user._id) {
        throw new Error('User not found');
      }

      const response = await api.put(API_ENDPOINTS.USERS.UPDATE, profileData);

      if (response.success && response.user) {
        const updatedUser = {
          ...user,
          ...response.user,
          id: response.user._id || response.user.id,
          _id: response.user._id || response.user.id
        };

        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to update profile',
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || error.data?.error || 'Failed to update profile',
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
