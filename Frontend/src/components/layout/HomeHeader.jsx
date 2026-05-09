import React from 'react';
import transLogo from '../../assets/logo/trans_logo.png';

const avatarContext = require.context('../../assets/profile', false, /\.(png|jpe?g|webp)$/);
const AVATAR_OPTIONS = avatarContext
  .keys()
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((key) => {
    const moduleValue = avatarContext(key);
    return moduleValue?.default || moduleValue;
  });

function HomeHeader({ initials, profileImage, onGoToProfile, onLogout }) {
  const resolveAvatarUrl = (avatarValue) => {
    if (!avatarValue) return '';
    if (typeof avatarValue === 'string') return avatarValue;
    if (typeof avatarValue === 'object' && avatarValue?.default) return avatarValue.default;
    return '';
  };

  const resolveAvatarFromProfilePic = (profilePic) => {
    const numericPic = Number(profilePic);
    if (!Number.isInteger(numericPic) || numericPic < 1 || numericPic > AVATAR_OPTIONS.length) return '';
    return AVATAR_OPTIONS[numericPic - 1] || '';
  };

  let avatarSrc = '';
  if (profileImage) {
    avatarSrc = resolveAvatarUrl(profileImage) || resolveAvatarFromProfilePic(profileImage);
  }

  return (
    <header className="App-header App-header-home">
      <div className="header-user-slot" aria-label="Imagem do usuario">
        {avatarSrc ? (
          <img className="header-user-image" src={avatarSrc} alt="Foto do usuario" />
        ) : (
          <span className="header-user-fallback" aria-hidden="true">{initials}</span>
        )}
      </div>

      <img className="home-header-logo" src={transLogo} alt="Transcendence" />

      <div className="home-header-actions" aria-label="Acoes da home">
        <button
          type="button"
          className="header-icon-button header-icon-button-view"
          onClick={onGoToProfile}
          aria-label="Ver perfil público"
          title="Ver perfil público"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="header-view-icon">
            <path
              d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="2.75"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
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
