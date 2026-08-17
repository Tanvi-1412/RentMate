import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatDate } from '../../utils/formatters';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/activity-logs').then((res) => {
      if (res.data.success) {
        setLogs(res.data.data.logs);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Activity Audit Logs</h1>
          <p className="page-subtitle">Security audit logging for accountability</p>
        </div>
      </div>

      {loading ? (
        <div>Loading activity logs...</div>
      ) : (
        <div style={{ overflowX: 'auto' }} className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem' }}>Actor</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
                <th style={{ padding: '0.75rem' }}>Target Type</th>
                <th style={{ padding: '0.75rem' }}>IP Address</th>
                <th style={{ padding: '0.75rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{l.actorId?.name || 'System'}</strong> ({l.actorId?.role})
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: '600' }}>
                    {l.action}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{l.targetType || 'N/A'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{l.ipAddress || '127.0.0.1'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {formatDate(l.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogs;
