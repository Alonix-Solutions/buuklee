import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  async getToken() {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('auth_token');
    }
    return this.token;
  }

  async setToken(token) {
    this.token = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !options.skipAuth) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      // Add timeout to prevent hanging requests
      const timeout = options.timeout || 30000; // 30 second default
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fullUrl = `${this.baseURL}${endpoint}`;
      console.log(`📡 API Request: ${config.method || 'GET'} ${fullUrl}`);

      const response = await fetch(fullUrl, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      // Handle our backend response format {success, error, ...}
      if (!response.ok) {
        // Try to extract a meaningful message from common patterns
        let errorMessage = data.error || data.message || data.detail;

        if (!errorMessage && Array.isArray(data.errors)) {
          // e.g. [{ msg: 'title is required', ... }]
          errorMessage = data.errors
            .map((e) => e.msg || e.message || JSON.stringify(e))
            .join('\n');
        }

        if (!errorMessage && typeof data === 'string') {
          errorMessage = data;
        }

        if (!errorMessage) {
          errorMessage = 'Request failed';
        }

        console.log('🔴 Backend error response:', {
          url: fullUrl,
          status: response.status,
          data,
        });

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      // Return data directly (backend wraps in {success: true, ...})
      return data;
    } catch (error) {
      console.error('API Error:', error);

      // Handle timeout/abort errors
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout - backend not responding');
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      // If it's already our error, rethrow
      if (error.status) {
        throw error;
      }
      // Otherwise wrap it
      const wrappedError = new Error(error.message || 'Network error');
      wrappedError.originalError = error;
      throw wrappedError;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Form data request (for login)
  async postForm(endpoint, data) {
    const token = await this.getToken();

    const formData = new URLSearchParams();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return await response.json();
  }
}

export default new ApiService();
