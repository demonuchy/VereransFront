import React, { useState } from 'react';


const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь логика отправки формы
    console.log('Form submitted:', formData);
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.'
    });
    
    // Очистка формы через 3 секунды
    setTimeout(() => {
      setFormStatus({
        submitted: false,
        success: false,
        message: ''
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 5000);
  };

  const contacts = [
    {
      icon: '📍',
      title: 'Адрес',
      details: ['г. Москва, ул. Ветеранов, д. 15', 'офис 405, 4 этаж']
    },
    {
      icon: '📞',
      title: 'Телефоны',
      details: [
        '+7 (495) 123-45-67 (приемная)',
        '+7 (495) 765-43-21 (соц. вопросы)',
        '+7 (495) 987-65-43 (бухгалтерия)'
      ]
    },
    {
      icon: '✉️',
      title: 'Email',
      details: [
        'info@sovetveteranov.ru',
        'support@sovetveteranov.ru',
        'press@sovetveteranov.ru'
      ]
    },
    {
      icon: '🕒',
      title: 'Режим работы',
      details: [
        'Пн-Пт: 9:00 - 18:00',
        'Сб: 10:00 - 15:00 (дежурный)',
        'Вс: выходной'
      ]
    }
  ];

  const socials = [
    { name: 'ВКонтакте', icon: 'В', url: 'https://vk.com' },
    { name: 'Telegram', icon: '📱', url: 'https://t.me' },
    { name: 'Одноклассники', icon: 'О', url: 'https://ok.ru' },
    { name: 'YouTube', icon: '▶️', url: 'https://youtube.com' }
  ];

  const faqItems = [
    {
      question: 'Как записаться на прием?',
      answer: 'Вы можете записаться по телефону +7 (495) 123-45-67 или через форму обратной связи на сайте.'
    },
    {
      question: 'Какие документы нужны для консультации?',
      answer: 'При себе необходимо иметь паспорт и удостоверение ветерана (при наличии).'
    },
    {
      question: 'Проводите ли вы выездные консультации?',
      answer: 'Да, для маломобильных ветеранов мы организуем выездные консультации на дом.'
    }
  ];

  return (
    <div className="contacts-page">
      {/* Заголовок */}
      <section className="contacts-hero">
        <div className="contacts-hero-overlay"></div>
        <div className="container">
          <div className="contacts-hero-content">
            <h1 className="contacts-hero-title">Свяжитесь с нами</h1>
            <p className="contacts-hero-subtitle">
              Мы всегда готовы выслушать, помочь и поддержать
            </p>
          </div>
        </div>
      </section>

      {/* Контактная информация */}
      <section className="contacts-info-section">
        <div className="container">
          <div className="contacts-grid">
            {contacts.map((contact, index) => (
              <div key={index} className="contact-card">
                <div className="contact-card-icon">{contact.icon}</div>
                <h3 className="contact-card-title">{contact.title}</h3>
                {contact.details.map((detail, idx) => (
                  <p key={idx} className="contact-card-text">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Карта и форма */}
      <section className="map-form-section">
        <div className="container">
          <div className="map-form-grid">
            <div className="map-container">
              <div className="map-placeholder">
                <iframe
                  title="Карта проезда"
                  src="https://yandex.ru/map-widget/v1/?ll=37.617494%2C55.750625&z=12"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="map-info">
                <h4 className="map-info-title">Как добраться</h4>
                <p className="map-info-text">
                  <span className="map-info-icon">🚇</span> 
                  м. Парк Победы, выход №3, далее 5 минут пешком
                </p>
                <p className="map-info-text">
                  <span className="map-info-icon">🚌</span> 
                  Автобусы № 42, 73, ост. "Дом ветеранов"
                </p>
                <p className="map-info-text">
                  <span className="map-info-icon">🚗</span> 
                  Парковка доступна по ул. Ветеранов
                </p>
              </div>
            </div>

            <div className="form-container">
              <h3 className="form-title">Напишите нам</h3>
              <p className="form-subtitle">
                Заполните форму и мы свяжемся с вами в ближайшее время
              </p>

              {formStatus.submitted && formStatus.success && (
                <div className="form-success">
                  {formStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Ваше имя <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Иванов Иван Иванович"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="ivanov@mail.ru"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    Тема обращения <span className="required">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Выберите тему</option>
                    <option value="consultation">Запись на консультацию</option>
                    <option value="help">Нужна помощь</option>
                    <option value="volunteer">Хочу стать волонтером</option>
                    <option value="suggestion">Предложение сотрудничества</option>
                    <option value="question">Вопрос о деятельности</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Сообщение <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    required
                    placeholder="Опишите ваш вопрос или проблему..."
                    rows="5"
                  />
                </div>

                <div className="form-checkbox">
                  <input type="checkbox" id="consent" required />
                  <label htmlFor="consent">
                    Я согласен на обработку персональных данных
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="form-submit-button"
                  disabled={formStatus.submitted}
                >
                  {formStatus.submitted ? 'Отправляется...' : 'Отправить сообщение'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Социальные сети */}
      <section className="social-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Мы в соцсетях</h2>
            <div className="section-divider"></div>
            <p className="section-subtitle">
              Подписывайтесь, чтобы быть в курсе новостей
            </p>
          </div>

          <div className="social-grid">
            {socials.map((social, index) => (
              <a 
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card"
              >
                <div className="social-icon">{social.icon}</div>
                <span className="social-name">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Часто задаваемые вопросы */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Часто задаваемые вопросы</h2>
            <div className="section-divider"></div>
          </div>

          <div className="faq-grid">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{item.question}</h3>
                <p className="faq-answer">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Призыв к действию */}
      <section className="contacts-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Нужна помощь прямо сейчас?</h2>
            <p className="cta-text">
              Позвоните на нашу горячую линию — мы работаем круглосуточно
            </p>
            <a href="tel:+74951234567" className="cta-phone">+7 (495) 123-45-67</a>
            <p className="cta-note">Звонок бесплатный по России</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacts;