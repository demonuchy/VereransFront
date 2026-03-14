import React, { useState } from 'react';

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="search-container">
      <div className={`search-wrapper ${isFocused ? 'focused' : ''}`}>
        <div className="search-row--container">
          {/* Иконка поиска */}
          <svg 
            className="search-icon" 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          
          <input 
            type="text" 
            className="search-row"
            placeholder="Что ищете?"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          {/* Кнопка очистки (появляется когда есть текст) */}
          {searchValue && (
            <button 
              className="clear-button"
              onClick={() => setSearchValue('')}
              aria-label="Очистить поиск"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;