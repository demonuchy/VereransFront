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
  const [isLoading, setIsLoading] = useState(true); // Общее состояние загрузки
  const [deviceId, setDeviceId] = useState(null);
  const initCalledRef = useRef(false);
  
  const { 
    login: apiLogin, 
    register: apiRegister, 
    signUpWithEmailVerify : apiSignUp,
    verifyCode : apiVerifyCode,
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
      }
    };

    loadDeviceId();
  }, []);

  // Инициализация auth - запускается только когда deviceId загружен
  const initAuth = useCallback(async () => {
    console.log("🔧 initAuth вызван");
    const token = localStorage.getItem('accessToken');
    console.log("🔑 Токен в localStorage:", token ? "есть" : "нет");
    
    if (!token) {
      console.log("❌ Нет токена, инициализация завершена");
      setIsLoading(false);
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
      // Если получили 401, токен невалидный - удаляем его
      if (error.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } finally {
      console.log("🏁 Инициализация завершена");
      setIsLoading(false);
    }
  }, [getMe]);

  // Запускаем initAuth только когда deviceId загружен и initAuth еще не вызывался
  useEffect(() => {
    if (deviceId && !initCalledRef.current) {
      console.log("🚀 Запускаем initAuth, deviceId готов:", deviceId);
      initCalledRef.current = true;
      initAuth();
    }
  }, [deviceId, initAuth]);

  const login = async (username, password) => {
    console.log("🔐 Login вызван", { username, deviceId });
    
    if (!deviceId) {
      console.error("❌ Device ID не получен");
      return { success: false, error: 'Device ID не получен' };
    }
    
    setIsLoading(true);
    
    try {
      console.log("📡 Отправка запроса на /auth/login");
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
      return { success: false, error: error.message || 'Произошла ошибка при входе' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, password) => {
    console.log("📝 Register вызван", { username, deviceId });
    
    if (!deviceId) {
      console.error("❌ Device ID не получен");
      return { success: false, error: 'Device ID не получен' };
    }
    
    setIsLoading(true);
    
    try {
      console.log("📡 Отправка запроса на /auth/register");
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
      return { success: false, error: error.message || 'Произошла ошибка при регистрации' };
    } finally {
      setIsLoading(false);
    }
  };


    // 📝 Регистрация с верификацией (первый шаг)
  const signUp = async (username, password) => {
      console.log("📝 SignUp вызван", { username, deviceId });
      
      if (!deviceId) {
        console.error("❌ Device ID не получен");
        return { success: false, error: 'Device ID не получен' };
      }
      
      setIsLoading(true);
      
      try {
        console.log("📡 Отправка запроса на /auth/sign-up");
        const response = await apiSignUp(username, password);
        console.log("📥 Ответ от сервера:", response);
        
        // Сервер возвращает verification_token
        if (response?.data?.verification_token) {
          console.log("✅ Получен verification token");
          localStorage.setItem("verificationToken", response.data.verification_token);
      
          console.log("📧 Токен верификации сохранен, ожидаем ввод кода");
          
          return { 
            success: true, 
            requiresVerification: true,
            message: "Код подтверждения отправлен на почту"
          };
        }
        
        if (response?.detail) {
          console.warn("⚠️ Ошибка от сервера:", response.detail);
          return { success: false, error: response.detail };
        }
        
        console.warn("⚠️ Неизвестная ошибка регистрации");
        return { success: false, error: 'Ошибка регистрации' };
      } catch (error) {
        console.error('❌ SignUp error:', error);
        return { success: false, error: error.message || 'Произошла ошибка при регистрации' };
      } finally {
        setIsLoading(false);
      }
    };
  
    // ✅ Верификация кода (второй шаг)
    const verifyCode = async (code) => {
      console.log("🔐 VerifyCode вызван", { code });
      
      const verificationToken = localStorage.getItem("verificationToken");
      
      if (!verificationToken) {
        console.error("❌ Нет verification token");
        return { success: false, error: 'Сессия верификации истекла. Пожалуйста, зарегистрируйтесь заново.' };
      }
      
      setIsLoading(true);
      
      try {
        console.log("📡 Отправка запроса на /auth/verify-code");
        
        // Отправляем код как query параметр, токен в заголовке
        const response = await apiVerifyCode(code, verificationToken);
        console.log("📥 Ответ от сервера:", response);
        // После успешной верификации сервер возвращает access и refresh токены
        if (response?.data?.access_token) {
          console.log("✅ Код подтвержден, получаем токены");
          const accessToken = response.data.access_token;
          const refreshToken = response.data.refresh_token;
          // Сохраняем обычные токены
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          // Удаляем verification token
          localStorage.removeItem("verificationToken");
          // Получаем данные пользователя
          console.log("📡 Получаем данные пользователя");
          const userResponse = await getMe();
          
          if (userResponse?.data?.user) {
            setUser(userResponse.data.user);
            console.log("👤 Пользователь установлен:", userResponse.data.user);
          }
          
          return { 
            success: true, 
            data: response.data,
            message: "Email успешно подтвержден!"
          };
        }
        
        if (response?.detail) {
          console.warn("⚠️ Ошибка от сервера:", response.detail);
          return { success: false, error: response.detail };
        }
        
        console.warn("⚠️ Неизвестная ошибка верификации");
        return { success: false, error: 'Неверный код подтверждения' };
      } catch (error) {
        console.error('❌ VerifyCode error:', error);
        
        // Если ошибка 410 (сессия истекла) или 429 (слишком много попыток)
        if (error.status === 410) {
          localStorage.removeItem("verificationToken");
          return { success: false, error: 'Сессия верификации истекла. Пожалуйста, зарегистрируйтесь заново.' };
        }
        
        if (error.status === 429) {
          return { success: false, error: 'Слишком много попыток. Запросите новый код.' };
        }
        
        return { success: false, error: error.message || 'Неверный код подтверждения' };
      } finally {
        setIsLoading(false);
      }
    };

  const logout = async () => {
    console.log("🚪 Logout called");
    setIsLoading(true);
    
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
      setIsLoading(false);
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
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading, // Добавили состояние загрузки
    login,
    register,
    logout,
    logoutAndResetDevice,
    deviceReady: !!deviceId,
    deviceId,
    signUp,
    verifyCode,
    refreshDeviceId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};