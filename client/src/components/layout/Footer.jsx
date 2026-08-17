import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-light)',
        padding: '1.5rem 0',
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          RentMate — KITCOEK Student Marketplace
        </p>
        <p>Exclusive platform for Kolhapur Institute of Technology College of Engineering students.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#999' }}>
          © {new Date().getFullYear()} RentMate KITCOEK. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
