// layouts/AuthLayout.jsx
import { Outlet, Link } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Cовет ветеранов аксайского района</h1>
          </div>
          
          <div className="auth-body">
            <Outlet />
          </div>

          <div className="auth-footer">
            <Link to="/" className="auth-home-link">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;