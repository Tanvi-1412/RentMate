import React from 'react';

const LoadingSpinner = ({ text = 'Loading marketplace...', size = 80, fullScreen = false }) => {
  const spinnerContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        gap: '1rem',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer Glowing Spinning Gradient Ring */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            animation: 'rentmateSpin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        >
          <defs>
            <linearGradient id="rentmateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="60%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--border-medium, #E5E7EB)"
            strokeWidth="7"
            opacity="0.3"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#rentmateGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="264"
            strokeDashoffset="70"
          />
        </svg>

        {/* Center Pulsing Icon */}
        <span
          style={{
            fontSize: `${size * 0.35}px`,
            animation: 'rentmatePulse 1.4s ease-in-out infinite alternate',
            zIndex: 1,
            userSelect: 'none',
          }}
        >
          📦
        </span>
      </div>

      {text && (
        <span
          style={{
            fontSize: '0.925rem',
            fontWeight: '600',
            color: 'var(--text-secondary, #4B5563)',
            letterSpacing: '0.01em',
          }}
        >
          {text}
        </span>
      )}

      {/* Inline Animation Keyframes */}
      <style>{`
        @keyframes rentmateSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rentmatePulse {
          0% { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
