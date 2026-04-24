// hooks/useAuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import useApi from './useApi';

const AuthContext = createContext(null);
const DEVICE_ID_STORAGE_KEY = 'app_device_id';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isDeviceIdLoading, setIsDeviceIdLoading] = useState(true);
  const initCalledRef = useRef(false);
  
  const { 
    login: apiLogin, 
    register: apiRegister, 
    getMe, 
    logout: apiLogout,
  } = useApi();

  // Загружаем или создаем deviceId
  useEffect(() => {
    console.log("🆔 Загрузка Device ID...");
    const loadDeviceId = async () => {
      try {
        let storedDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        
        if (storedDeviceId) {
          console.log("📦 Device ID найден в localStorage:", storedDeviceId);
          setDeviceId(storedDeviceId);
          setIsDeviceIdLoading(false);
          return;
        }
        
        console.log("🔐 Создание нового Device ID через fingerprint...");
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const newDeviceId = result.visitorId;
        
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, newDeviceId);
        setDeviceId(newDeviceId);
        console.log("✅ Новый Device ID создан:", newDeviceId);
      } catch (error) {
        console.warn("⚠️ Ошибка при создании Device ID:", error);
        const fallback = 'fallback-' + Date.now();
        localStorage.setItem(DEVICE_ID_STORAGE_KEY, fallback);
        setDeviceId(fallback);
        console.log("🔄 Используем fallback Device ID:", fallback);
      } finally {
        setIsDeviceIdLoading(false);
      }
    };

    loadDeviceId();
  }, []);

  const initAuth = useCallback(async () => {
    console.log("🔧 initAuth вызван, isDeviceIdLoading:", isDeviceIdLoading, "deviceId:", deviceId);
    if (isDeviceIdLoading) {
      console.log("⏳ Ожидание загрузки Device ID...");
      return;
    }
    if (!deviceId) {
      console.warn("❌ Device ID не получен");
      return;
    }
    console.log("✅ Device ID готов:", deviceId);
    const token = localStorage.getItem('accessToken');
    console.log("🔑 Токен в localStorage:", token ? "есть" : "нет");
    if (!token) {
      return;
    }
    try {
      console.log("📡 Отправка запроса getMe");
      const response = await getMe();
      console.log('✅ getMe response:', response); 
      if (response?.data?.user) {
        setUser(response.data.user);
        console.log("👤 Пользователь установлен:", response.data.user);
      } else {
        console.warn("⚠️ Пользователь не найден, удаляем токены...");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      console.log("🏁 Инициализация завершена, loading:", false);
    }
  }, [deviceId, getMe, isDeviceIdLoading]);

  useEffect(() => {
    console.log("🔄 useEffect проверка:", { isDeviceIdLoading, deviceId, initCalled: initCalledRef.current });
    if (!isDeviceIdLoading && deviceId && !initCalledRef.current) {
      console.log("🚀 Запускаем initAuth");
      initCalledRef.current = true;
      initAuth();
    }
  }, [isDeviceIdLoading, deviceId, initAuth]);

  const login = async (username, password) => {
    console.log("🔐 Login вызван", { username, deviceId, isDeviceIdLoading });
    if (isDeviceIdLoading) {
      console.error("❌ Device ID еще загружается");
      return { success: false, error: 'Device ID еще загружается, подождите...' };
    }
    if (!deviceId) {
      console.error("❌ Device ID не получен");
      return { success: false, error: 'Device ID не получен' };
    }
    console.log("📡 Отправка запроса на /auth/login");
    try {
      const response = await apiLogin(username, password);
      console.log("📥 Ответ от сервера:", response);
      if (response?.data?.access_token) {
        console.log("✅ Успешный вход, сохраняем токены");
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log("📡 Получаем данные пользователя");
        const userResponse = await getMe();
        console.log("👤 Данные пользователя:", userResponse);
        if (userResponse?.data?.user) {
          setUser(userResponse.data.user);
          console.log("✅ Пользователь установлен в состояние");
        }
        return { success: true, data: response.data };
      }
      if (response?.data?.detail) {
        console.warn("⚠️ Ошибка от сервера:", response.data.detail);
        return { success: false, error: response.data.detail };
      }
      console.warn("⚠️ Неизвестная ошибка входа");
      return { success: false, error: 'Ошибка входа' };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Полный объект ошибки:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Произошла ошибка при входе' };
    }
  };

  const register = async (username, password) => {
    console.log("📝 Register вызван", { username, deviceId, isDeviceIdLoading });
    if (isDeviceIdLoading) {
      console.error("❌ Device ID еще загружается");
      return { success: false, error: 'Device ID еще загружается, подождите...' };
    }
    if (!deviceId) {
      console.error("❌ Device ID не получен");
      return { success: false, error: 'Device ID не получен' };
    }
    console.log("📡 Отправка запроса на /auth/register");
    try {
      const response = await apiRegister(username, password);
      console.log("📥 Ответ от сервера:", response);
      if (response?.data?.access_token) {
        console.log("✅ Успешная регистрация, сохраняем токены");
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log("📡 Получаем данные пользователя");
        const userResponse = await getMe();
        console.log("👤 Данные пользователя:", userResponse);
        if (userResponse?.data?.user) {
          setUser(userResponse.data.user);
          console.log("✅ Пользователь установлен в состояние");
        }
        return { success: true, data: response.data };
      }
      if (response?.data?.detail) {
        console.warn("⚠️ Ошибка от сервера:", response.data.detail);
        return { success: false, error: response.data.detail };
      }
      console.warn("⚠️ Неизвестная ошибка регистрации");
      return { success: false, error: 'Ошибка регистрации' };
    } catch (error) {
      console.error('❌ Register error:', error);
      console.error('❌ Полный объект ошибки:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Произошла ошибка при регистрации' };
    }
  };

  const logout = async () => {
    console.log("🚪 Logout called");
    try {
      await apiLogout();
      console.log("✅ User logged out from server");
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log("🗑️ Токены удалены, пользователь сброшен");
    }
  };

  const logoutAndResetDevice = async () => {
    console.log("🔄 Logout and reset device");
    await logout();
    localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
    console.log("🔄 Перезагрузка страницы");
    window.location.reload();
  };

  const refreshDeviceId = async () => {
    console.log("🔄 Refresh device ID");
    setIsDeviceIdLoading(true);
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const newDeviceId = result.visitorId;
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, newDeviceId);
      setDeviceId(newDeviceId);
      console.log("✅ Device ID обновлен:", newDeviceId);
      return newDeviceId;
    } catch (error) {
      console.error("❌ Ошибка обновления Device ID:", error);
      const fallback = 'fallback-' + Date.now();
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, fallback);
      setDeviceId(fallback);
      console.log("🔄 Используем fallback Device ID:", fallback);
      return fallback;
    } finally {
      setIsDeviceIdLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutAndResetDevice,
    deviceReady: !isDeviceIdLoading && !!deviceId,
    deviceId,
    refreshDeviceId,
    
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};