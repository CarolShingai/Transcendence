import React from 'react';

function StatusBanner({ message, type = 'error', onClose }) {
  if (!message) return null;

  const styles = {
    container: {
      position: 'fixed',
      top: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'error' ? '#ffe6e6' : '#fff4cc',
      color: '#111',
      border: type === 'error' ? '1px solid #ffb3b3' : '1px solid #ffecb3',
      padding: '10px 16px',
      borderRadius: 6,
      zIndex: 2000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      maxWidth: '90%'
    },
    message: { flex: 1, fontSize: 14 },
    close: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: 16,
      lineHeight: 1
    }
  };

  return (
    <div style={styles.container} role="alert" aria-live="assertive">
      <div style={styles.message}>{message}</div>
      {onClose && (
        <button aria-label="Fechar" style={styles.close} onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}

export default StatusBanner;
