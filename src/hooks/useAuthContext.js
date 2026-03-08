// hooks/useAuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import useApi from './useApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceReady, setDeviceReady] = useState(false);
  
  const { 
    login: apiLogin, 
    register: apiRegister, 
    getMe, 
    logout: apiLogout,
    isDeviceIdLoading,
    deviceId
  } = useApi();

  // Ждем deviceId
  useEffect(() => {
    if (!isDeviceIdLoading && deviceId) {
      console.log('✅ Device ID готов');
      setDeviceReady(true);
    }
  }, [isDeviceIdLoading, deviceId]);

  const initAuth = async () => {
    if (!deviceReady) {
      console.warn("Device not ready")
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn("Token not found")
      setLoading(false);
      return;
    }
    try {
      console.log("Send request get me")
      const response = await getMe();
      console.log('getMe response:', response);
      if (response?.data?.user) {
        
        setUser(response.data.user);
      } else {
        console.warn("User not found remove tokens...")
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("Init auth ....")
    initAuth();
  }, [deviceReady, getMe]);

  const login = async (username, password) => {
    if (!deviceReady) throw new Error('Device ID не готов');    
    setLoading(true);
    try {
      const response = await apiLogin(username, password);
      if (response?.data?.access_token) {
        console.log("set tokens ....")
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log("return response", response)
        initAuth();
        return response;
      }
      if (response?.data?.detail) {
        return { success: false, error: response.data.detail};
      }
      return { success: false, error: 'Ошибка входа' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password) => {
    if (!deviceReady) throw new Error('Device ID не готов');
    setLoading(true);
    try {
      const response = await apiRegister(username, password);
      console.log('Register response:', response);
      if (response?.data?.access_token) {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        initAuth();
        return response;
      }
      if (response?.data?.detail) {
        return { success: false, error: response.data.detail};
      }
      return { success: false, error: 'Ошибка регистрации' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Logout called ")
      await apiLogout();
      console.log("User logout")
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const logoutAndResetDevice = async () => {
    await logout();
    localStorage.removeItem('app_device_id');
    window.location.reload();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutAndResetDevice,
    deviceReady,
    deviceId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};