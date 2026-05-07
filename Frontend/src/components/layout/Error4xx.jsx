import React from 'react';
import transLogo from '../../assets/logo/trans_logo.png';
import AppFooter from './AppFooter';

function Error4xx({ code = 404, message = 'Página não encontrada', onHome }) {
  return (
    <div className="error-page error-page-4xx">
      <header className="error-header">
        <img src={transLogo} alt="Transcendence" className="error-logo" />
      </header>

      <main className="error-body">
        <div className="error-box">
          <h1>{code}</h1>
          <h2>{message}</h2>
          <p>Desculpe, a página solicitada não foi encontrada ou ocorreu alguma inconsistência.</p>
          <div className="error-actions">
            <button className="primary-button" onClick={onHome}>Voltar ao Início</button>
          </div>
        </div>
      </main>

      <AppFooter />
      <style>{`
        .error-page { display:flex; min-height:100vh; flex-direction:column; }
        .error-body { flex:1; display:flex; align-items:center; justify-content:center; }
        .error-box { text-align:center; max-width:560px; padding:24px; }
        .error-box h1 { font-size:72px; margin:0; }
        .error-box h2 { font-size:22px; margin:8px 0 16px; }
      `}</style>
    </div>
  );
}

export default Error4xx;
