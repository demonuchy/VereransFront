// components/HeaderBar.jsx
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

const HeaderBar = () => {
  const images = [
    'orig.jpg',
    'orig1.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="header-bar">
      <Logo />
      <div className="slideshow-container">
        {images.map((src, index) => (
          <div 
            key={index}
            className={`slide ${index === currentImageIndex ? 'active' : ''} ${
              isTransitioning && index === currentImageIndex ? 'exiting' : ''
            }`}
          >
            <img 
              src={src} 
              alt={`Slide ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        {/* Прогресс-бар для слайдшоу */}
        <div className="slideshow-progress">
          <div 
            className="slideshow-progress-bar" 
            style={{ 
              width: `${((currentImageIndex + 1) / images.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;