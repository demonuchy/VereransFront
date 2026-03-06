// layouts/AuthLayout.jsx
import { Outlet, Link } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-body">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;