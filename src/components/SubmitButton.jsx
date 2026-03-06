// components/SubmitButton.jsx
import React from 'react';

const SubmitButton = ({ loading, children }) => {
  return (
    <button 
      type="submit" 
      className={`submit-button ${loading ? 'loading' : ''}`}
      disabled={loading}
    >
      {loading ? (
        <div className="auth-button-loader">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default SubmitButton;