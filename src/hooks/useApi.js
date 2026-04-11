// hooks/useApi.js
import { useCallback } from 'react';
import apiClient from '../api/client';

const useApi = () => {
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
    return apiClient(
      `/news/${newsId}`, 
      { method: 'DELETE' }
    );
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

  const likeNews = useCallback(async (newsId) => {
    return apiClient(
      `/news/${newsId}/like`, 
      { method: 'POST' }
    );
  }, []);

  const leaveComment = useCallback(async (newsId, content) => {
    const formData = new FormData();
    formData.append('content', content);
    return apiClient(
      `/news/${newsId}/comment`, 
      { 
        method: 'POST', 
        body: formData 
      }
    );
  }, []);

  const deleteComment = useCallback(async (newsId, commentId) => {
    return apiClient(
      `/news/${newsId}/comment/${commentId}`, 
      { method: 'POST' }
    );
  }, []);

  const register = useCallback(async (username, password) => {
    return apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }, []);

  const login = useCallback(async (username, password) => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }, []);

  const getMe = useCallback(async () => {
    return apiClient('/users/me');
  }, []);

  const logout = useCallback(async () => {
    return apiClient('/auth/logout', { method: 'POST' });
  }, []);

  return {
    createNews,
    getAllNews,
    getNewsById,
    deleteNewsById,
    updateNewsById,
    likeNews,
    leaveComment,
    deleteComment,
    register,
    login,
    getMe,
    logout,
  };
};

export default useApi;