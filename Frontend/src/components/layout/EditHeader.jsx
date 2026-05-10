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
          className=""
          onClick={onGoToHome}
          aria-label="Ir para home"
          title="Ir para home"
        >
          🏠
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
