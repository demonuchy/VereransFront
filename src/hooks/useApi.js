// hooks/useApi.js
import { useCallback, useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import apiClient from '../api/client';

const DEVICE_ID_STORAGE_KEY = 'app_device_id';

const useApi = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [isDeviceIdLoading, setIsDeviceIdLoading] = useState(true);

  // Загружаем или создаем deviceId
  useEffect(() => {
    const loadDeviceId = async () => {
      const saved = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
      if (saved) {
        setDeviceId(saved);
        setIsDeviceIdLoading(false);
        return;
      }

      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, result.visitorId);
        setDeviceId(result.visitorId);
      } catch (error) {
        const fallback = 'fallback-' + Date.now();
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, fallback);
        setDeviceId(fallback);
      } finally {
        setIsDeviceIdLoading(false);
      }
    };

    loadDeviceId();
  }, []);

  // Методы API
  const createNews = useCallback(async (title, body, images = []) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    images.forEach(img => formData.append('images', img));
    
    return apiClient('/news/', { 
      method: 'POST', 
      body: formData 
    });
  }, []);

  const getAllNews = useCallback(async () => {
    return apiClient('/news/');
  }, []);

  const getNewsById = useCallback(async (newsId) => {
    return apiClient(`/news/${newsId}`);
  }, []);

  const deleteNewsById = useCallback(async (newsId) => {
    return apiClient(`/news/${newsId}`, { method: 'DELETE' });
  }, []);

  const updateNewsById = useCallback(async (newsId, title, body, images = []) => {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (body) formData.append('body', body);
    images.forEach(img => formData.append('images', img));
    
    return apiClient(`/news/${newsId}`, { 
      method: 'PATCH', 
      body: formData 
    });
  }, []);

  const register = useCallback(async (username, password) => {
    if (isDeviceIdLoading) throw new Error('Device ID загружается...');
    return apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }, [isDeviceIdLoading]);

  const login = useCallback(async (username, password) => {
    if (isDeviceIdLoading) throw new Error('Device ID загружается...');
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }, [isDeviceIdLoading]);

  const getMe = useCallback(async () => {
    return apiClient('/users/me');
  }, []);

  const logout = useCallback(async () => {
    return apiClient('/auth/logout', { method: 'POST' });
  }, []);

  return {
    isDeviceIdLoading,
    deviceId,
    createNews,
    getAllNews,
    getNewsById,
    deleteNewsById,
    updateNewsById,
    register,
    login,
    getMe,
    logout,
  };
};

export default useApi;