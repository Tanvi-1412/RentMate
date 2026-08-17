import React from 'react';

const Badge = ({ type, text }) => {
  let className = 'badge';
  let displayText = text || type;

  if (type === 'COMPLETED' || type === 'UNAVAILABLE' || type === 'SOLD_OUT') {
    className += ' badge-completed';
    displayText = text || '🏷️ SOLD OUT';
  } else {
    switch (type) {
      case 'SELL':
        className += ' badge-sell';
        break;
      case 'RENT':
        className += ' badge-rent';
        break;
      case 'AVAILABLE':
        className += ' badge-available';
        break;
      case 'PENDING':
        className += ' badge-pending';
        break;
      default:
        className += ' badge-sell';
    }
  }

  return <span className={className}>{displayText}</span>;
};

export default Badge;
