import React from 'react';
import Form from '../form/Form';

const avatarContext = require.context('../../assets/profile', false, /\.(png|jpe?g|webp)$/);

const AVATAR_OPTIONS = avatarContext
  .keys()
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((key) => {
    const moduleValue = avatarContext(key);
    return moduleValue?.default || moduleValue;
  });

function ProfileCard({ initials, profileForm, error, onProfileChange, onProfileSave, isLoading = false }) {
  return (
    <section className="card profile-card" aria-label="Profile screen">
      <div className="profile-headline">
        <div className="avatar" aria-hidden="true">
          {profileForm.avatarUrl ? (
            <img className="avatar-image" src={profileForm.avatarUrl} alt="Avatar selecionado" />
          ) : (
            initials
          )}
        </div>
        <div>
          <h2>Informacoes do Perfil</h2>
          <p className="support-text">Atualize as informacoes publicas do seu perfil.</p>
        </div>
      </div>

      <div className="profile-content-grid">
        <aside className="profile-avatar-column" aria-label="Selecao de avatar">
          <h3 className="avatar-column-title">Escolha seu avatar</h3>
          <div className="avatar-options" role="radiogroup" aria-label="Selecao de avatar">
            {AVATAR_OPTIONS.map((avatarSrc, index) => {
              const isSelected = profileForm.avatarUrl === avatarSrc;

              return (
                <button
                  key={avatarSrc}
                  type="button"
                  className={`avatar-option ${isSelected ? 'selected' : ''}`}
                  onClick={() =>
                    onProfileChange({
                      target: {
                        name: 'avatarUrl',
                        value: avatarSrc
                      }
                    })
                  }
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Avatar ${index + 1}`}
                >
                  <img src={avatarSrc} alt="" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </aside>

        <div className="profile-form-column">
          <Form id="profile-form" onSubmit={onProfileSave} className="form-grid profile-form-layout">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              name="name"
              type="text"
              value={profileForm.name}
              onChange={onProfileChange}
            />

            <label htmlFor="nickname">Codinome</label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={profileForm.nickname}
              onChange={onProfileChange}
            />

            <label htmlFor="profile-email">E-mail</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={profileForm.email}
              disabled
              className="input-disabled"
            />

            <label htmlFor="bio">Rota pessoal</label>
            <textarea
              id="bio"
              name="bio"
              value={profileForm.bio}
              onChange={onProfileChange}
              rows="4"
              disabled={isLoading}
            />

            <div className="checkbox-container">
              <input
                id="profile-2fa"
                name="twoFactorEnabled"
                type="checkbox"
                checked={profileForm.twoFactorEnabled || false}
                onChange={onProfileChange}
                disabled={isLoading}
              />
              <label htmlFor="profile-2fa">Ativar autenticação de dois fatores (2FA)</label>
            </div>

            {error && <p className="error">{error}</p>}
          </Form>
        </div>
      </div>

      <div className="actions-row profile-save-row">
        <button type="submit" form="profile-form" className="primary-button">
          Salvar
        </button>
      </div>
    </section>
  );
}

export default ProfileCard;
