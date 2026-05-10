import React from 'react';

function AppFooter({ onGoToPrivacyPolicy, onGoToTermsOfUse, isAuthenticated }) {
  return (
    <footer className="App-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p>Equipe TRANSCENDENCE: Bárbara, Carol, Luana e Thiago -- Todos os direitos reservados! </p>
      {isAuthenticated &&
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onGoToPrivacyPolicy}
          style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}
        >
          Política de Privacidade
        </button>
        <button
          type="button"
          onClick={onGoToTermsOfUse}
          style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}
        >
          Termos de Uso
        </button>
      </div>}
    </footer>
  );
}

export default AppFooter;
