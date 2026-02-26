// pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthContext';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
    } else if (formData.password.length > 30) {
      newErrors.password = 'Пароль должен содержать максимум 30 символов';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать заглавные, строчные буквы и цифры';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
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
      const response = await register(formData.email, formData.password);
      console.log('Register response:', response);
      
      if (response?.data?.access_token) {
        navigate('/');
      } else {
        setApiError('Неверный ответ от сервера');
      }
    } catch (error) {
      console.error('Register error:', error);
      
      if (error.message === 'Failed to fetch') {
        setApiError('Ошибка подключения к серверу. Проверьте подключение.');
      } else if (error.message.includes('409')) {
        setApiError('Пользователь с таким email уже существует');
      } else if (error.message.includes('400')) {
        setApiError('Неверные данные регистрации');
      } else {
        setApiError(error.message || 'Ошибка при регистрации');
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
        placeholder="Минимум 6 символов"
        icon="🔒"
        required
        autoComplete="new-password"
      />

      <InputField
        type="password"
        label="Подтверждение пароля"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Повторите пароль"
        icon="🔒"
        required
        autoComplete="new-password"
      />

      <div className="auth-terms">
        <input type="checkbox" id="terms" required />
        <label htmlFor="terms">
          Я принимаю условия использования и политику конфиденциальности
        </label>
      </div>

      <div className="auth-links">
        <Link to="/login" className="auth-link">
          Уже есть аккаунт? Войти
        </Link>
      </div>

      <SubmitButton loading={loading}>
        Зарегистрироваться
      </SubmitButton>
    </form>
  );
};

export default Register;