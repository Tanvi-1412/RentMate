import React from 'react';

const StatusAlert = ({ status = 400, title, description, onClose }) => {
  if (!description) return null;

  const isSuccess = status >= 200 && status < 300;
  const isWarning = status >= 400 && status < 500;

  const bgColor = isSuccess ? '#F0FDF4' : isWarning ? '#FFFBEB' : '#FEF2F2';
  const borderColor = isSuccess ? '#BBF7D0' : isWarning ? '#FDE68A' : '#FCA5A5';
  const textColor = isSuccess ? '#166534' : isWarning ? '#92400E' : '#991B1B';
  const icon = isSuccess ? '✅' : isWarning ? '⚠️' : '❌';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <strong style={{ fontSize: '0.95rem', fontWeight: '700' }}>
              {title || (isSuccess ? 'Success' : `Status ${status}`)}
            </strong>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.45, opacity: 0.95 }}>{description}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: textColor,
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0 0.25rem',
            lineHeight: 1,
            opacity: 0.7,
          }}
          title="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default StatusAlert;
