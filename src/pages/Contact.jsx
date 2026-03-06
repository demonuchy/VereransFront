import React from 'react';

const Contacts = () => {
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
      answer: 'Вы можете записаться по телефону +7 (495) 123-45-67.'
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

      {/* Карта */}
      <section className="map-section">
        <div className="container">
          <div className="map-container-large">
            <div className="section-header">
              <h2 className="section-title">Как нас найти</h2>
              <div className="section-divider"></div>
            </div>
            
            <div className="map-wrapper">
              <iframe
                title="Карта проезда"
                src="https://yandex.ru/map-widget/v1/?ll=37.617494%2C55.750625&z=12"
                width="100%"
                height="450"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="map-info-detailed">
              <div className="map-info-item">
                <span className="map-info-icon-large">🚇</span>
                <div className="map-info-content">
                  <h4 className="map-info-item-title">Метро</h4>
                  <p className="map-info-item-text">м. Парк Победы, выход №3, далее 5 минут пешком</p>
                </div>
              </div>
              
              <div className="map-info-item">
                <span className="map-info-icon-large">🚌</span>
                <div className="map-info-content">
                  <h4 className="map-info-item-title">Автобус</h4>
                  <p className="map-info-item-text">Автобусы № 42, 73, ост. "Дом ветеранов"</p>
                </div>
              </div>
              
              <div className="map-info-item">
                <span className="map-info-icon-large">🚗</span>
                <div className="map-info-content">
                  <h4 className="map-info-item-title">Автомобиль</h4>
                  <p className="map-info-item-text">Парковка доступна по ул. Ветеранов</p>
                </div>
              </div>
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