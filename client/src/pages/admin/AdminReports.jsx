import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await API.get('/admin/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id, status) => {
    const adminNote = prompt('Enter resolution note (optional):');
    try {
      await API.patch(`/admin/reports/${id}`, { status, adminNote });
      fetchReports();
    } catch (err) {
      alert('Error resolving report');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Reports & Safety Moderation</h1>
          <p className="page-subtitle">Handle student flags for fake listings or inappropriate conduct</p>
        </div>
      </div>

      {loading ? (
        <div>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No reports submitted</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((r) => (
            <div key={r._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>
                  Type: {r.targetType} • Reason: {r.reason}
                </strong>
                <span className={`badge ${r.status === 'OPEN' ? 'badge-pending' : 'badge-completed'}`}>
                  {r.status}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Reported by: {r.reporterId?.name} ({r.reporterId?.email})
              </p>
              {r.adminNote && (
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                  Admin Note: {r.adminNote}
                </p>
              )}
              {r.status === 'OPEN' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => handleResolve(r._id, 'RESOLVED')} className="btn btn-primary btn-sm">
                    Mark Resolved
                  </button>
                  <button onClick={() => handleResolve(r._id, 'DISMISSED')} className="btn btn-secondary btn-sm">
                    Dismiss Report
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
