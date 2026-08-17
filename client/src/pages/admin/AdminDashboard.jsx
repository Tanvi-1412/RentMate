import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then((res) => {
      if (res.data.success) {
        setStats(res.data.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading Admin Statistics...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Moderation Dashboard</h1>
          <p className="page-subtitle">Full ecosystem control for KITCOEK RentMate</p>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/admin/dashboard" className="btn btn-primary btn-sm">
          📊 Stats Overview
        </Link>
        <Link to="/admin/users" className="btn btn-secondary btn-sm">
          👥 User Management
        </Link>
        <Link to="/admin/products" className="btn btn-secondary btn-sm">
          📦 Product Moderation
        </Link>
        <Link to="/admin/reports" className="btn btn-secondary btn-sm">
          🚩 User Reports
        </Link>
        <Link to="/admin/categories" className="btn btn-secondary btn-sm">
          🏷️ Categories
        </Link>
        <Link to="/admin/activity-logs" className="btn btn-secondary btn-sm">
          📜 Activity Logs
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Students</h3>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0' }}>
            {stats?.users?.total || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
            {stats?.users?.active || 0} Active • {stats?.users?.pending || 0} Pending ID
          </span>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Product Listings</h3>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0' }}>
            {stats?.products?.total || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--info)' }}>
            {stats?.products?.active || 0} Available
          </span>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Completed Exchanges</h3>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.25rem 0' }}>
            {stats?.requests?.completed || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {stats?.requests?.pending || 0} Pending Requests
          </span>
        </div>

        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--danger)' }}>Open Flagged Reports</h3>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--danger)', margin: '0.25rem 0' }}>
            {stats?.reports?.open || 0}
          </div>
          <Link to="/admin/reports" style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: '700' }}>
            Resolve Reports →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
