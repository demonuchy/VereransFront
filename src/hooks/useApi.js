// hooks/useApi.js
import { useCallback, useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const API_BASE_URL = 'http://localhost:8080/api/v1';
const DEVICE_ID_STORAGE_KEY = 'app_device_id';

const useApi = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [isDeviceIdLoading, setIsDeviceIdLoading] = useState(true);

  // Инициализация FingerprintJS и получение device_id с сохранением в localStorage
  useEffect(() => {
    const loadDeviceId = async () => {
      try {
        // 1. Сначала проверяем localStorage
        const savedDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        
        if (savedDeviceId) {
          console.log('📱 Device ID loaded from storage:', savedDeviceId);
          setDeviceId(savedDeviceId);
          setIsDeviceIdLoading(false);
          return;
        }

        // 2. Если нет в storage, генерируем новый через FingerprintJS
        console.log('🆕 Generating new Device ID with FingerprintJS...');
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const newDeviceId = result.visitorId;
        
        // 3. Сохраняем в localStorage
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, newDeviceId);
        console.log('✅ New Device ID generated and saved:', newDeviceId);
        
        setDeviceId(newDeviceId);
      } catch (error) {
        console.error('❌ Error getting device fingerprint:', error);
        
        // 4. Fallback на случай ошибки
        const fallbackId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substring(7);
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, fallbackId);
        console.log('⚠️ Using fallback Device ID:', fallbackId);
        
        setDeviceId(fallbackId);
      } finally {
        setIsDeviceIdLoading(false);
      }
    };

    loadDeviceId();
  }, []);

  // Вспомогательная функция для получения заголовков с device_id
  const getHeaders = useCallback((accessToken, additionalHeaders = {}) => {
    // Если deviceId еще не загружен, используем заглушку (но этого не должно происходить из-за ожидания в AuthProvider)
    const effectiveDeviceId = deviceId || 'loading-device-id';
    
    const headers = {
      'X-Device-Id': effectiveDeviceId,
      ...additionalHeaders,
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  }, [deviceId]);

  const createNews = useCallback(async (title, body, images = [], accessToken) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await fetch(`${API_BASE_URL}/news/`, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create news');
    }

    return await response.json();
  }, [getHeaders]);

  const getAllNews = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/news/`, {
      method: 'GET',
      headers: getHeaders(null, {
        'Content-Type': 'application/json',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch news');
    }

    return await response.json();
  }, [getHeaders]);

  const getNewsById = useCallback(async (newsId) => {
    const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
      method: 'GET',
      headers: getHeaders(null, {
        'Content-Type': 'application/json',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch news');
    }

    return await response.json();
  }, [getHeaders]);

  const deleteNewsById = useCallback(async (newsId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
      method: 'DELETE',
      headers: getHeaders(accessToken, {
        'Content-Type': 'application/json',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch news');
    }

    return await response.json();
  }, [getHeaders]);

  const register = useCallback(async (username, password) => {
    try {
      console.log('Registering user with username:', username);
      
      if (isDeviceIdLoading) {
        throw new Error('Device ID is still loading. Please try again.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(null, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Register response:', { status: response.status, data });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Пользователь с таким username уже существует');
        } else if (response.status === 400) {
          throw new Error(data.message || 'Неверные данные регистрации');
        } else {
          throw new Error(data.message || 'Failed to register');
        }
      }

      return data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  }, [getHeaders, isDeviceIdLoading]);

  const login = useCallback(async (username, password) => {
    try {
      console.log('Logging in user with username:', username);
      
      if (isDeviceIdLoading) {
        throw new Error('Device ID is still loading. Please try again.');
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(null, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Неверный username или пароль');
        } else {
          throw new Error(data.message || 'Failed to login');
        }
      }

      return data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }, [getHeaders, isDeviceIdLoading]);

  const getMe = useCallback(async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: getHeaders(accessToken, {
          'Content-Type': 'application/json',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token verification failed');
      }

      return data;
    } catch (error) {
      console.error('Verify token error:', error);
      throw error;
    }
  }, [getHeaders]);

  const refreshToken = useCallback(async (refreshToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: getHeaders(refreshToken, {
          'Content-Type': 'application/json',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }, [getHeaders]);

  const logout = useCallback(async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(accessToken, {
          'Content-Type': 'application/json',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to logout');
      }

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [getHeaders]);

  return {
    isDeviceIdLoading,
    deviceId,
    createNews,
    getAllNews,
    getNewsById,
    deleteNewsById,
    register,
    login,
    getMe,
    refreshToken,
    logout,
  };
};

export default useApi;