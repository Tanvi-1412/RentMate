import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
  const { currentUser, isAuthenticated, role, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={isAuthenticated ? '/home' : '/login'} className="nav-logo">
          RENT<span>MATE</span>
        </Link>

        {isAuthenticated && (
          <ul className="nav-links">
            <li>
              <NavLink to="/home" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Browse
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                My Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/requests/incoming" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Requests
              </NavLink>
            </li>
            <li>
              <NavLink to="/messages" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Messages
              </NavLink>
            </li>
            {role === 'ADMIN' && (
              <li>
                <NavLink
                  to="/admin/dashboard"
                  style={{ color: '#D9A900', fontWeight: '700' }}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Admin Panel
                </NavLink>
              </li>
            )}
          </ul>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="nav-icon-btn" title="Notifications">
                🔔
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </Link>

              <Link to="/profile" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
                👤 {currentUser?.name?.split(' ')[0]}
              </Link>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Student Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
