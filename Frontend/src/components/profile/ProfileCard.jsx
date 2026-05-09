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

function ProfileCard({
  initials,
  profileForm,
  error,
  onProfileChange,
  onProfileSave,
  onProfileAvatarSelect,
  twoFactorSetup,
  twoFactorCode,
  twoFactorMessage,
  onTwoFactorCodeChange,
  onTwoFactorSetup,
  onTwoFactorEnable,
  loading
}) {
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
              const profilePic = index + 1;

              return (
                <button
                  key={avatarSrc}
                  type="button"
                  className={`avatar-option ${isSelected ? 'selected' : ''}`}
                  onClick={() =>
                    onProfileAvatarSelect
                      ? onProfileAvatarSelect({ avatarUrl: avatarSrc, profilePic })
                      : onProfileChange({ target: { name: 'avatarUrl', value: avatarSrc } })
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
            />

            <div className="two-factor-panel">
              <h3>Autenticacao de dois fatores</h3>
              {profileForm.twoFactorEnabled ? (
                <p className="success-message">2FA ativado. O login por senha vai pedir o codigo do app autenticador.</p>
              ) : (
                <>
                  <p className="support-text">Ative o 2FA para proteger sua conta com um app autenticador.</p>
                  <button type="button" className="secondary-button" onClick={onTwoFactorSetup} disabled={loading}>
                    Ativar autenticacao de dois fatores
                  </button>
                </>
              )}

              {!profileForm.twoFactorEnabled && twoFactorSetup && (
                <div className="two-factor-setup">
                  <img
                    className="two-factor-qr"
                    src={`data:image/png;base64,${twoFactorSetup.qrCodeUrl}`}
                    alt="QR Code para autenticacao de dois fatores"
                  />
                  <p className="support-text">Escaneie o QR Code ou insira este codigo manualmente:</p>
                  <code className="two-factor-secret">{twoFactorSetup.tempSecret}</code>
                  <label htmlFor="two-factor-code">Codigo do app autenticador</label>
                  <input
                    id="two-factor-code"
                    name="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    value={twoFactorCode}
                    onChange={onTwoFactorCodeChange}
                    placeholder="123456"
                    autoComplete="one-time-code"
                  />
                  <button type="button" className="primary-button" onClick={onTwoFactorEnable} disabled={loading}>
                    Confirmar 2FA
                  </button>
                </div>
              )}

              {twoFactorMessage && <p className="status-message">{twoFactorMessage}</p>}
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
