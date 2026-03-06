// components/InputField.jsx
import React from 'react';

const InputField = ({
  type,
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  icon,
  required,
  autoComplete,
  helperText
}) => {
  return (
    <div className="input-field-wrapper">
      {label && (
        <label htmlFor={name} className="input-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? 'error' : ''}
          autoComplete={autoComplete}
        />
      </div>
      {error && <div className="input-error">{error}</div>}
      {helperText && !error && <div className="auth-helper-text">{helperText}</div>}
    </div>
  );
};

export default InputField;