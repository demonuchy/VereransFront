import React from 'react';

const About = () => {
  const achievements = [
    { number: '500+', label: 'Ветеранов', icon: '👥' },
    { number: '50+', label: 'Лет опыта', icon: '📅' },
    { number: '1000+', label: 'Мероприятий', icon: '🎉' },
    { number: '100+', label: 'Наград', icon: '🏆' }
  ];

  const teamMembers = [
    {
      name: 'Иванов Петр Сидорович',
      position: 'Председатель совета',
      image: '/images/team/leader.jpg',
      description: 'Ветеран Великой Отечественной войны, полковник в отставке'
    },
    {
      name: 'Смирнова Анна Михайловна',
      position: 'Заместитель председателя',
      image: '/images/team/deputy.jpg',
      description: 'Ветеран труда, заслуженный учитель РФ'
    },
    {
      name: 'Кузнецов Алексей Иванович',
      position: 'Секретарь совета',
      image: '/images/team/secretary.jpg',
      description: 'Ветеран боевых действий, кавалер ордена Мужества'
    },
    {
      name: 'Васильева Елена Петровна',
      position: 'Ответственный за соц. вопросы',
      image: '/images/team/social.jpg',
      description: 'Ветеран труда, более 30 лет работы в социальной сфере'
    }
  ];

  return (
    <div className="about-page">
      {/* Герой секция */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">О нашем Совете ветеранов</h1>
            <p className="about-hero-subtitle">
              Сохраняя память, воспитывая будущее, заботясь о настоящем
            </p>
          </div>
        </div>
      </section>

      {/* Миссия и ценности */}
      <section className="mission-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Наша миссия</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎖️</div>
              <h3 className="mission-card-title">Защита прав</h3>
              <p className="mission-card-text">
                Защита социальных, трудовых и иных прав ветеранов, 
                обеспечение достойной жизни и уважения к их заслугам
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">📚</div>
              <h3 className="mission-card-title">Патриотическое воспитание</h3>
              <p className="mission-card-text">
                Воспитание молодежи на примерах мужества и героизма 
                старшего поколения, сохранение исторической памяти
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">🤝</div>
              <h3 className="mission-card-title">Поддержка</h3>
              <p className="mission-card-text">
                Оказание всесторонней помощи ветеранам и их семьям, 
                организация досуга и социальной адаптации
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">🏛️</div>
              <h3 className="mission-card-title">Сохранение истории</h3>
              <p className="mission-card-text">
                Сбор и сохранение воспоминаний, документов, 
                создание музеев и уголков боевой славы
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* История организации */}
      <section className="history-section">
        <div className="container">
          <div className="history-content">
            <div className="history-text">
              <h2 className="section-title">История совета</h2>
              <div className="section-divider"></div>
              <p className="history-paragraph">
                Совет ветеранов был основан в 1985 году группой фронтовиков, 
                прошедших Великую Отечественную войну. За это время организация 
                прошла большой путь от небольшого объединения до крупнейшей 
                ветеранской организации региона.
              </p>
              <p className="history-paragraph">
                Сегодня мы объединяем более 500 ветеранов различных категорий: 
                участников Великой Отечественной войны, тружеников тыла, ветеранов 
                боевых действий, военной службы и труда. Наша организация активно 
                сотрудничает с администрацией города, образовательными учреждениями 
                и общественными организациями.
              </p>
              <div className="history-stats">
                <div className="history-stat-item">
                  <span className="history-stat-number">40+</span>
                  <span className="history-stat-label">лет работы</span>
                </div>
                <div className="history-stat-item">
                  <span className="history-stat-number">5000+</span>
                  <span className="history-stat-label">оказанных услуг</span>
                </div>
                <div className="history-stat-item">
                  <span className="history-stat-number">200+</span>
                  <span className="history-stat-label">патриотических акций</span>
                </div>
              </div>
            </div>
            <div className="history-image">
              <img src="/images/history.jpg" alt="История совета ветеранов" />
            </div>
          </div>
        </div>
      </section>

      {/* Достижения в цифрах */}
      <section className="achievements-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Наши достижения</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="achievements-grid">
            {achievements.map((item, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">{item.icon}</div>
                <div className="achievement-number">{item.number}</div>
                <div className="achievement-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Команда */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Руководство совета</h2>
            <div className="section-divider"></div>
            <p className="section-subtitle">
              Люди, которые ежедневно заботятся о ветеранах
            </p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-card-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-card-content">
                  <h3 className="team-card-name">{member.name}</h3>
                  <p className="team-card-position">{member.position}</p>
                  <p className="team-card-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Документы */}
      <section className="documents-section">
        <div className="container">
          <div className="documents-grid">
            <div className="documents-card">
              <h3 className="documents-card-title">Устав организации</h3>
              <p className="documents-card-text">
                Основной документ, регламентирующий деятельность совета ветеранов
              </p>
              <button className="documents-button">Скачать PDF</button>
            </div>
            
            <div className="documents-card">
              <h3 className="documents-card-title">Отчеты о работе</h3>
              <p className="documents-card-text">
                Ежегодные отчеты о деятельности и достижениях организации
              </p>
              <button className="documents-button">Смотреть отчеты</button>
            </div>
            
            <div className="documents-card">
              <h3 className="documents-card-title">Программа развития</h3>
              <p className="documents-card-text">
                Стратегия развития совета ветеранов до 2030 года
              </p>
              <button className="documents-button">Ознакомиться</button>
            </div>
          </div>
        </div>
      </section>

      {/* Партнеры */}
      <section className="partners-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Наши партнеры</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="partners-grid">
            <div className="partner-item">Администрация города</div>
            <div className="partner-item">Совет ветеранов войны</div>
            <div className="partner-item">Министерство соцзащиты</div>
            <div className="partner-item">Военный комиссариат</div>
            <div className="partner-item">Образовательные учреждения</div>
            <div className="partner-item">Волонтерские организации</div>
          </div>
        </div>
      </section>

      {/* Призыв к действию */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Хотите помочь ветеранам?</h2>
            <p className="cta-text">
              Присоединяйтесь к нашей команде волонтеров или станьте 
              спонсором социальных программ
            </p>
            <button className="cta-button">Стать волонтером</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;