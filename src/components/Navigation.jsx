import { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pressMenuButton = useCallback(()=>{
    setIsMobileMenuOpen(!isMobileMenuOpen)
    const button = document.querySelector('.mobile-menu-btn')
    if (!isMobileMenuOpen) {
        button.classList.add('open')
    }
    else{
        button.classList.remove('open')
    }
  },[isMobileMenuOpen, setIsMobileMenuOpen])

  return (
    
      <div className="header-container">
        
        {/* Кнопка мобильного меню */}
        <button 
          className="mobile-menu-btn" 
          onClick={pressMenuButton}
        >
          <span id='1'></span>
          <span id='2'></span>
          <span id='3'></span>
        </button>

        {/* Навигация */}
        <nav className={`nav ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-item">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={pressMenuButton}
            >
              Главная
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink 
              to="/about"
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={pressMenuButton}
            >
              О нас
            </NavLink>
          </div> 
          <div className="nav-item">
            <NavLink 
              to="/contact"
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={pressMenuButton}
            >
              Контакты
            </NavLink>
          </div>
        </nav>
      </div>
  );
}

export default Navigation;