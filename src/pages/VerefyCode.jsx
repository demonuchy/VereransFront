import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthContext';

const VerificationCode = ({ 
  initialTime = 300 // 5 минут по умолчанию
}) => {
  const navigate = useNavigate();
  const {verifyCode} = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  // Таймер обратного отсчета
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Обработка изменения кода
  const handleChange = (index, value) => {
    // Только цифры
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Берем только последний символ
    setCode(newCode);
    setError('');

    // Автоматически переключаемся на следующий инпут
    if (value && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Если код полностью заполнен
    if (index === 5 && value) {
      handleSubmit(newCode.join(''));
    }
  };

  // Обработка нажатия клавиши Backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Если поле пустое, переходим на предыдущее
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else if (code[index]) {
        // Очищаем текущее поле
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  // Обработка вставки из буфера обмена
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('').slice(0, 6);
      const newCode = [...code];
      digits.forEach((digit, idx) => {
        if (idx < 6) newCode[idx] = digit;
      });
      setCode(newCode);
      
      // Фокусируемся на следующем пустом поле или последнем
      const lastFilledIndex = digits.length - 1;
      if (lastFilledIndex < 5) {
        setActiveIndex(lastFilledIndex + 1);
        inputRefs.current[lastFilledIndex + 1]?.focus();
      }
      
      if (digits.length === 6) {
        handleSubmit(newCode.join(''));
      }
    }
  };

  // Отправка кода на проверку
  const handleSubmit = async (verificationCode) => {
    if (verificationCode.length !== 6) {
      setError('Пожалуйста, введите полный код из 6 цифр');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      const response = await verifyCode(code.join(''))
      if (response.success) {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Неверный код подтверждения');
      setCode(['', '', '', '', '', '']);
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Отправка запроса на новый код
  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      // Resend code
      setTimeLeft(initialTime);
      setCanResend(false);
      setError('');
      // Не очищаем код, просто даем пользователю ввести новый
    } catch (err) {
      setError(err.message || 'Не удалось отправить код. Попробуйте позже.');
    }
  };

  // Фокус на первом инпуте при монтировании
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="verification-page">
      {/* Hero секция */}
      <div className="verification-hero">
        <div className="verification-hero-overlay"></div>
        <div className="verification-hero-content">
          <h1 className="verification-hero-title">✨ Подтверждение email</h1>
        </div>
      </div>

      {/* Основной блок */}
      <div className="verification-section">
        <div className="verification-card">
          <div className="verification-card-header">
            <div className="verification-icon-wrapper">
              <div className="verification-icon">🔐</div>
            </div>
            <h2 className="verification-title">Код подтверждения</h2>
            <div className="verification-divider"></div>
          </div>

          <div className="verification-card-body">
            {/* Индикатор времени */}
            <div className="timer-container">
              <div className={`timer ${timeLeft <= 60 ? 'timer-warning' : ''}`}>
                <span className="timer-icon">⏱️</span>
                <span className="timer-text">
                  {timeLeft > 0 ? formatTime(timeLeft) : 'Код истек'}
                </span>
              </div>
            </div>

            {/* Поля ввода кода */}
            <div className="code-input-container">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`code-input ${error ? 'error' : ''} ${
                    digit ? 'filled' : ''
                  } ${activeIndex === index ? 'active' : ''}`}
                  disabled={isVerifying}
                />
              ))}
            </div>

            {/* Ошибка */}
            {error && (
              <div className="verification-error">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            {/* Кнопка подтверждения */}
            <button
              onClick={() => handleSubmit(code.join(''))}
              disabled={isVerifying || code.some((d) => !d)}
              className="verify-button"
            >
              {isVerifying ? (
                <>
                  <span className="button-loader-small"></span>
                  Проверка...
                </>
              ) : (
                'Подтвердить'
              )}
            </button>

            {/* Блок с повторной отправкой */}
            <div className="resend-container">
              {canResend ? (
                <button onClick={handleResendCode} className="resend-button">
                  Отправить код повторно
                </button>
              ) : (
                <p className="resend-text">
                  Отправить код повторно можно через {formatTime(timeLeft)}
                </p>
              )}
            </div>

            {/* Кнопка назад */}
            <button onClick={() =>{navigate("/sign-up")}} className="back-button">
              ← Назад к регистрации
            </button>
          </div>

          <div className="verification-card-footer">
            <p className="footer-text">
              Не получили письмо? Проверьте папку <strong>Спам</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationCode;