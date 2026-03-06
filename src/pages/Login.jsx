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
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-overlay"></div>
        <div className="container">
          <div className="auth-hero-content">
            <h1 className="auth-hero-title">Добро пожаловать!</h1>
            <p className="auth-hero-subtitle">
              Войдите в свой аккаунт, чтобы быть в курсе всех событий
            </p>
          </div>
        </div>
      </div>

      <div className="auth-section">
        <div className="container">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Вход в систему</h2>
              <div className="auth-card-divider"></div>
            </div>

            <div className="auth-card-body">
              <form onSubmit={handleSubmit} className="auth-form">
                {apiError && (
                  <div className="auth-error-message">
                    <span className="auth-error-icon">⚠️</span>
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
                  <Link to="/register" className="auth-link auth-link-primary">
                    Нет аккаунта? Зарегистрироваться
                  </Link>
                  <Link to="/forgot-password" className="auth-link auth-link-secondary">
                    Забыли пароль?
                  </Link>
                </div>

                <SubmitButton loading={loading}>
                  Войти
                </SubmitButton>
              </form>
            </div>

            <div className="auth-card-footer">
              <Link to="/" className="auth-home-link">
                ← Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;