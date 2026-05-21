// api/simpleClient.js
const API_BASE_URL = '/api/';

// Простая обертка над fetch
const apiClient = async (url, options = {}, version = "v1") => {
  console.log("1. Берем токен из localStorage");
  const token = localStorage.getItem('accessToken');
  const deviceId = localStorage.getItem('app_device_id');
  
  // 2. Формируем заголовки
  console.log("2. Формируем заголовки");
  const headers = {
    'X-Device-Id': deviceId || 'unknown-device',
    ...options.headers
  };
  
  // Если это не FormData - добавляем Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Если есть токен - добавляем Authorization
  if (token) {
    console.log("Добавляем токен");
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Функция для выполнения запроса
  const makeRequest = async (customHeaders = headers) => {
    const response = await fetch(`${API_BASE_URL}${version}${url}`, {
      ...options,
      headers: customHeaders
    });
    
    // Для ошибок 401 не делаем редирект, а возвращаем ошибку
    if (response.status === 401) {
      console.log("⚠️ Получен 401 Unauthorized");
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }
    
    // Для других ошибок
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // Если не удалось распарсить JSON
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    
    // Успешный ответ
    const data = await response.json();
    return data;
  };
  
  try {
    // Пытаемся выполнить запрос
    return await makeRequest();
  } catch (error) {
    // Если ошибка 401 и есть refresh token - пробуем обновить
    if (error.status === 401) {
      console.log("🔄 401 ошибка, пробуем обновить токен...");
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.log("❌ Нет refresh токена");
        // Возвращаем ошибку, а не делаем редирект
        throw new Error('Необходима авторизация');
      }
      
      try {
        // Обновляем токен
        const refreshResponse = await fetch(`${API_BASE_URL}v1/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Id': deviceId || 'unknown-device',
            'Authorization' : `Bearer ${refreshToken}`
          },
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.access_token || refreshData.data?.access_token;
          
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            
            if (refreshData.refresh_token || refreshData.data?.refresh_token) {
              localStorage.setItem('refreshToken', refreshData.refresh_token || refreshData.data?.refresh_token);
            }
            
            console.log("✅ Токен успешно обновлен");
            
            // Повторяем исходный запрос с новым токеном
            const newHeaders = {
              ...headers,
              'Authorization': `Bearer ${newAccessToken}`
            };
            
            return await makeRequest(newHeaders);
          }
        }
        
        // Если не удалось обновить токен
        console.log("❌ Не удалось обновить токен");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // ВАЖНО: НЕ делаем window.location.href = '/login'
        // Возвращаем ошибку, чтобы компонент сам решил что делать
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        
      } catch (refreshError) {
        console.error("❌ Ошибка при обновлении токена:", refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
    }
    
    // Пробрасываем другие ошибки дальше
    throw error;
  }
};

export default apiClient;