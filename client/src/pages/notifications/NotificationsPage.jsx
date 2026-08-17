import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

const NotificationsPage = () => {
  const { notifications, markRead, markAllRead } = useNotifications();

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Real-time alerts for requests, chat messages, and updates</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary btn-sm">
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You have no notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              className="card"
              onClick={() => !n.isRead && markRead(n._id)}
              style={{
                backgroundColor: n.isRead ? '#FFFFFF' : 'var(--primary-light)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{n.title}</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(n.createdAt)}
                </span>
              </div>
              {!n.isRead && (
                <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                  New
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
