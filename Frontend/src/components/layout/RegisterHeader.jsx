import React from 'react';

function RegisterHeader({ onGoToLogin }) {
  return (
    <header className="App-header App-header-home App-header-edit">
      <h1 className="edit-header-title">Cadastre-se na sua conta!</h1>

      <div className="home-header-actions" aria-label="Acoes do cadastro">
        <button
          type="button"
          className="header-icon-button header-icon-button-exit"
          onClick={onGoToLogin}
          aria-label="Voltar para login"
          title="Voltar para login"
        >
          ✕
        </button>
      </div>
    </header>
  );
}

export default RegisterHeader;
