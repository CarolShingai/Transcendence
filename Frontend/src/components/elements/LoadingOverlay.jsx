import React from 'react';

function LoadingOverlay({ show }) {
  if (!show) return null;

  const backdrop = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    zIndex: 1500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const box = {
    background: '#fff',
    padding: '12px 18px',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  };

  const spinner = {
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: '3px solid #ddd',
    borderTopColor: '#333',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div style={backdrop} aria-hidden="false">
      <div style={box} role="status" aria-live="polite">
        <div style={spinner} />
        <div>Carregando...</div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default LoadingOverlay;
