import React from 'react';
import transLogo from '../../assets/logo/trans_logo.png';
import CircleButton from '../elements/CircleButton';

const avatarContext = require.context('../../assets/profile', false, /\.(png|jpe?g|webp)$/);
const AVATAR_OPTIONS = avatarContext
  .keys()
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((key) => {
    const moduleValue = avatarContext(key);
    return moduleValue?.default || moduleValue;
  });

function HomeHeader({ initials, profileImage, onGoToProfile, onGoToEditProfile,onLogout }) {
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

      <img className="home-header-logo header-center-item" src={transLogo} alt="Transcendence" />

      <div className="home-header-actions" aria-label="Acoes da home" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <CircleButton
          icon={(
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
          )}
          tooltip="Ver perfil público"
          title="Ver perfil público"
          onClick={onGoToProfile}
          color={{
            background: 'var(--card)',
            color: 'var(--accent)',
            borderColor: '#c3ddb7',
            hoverBackground: 'var(--card)',
            hoverColor: 'var(--accent-dark)',
            hoverBorderColor: '#a9cda0',
            shadow: '0 4px 10px rgba(11, 46, 29, 0.18)'
          }}
          size={48}
        />
        <CircleButton
          icon={(
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ width: '58%', height: '58%', display: 'block' }}>
              <path
                d="M12 8.3a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4Zm7 3.7-.9-.5a6.7 6.7 0 0 0-.6-1.4l.5-1a.7.7 0 0 0-.1-.8l-1.3-1.3a.7.7 0 0 0-.8-.1l-1 .5c-.5-.3-.9-.4-1.4-.6l-.5-.9a.7.7 0 0 0-.6-.4h-1.8a.7.7 0 0 0-.6.4l-.5.9c-.5.2-.9.3-1.4.6l-1-.5a.7.7 0 0 0-.8.1L6 8.3a.7.7 0 0 0-.1.8l.5 1c-.3.5-.4.9-.6 1.4l-.9.5a.7.7 0 0 0-.4.6v1.8a.7.7 0 0 0 .4.6l.9.5c.2.5.3.9.6 1.4l-.5 1a.7.7 0 0 0 .1.8l1.3 1.3a.7.7 0 0 0 .8.1l1-.5c.5.3.9.4 1.4.6l.5.9a.7.7 0 0 0 .6.4h1.8a.7.7 0 0 0 .6-.4l.5-.9c.5-.2.9-.3 1.4-.6l1 .5a.7.7 0 0 0 .8-.1l1.3-1.3a.7.7 0 0 0 .1-.8l-.5-1c.3-.5.4-.9.6-1.4l.9-.5a.7.7 0 0 0 .4-.6v-1.8a.7.7 0 0 0-.4-.6Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          )}
          tooltip="Editar perfil"
          title="Editar perfil"
          onClick={onGoToEditProfile}
          color={{
            background: 'var(--card)',
            color: 'var(--accent)',
            borderColor: '#c3ddb7',
            hoverBackground: 'var(--card)',
            hoverColor: 'var(--accent-dark)',
            hoverBorderColor: '#a9cda0',
            shadow: '0 4px 10px rgba(11, 46, 29, 0.18)'
          }}
          size={48}
        />
        <CircleButton
          icon="✕"
          tooltip="Sair"
          title="Sair"
          onClick={onLogout}
          color={{
            background: '#d42929',
            color: '#ffffff',
            borderColor: '#b91c1c',
            hoverBackground: '#c72222',
            hoverColor: '#ffffff',
            hoverBorderColor: '#991b1b'
          }}
          size={48}
        />
      </div>
    </header>
  );
}

export default HomeHeader;
