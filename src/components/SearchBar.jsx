// components/SearchBar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

const SearchBar = ({ onChange, onSearch, isLoading = false }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Дебаунсированный поиск
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (onChange) {
        onChange(value);
      }
      if (onSearch) {
        onSearch(value);
      }
    }, 500),
    [onChange, onSearch]
  );

  useEffect(() => {
    debouncedSearch(searchValue);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchValue, debouncedSearch]);

  const handleClear = () => {
    setSearchValue('');
    if (onChange) {
      onChange('');
    }
    if (onSearch) {
      onSearch('');
    }
  };

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
          
          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="search-loading">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          )}
          
          {/* Кнопка очистки (появляется когда есть текст) */}
          {searchValue && !isLoading && (
            <button 
              className="clear-button"
              onClick={handleClear}
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