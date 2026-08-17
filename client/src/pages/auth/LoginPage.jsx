import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { formatApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusAlert from '../../components/common/StatusAlert';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusInfo, setStatusInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusInfo(null);
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        navigate('/home');
      }
    } catch (err) {
      setStatusInfo(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto' }} className="card">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: '800' }}>
          Welcome to RENT<span style={{ color: 'var(--primary-dark)' }}>MATE</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          KITCOEK Exclusive Student Marketplace
        </p>
      </div>

      {statusInfo && (
        <StatusAlert
          status={statusInfo.status}
          title={statusInfo.title}
          description={statusInfo.description}
          onClose={() => setStatusInfo(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            required
            className="form-input"
            placeholder="student@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            required
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        New KITCOEK Student?{' '}
        <Link to="/signup" style={{ color: 'var(--text-main)', fontWeight: '700' }}>
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
