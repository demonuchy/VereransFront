// api/simpleClient.js
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Простая обертка над fetch
const apiClient = async (url, options = {}) => {
  // 1. Берем токен из localStorage
  console.log("1. Берем токен из localStorage")
  const token = localStorage.getItem('accessToken');
  const deviceId = localStorage.getItem('app_device_id');
  
  // 2. Формируем заголовки
  console.log("2. Формируем заголовки")
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
    console.log("Добавляем токен")
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 3. Делаем запрос
  console.log("3. Делаем запрос ...")
  try{
    let response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });
    if (response.ok) {
        const data = await response.json();
        console.log("все хорошо - возвращаем данные")
        return data
    }
  } catch (err) {
    console.log("поймали ошибку !!")
    console.log("401 - пробуем обновить токен")
    console.log('🔄 Токен Доступа исетк, пробуем обновить...');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      window.location.href = '/login';
      throw new Error('Нет refresh токена');
    }
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
        'X-Device-Id': deviceId || 'unknown-device'
      }
    });
    if (refreshResponse.ok) {
      const response = await refreshResponse.json();
      localStorage.setItem('accessToken', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refreshToken', response.data.refresh_token);
      }
      headers['Authorization'] = `Bearer ${response.data.access_token}`;
      const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
      });
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        return retryData;
      }
    }
    
    // Если не удалось обновить токен
    console.log('❌ Не удалось обновить токен');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw new Error('Сессия истекла');
  }
};

export default apiClient;