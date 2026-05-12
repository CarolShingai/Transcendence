import React from 'react';
import transLogo from '../../assets/logo/trans_logo.png';

function EditHeader({ onGoToHome, onLogout }) {
  return (
    <header className="App-header App-header-home App-header-edit">
      <h1 className="edit-header-title">Editar perfil!</h1>

      <img className="home-header-logo edit-header-logo" src={transLogo} alt="Transcendence" />

      <div className="home-header-actions" aria-label="Acoes da edicao">
        <button
          type="button"
          className="header-icon-button header-icon-button-back"
          onClick={onGoToHome}
          aria-label="Voltar para home"
          title="Voltar para home"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="header-back-icon">
            <path
              d="M14 6 8 12l6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="header-icon-button header-icon-button-exit"
          onClick={onLogout}
          aria-label="Sair"
          title="Sair"
        >
          ✕
        </button>
      </div>
    </header>
  );
}

export default EditHeader;
