// hooks/useAuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import useApi from './useApi';

const AuthContext = createContext(null);
const DEVICE_ID_STORAGE_KEY = 'app_device_id';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [deviceReady, setDeviceReady] = useState(false);
  
  // Используем ref для хранения актуальных токенов
  const accessTokenRef = useRef(accessToken);
  const refreshTokenRef = useRef(refreshToken);
  
  // Флаги для предотвращения множественных вызовов
  const isMounted = useRef(true);
  const isRefreshing = useRef(false);
  const refreshPromise = useRef(null);
  const initialized = useRef(false);
  
  // Получаем все необходимое из useApi
  const { 
    login: apiLogin, 
    register: apiRegister, 
    getMe, 
    refreshToken: apiRefresh, 
    logout: apiLogout,
    isDeviceIdLoading,
    deviceId
  } = useApi();

  // Следим за готовностью deviceId
  useEffect(() => {
    if (!isDeviceIdLoading && deviceId) {
      console.log('✅ Device ID is ready:', deviceId);
      setDeviceReady(true);
    } else if (isDeviceIdLoading) {
      console.log('⏳ Waiting for Device ID to load...');
    }
  }, [isDeviceIdLoading, deviceId]);

  // Синхронизируем ref с состоянием
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Безопасное обновление состояния
  const safeSetState = useCallback((setter, value) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);

  const logout = useCallback(async (skipApi = false) => {
    console.log("🔓 Logout called");
    try {
      if (!skipApi && accessTokenRef.current && deviceReady) {
        await apiLogout(accessTokenRef.current).catch(err => 
          console.error('Logout API error:', err)
        );
      }
    } finally {
      // Очищаем состояние пользователя и токены
      safeSetState(setUser, null);
      safeSetState(setAccessToken, null);
      safeSetState(setRefreshToken, null);
      accessTokenRef.current = null;
      refreshTokenRef.current = null;
      
      // Очищаем localStorage от токенов, но НЕ удаляем deviceId!
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Сбрасываем флаги
      isRefreshing.current = false;
      refreshPromise.current = null;
      initialized.current = false;
    }
  }, [apiLogout, safeSetState, deviceReady]);

  // Функция для полного выхода (с удалением deviceId)
  const logoutAndResetDevice = useCallback(async (skipApi = false) => {
    console.log("🔓 Logout and reset device called");
    try {
      if (!skipApi && accessTokenRef.current && deviceReady) {
        await apiLogout(accessTokenRef.current).catch(err => 
          console.error('Logout API error:', err)
        );
      }
    } finally {
      // Очищаем состояние
      safeSetState(setUser, null);
      safeSetState(setAccessToken, null);
      safeSetState(setRefreshToken, null);
      accessTokenRef.current = null;
      refreshTokenRef.current = null;
      
      // Очищаем localStorage ПОЛНОСТЬЮ (включая deviceId)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
      
      // Сбрасываем флаги
      isRefreshing.current = false;
      refreshPromise.current = null;
      initialized.current = false;
      setDeviceReady(false); // Сбрасываем флаг готовности device
    }
  }, [apiLogout, safeSetState, deviceReady]);

  // Функция для обновления токена
  const refreshAccessToken = useCallback(async (token) => {
    if (!deviceReady) {
      console.log("⏳ Refresh waiting for Device ID...");
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (deviceReady) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    if (isRefreshing.current) {
      console.log("🔄 Refresh already in progress, waiting...");
      return refreshPromise.current;
    }

    console.log("🔄 Refreshing access token...");
    isRefreshing.current = true;
    
    refreshPromise.current = (async () => {
      try {
        const refreshResponse = await apiRefresh(token);
        
        if (!isMounted.current) return null;
        
        if (refreshResponse?.data?.access_token) {
          const newAccessToken = refreshResponse.data.access_token;
          const newRefreshToken = refreshResponse.data.refresh_token || token;
          
          console.log("✅ Token refreshed successfully");
          
          accessTokenRef.current = newAccessToken;
          refreshTokenRef.current = newRefreshToken;
          
          safeSetState(setAccessToken, newAccessToken);
          safeSetState(setRefreshToken, newRefreshToken);
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          return newAccessToken;
        }
        return null;
      } catch (error) {
        console.error('❌ Refresh failed:', error);
        if (isMounted.current) {
          await logout(true);
        }
        return null;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, [apiRefresh, logout, safeSetState, deviceReady]);

  // Функция для получения данных пользователя
  const fetchUserData = useCallback(async (token) => {
    try {
      console.log("👤 Fetching user data...");
      const response = await getMe(token);
      
      if (response?.data?.user && isMounted.current) {
        console.log("✅ User data fetched:", response.data.user);
        safeSetState(setUser, response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to fetch user data:', error);
      return false;
    }
  }, [getMe, safeSetState]);

  // Инициализация аутентификации
  useEffect(() => {
    const initAuth = async () => {
      if (!deviceReady) {
        console.log("⏳ Auth initialization waiting for Device ID...");
        return;
      }
      
      if (initialized.current) {
        console.log("✅ Auth already initialized");
        return;
      }
      
      console.log("🚀 Initializing auth with Device ID:", deviceId);
      console.log("Initial accessToken:", accessToken ? 'exists' : 'none');
      console.log("Initial refreshToken:", refreshToken ? 'exists' : 'none');
      
      initialized.current = true;
      
      try {
        if (!accessTokenRef.current && !refreshTokenRef.current) {
          console.log("ℹ️ No tokens found");
          safeSetState(setLoading, false);
          return;
        }

        if (accessTokenRef.current) {
          console.log("🔑 Access token found, validating...");
          
          const success = await fetchUserData(accessTokenRef.current);
          
          if (success) {
            console.log("✅ Access token is valid");
            safeSetState(setLoading, false);
            return;
          }
          
          console.log("⚠️ Access token invalid, trying refresh...");
          
          if (refreshTokenRef.current) {
            const newAccessToken = await refreshAccessToken(refreshTokenRef.current);
            
            if (newAccessToken && isMounted.current) {
              const refreshSuccess = await fetchUserData(newAccessToken);
              
              if (!refreshSuccess) {
                console.log("⚠️ Still can't get user data after refresh");
                await logout(true);
              }
            } else {
              console.log("⚠️ Refresh failed");
              await logout(true);
            }
          } else {
            console.log("⚠️ No refresh token available");
            await logout(true);
          }
          
          safeSetState(setLoading, false);
          return;
        }

        if (!accessTokenRef.current && refreshTokenRef.current) {
          console.log("🔄 Only refresh token found, attempting refresh...");
          
          const newAccessToken = await refreshAccessToken(refreshTokenRef.current);
          
          if (newAccessToken && isMounted.current) {
            const success = await fetchUserData(newAccessToken);
            
            if (!success) {
              console.log("⚠️ Failed to get user data after refresh");
              await logout(true);
            }
          }
          
          safeSetState(setLoading, false);
          return;
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        await logout(true);
        safeSetState(setLoading, false);
      }
    };

    initAuth();
  }, [deviceReady, deviceId, accessToken, refreshToken, fetchUserData, refreshAccessToken, logout, safeSetState]);

  const login = async (username, password) => {
    if (!deviceReady) {
      console.log("⏳ Login waiting for Device ID...");
      throw new Error('Device ID not ready yet. Please try again.');
    }
    
    console.log("🔐 Login attempt...");
    setLoading(true);
    try {
      const response = await apiLogin(username, password);
      
      if (response?.data) {
        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;
        
        console.log("✅ Login successful");
        
        accessTokenRef.current = newAccessToken;
        refreshTokenRef.current = newRefreshToken;
        
        safeSetState(setAccessToken, newAccessToken);
        safeSetState(setRefreshToken, newRefreshToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        const success = await fetchUserData(newAccessToken);
        
        if (!success) {
          throw new Error('Failed to get user data');
        }
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Invalid response' };
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const register = async (username, password) => {
    if (!deviceReady) {
      console.log("⏳ Register waiting for Device ID...");
      throw new Error('Device ID not ready yet. Please try again.');
    }
    
    console.log("📝 Register attempt...");
    setLoading(true);
    try {
      const response = await apiRegister(username, password);
      
      if (response?.data) {
        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;
        
        console.log("✅ Register successful");
        
        accessTokenRef.current = newAccessToken;
        refreshTokenRef.current = newRefreshToken;
        
        safeSetState(setAccessToken, newAccessToken);
        safeSetState(setRefreshToken, newRefreshToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        const success = await fetchUserData(newAccessToken);
        
        if (!success) {
          throw new Error('Failed to get user data');
        }
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Invalid response' };
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const value = {
    user,
    loading,
    accessToken,
    isAuthenticated: !!user && !!accessToken && deviceReady,
    login,
    register,
    logout: () => logout(false),
    logoutAndResetDevice, // Добавляем возможность полного сброса
    deviceReady,
    deviceId, // Пробрасываем deviceId для использования в компонентах
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};