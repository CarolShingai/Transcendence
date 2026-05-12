import React from 'react';

function PublicProfileHeader({ initials, profileImage, name, nickname, onClose }) {
  const resolveAvatarUrl = (avatarValue) => {
    if (!avatarValue) return '';
    if (typeof avatarValue === 'string') return avatarValue;
    if (typeof avatarValue === 'object' && avatarValue?.default) return avatarValue.default;
    return '';
  };

  const avatarSrc = resolveAvatarUrl(profileImage);

  return (
    <header
      className="App-header App-header-profile"
      aria-label="Perfil público do usuário"
      style={{ position: 'relative' }}
    >
      <div className="header-user-slot public-profile-avatar-slot" aria-label="Imagem do usuário">
        {avatarSrc ? (
          <img className="header-user-image" src={avatarSrc} alt="Foto do usuário" />
        ) : (
          <span className="header-user-fallback" aria-hidden="true">
            {initials}
          </span>
        )}
      </div>

      <div
        className="public-profile-summary header-center-item"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <h1
          className="public-profile-name"
          style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}
        >
          <span
            className="public-profile-label"
            style={{ fontWeight: 700, marginRight: '0.25rem', fontSize: '0.95rem' }}
          >
            NOME:
          </span>
          {name || 'Usuário'}
        </h1>

        <span
          className="public-profile-separator"
          aria-hidden="true"
          style={{
            display: 'inline-block',
            alignSelf: 'center',
            height: '1.25rem',
            borderLeft: '1px solid rgba(0,0,0,0.2)',
            margin: '0 0.5rem',
          }}
        />

        <p
          className="public-profile-nickname"
          style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}
        >
          <span
            className="public-profile-label"
            style={{ fontWeight: 700, marginRight: '0.25rem', fontSize: '0.95rem' }}
          >
            NICKNAME:
          </span>
          @{nickname || 'nickname'}
        </p>
      </div>

      <button
        type="button"
        className="public-profile-close-button"
        onClick={onClose}
        aria-label="Fechar perfil público"
        title="Fechar"
        style={{ marginTop: '-0.8rem' }}
      >
        Fechar
      </button>
    </header>
  );
}

export default PublicProfileHeader;