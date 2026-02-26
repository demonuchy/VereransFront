// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthContext';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await login(formData.email, formData.password);
      console.log('Login response:', response);
      
      if (response?.data?.access_token) {
        navigate('/');
      } else {
        setApiError('Неверный ответ от сервера');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Failed to fetch') {
        setApiError('Ошибка подключения к серверу. Проверьте подключение.');
      } else if (error.message.includes('401')) {
        setApiError('Неверный email или пароль');
      } else {
        setApiError(error.message || 'Ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {apiError && (
        <div className="auth-api-error">
          {apiError}
        </div>
      )}

      <InputField
        type="email"
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="example@mail.com"
        icon="📧"
        required
        autoComplete="email"
      />

      <InputField
        type="password"
        label="Пароль"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Введите пароль"
        icon="🔒"
        required
        autoComplete="current-password"
      />

      <div className="auth-links">
        <Link to="/register" className="auth-link">
          Нет аккаунта? Зарегистрироваться
        </Link>
        <Link to="/forgot-password" className="auth-link">
          Забыли пароль?
        </Link>
      </div>

      <SubmitButton loading={loading}>
        Войти
      </SubmitButton>
    </form>
  );
};

export default Login;