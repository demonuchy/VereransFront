// components/Auth/SubmitButton.jsx
import React from 'react';

const SubmitButton = ({ children, loading = false, disabled = false}) => {
  return (
    <button
      type="submit"
      className="auth-submit-button"
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="auth-button-loader">
          <span className="loader-dot"></span>
          <span className="loader-dot"></span>
          <span className="loader-dot"></span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default SubmitButton;