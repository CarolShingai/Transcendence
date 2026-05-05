import React from 'react';
import transLogo from '../../assets/logo/trans_logo.png';

function HomeHeader({ initials, profileImage, onGoToProfile, onLogout }) {
  return (
    <header className="App-header App-header-home">
      <div className="header-user-slot" aria-label="Imagem do usuario">
        {profileImage ? (
          <img className="header-user-image" src={profileImage} alt="Foto do usuario" />
        ) : (
          <span className="header-user-fallback" aria-hidden="true">{initials}</span>
        )}
      </div>

      <img className="home-header-logo" src={transLogo} alt="Transcendence" />

      <div className="home-header-actions" aria-label="Acoes da home">
        <button
          type="button"
          className="header-icon-button header-icon-button-edit"
          onClick={onGoToProfile}
          aria-label="Editar perfil"
          title="Editar perfil"
        >
          ⚙
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

export default HomeHeader;
