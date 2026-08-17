import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Panel...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'ADMIN') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>403 Forbidden</h2>
        <p>Access restricted to KITCOEK RentMate Administrators only.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
