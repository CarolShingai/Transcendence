import React from 'react';

function EditHeader({ onGoToHome, onLogout }) {
  return (
    <header className="App-header App-header-home App-header-edit">
      <h1 className="edit-header-title">Edite suas informacoes e imagem do perfil!</h1>

      <div className="home-header-actions" aria-label="Acoes da edicao">
        <button
          type="button"
          className="header-icon-button header-icon-button-edit"
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
