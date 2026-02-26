// components/Auth/InputField.jsx
import React from 'react';

const InputField = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  icon,
  required = false,
  autoComplete,
}) => {
  return (
    <div className="auth-input-group">
      {label && <label htmlFor={name} className="auth-label">{label}</label>}
      <div className="auth-input-wrapper">
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`auth-input ${icon ? 'with-icon' : ''} ${error ? 'error' : ''}`}
        />
      </div>
      {error && <span className="auth-error">{error}</span>}
    </div>
  );
};

export default InputField;