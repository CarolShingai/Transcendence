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

function RegisterCard({ initials, registerForm, error, onRegisterChange, onRegisterSave, isLoading = false }) {
  return (
    <section className="card profile-card" aria-label="Cadastro de conta">
      <div className="profile-headline">
        <div className="avatar" aria-hidden="true">
          {registerForm.avatarUrl ? (
            <img className="avatar-image" src={registerForm.avatarUrl} alt="Avatar selecionado" />
          ) : (
            initials
          )}
        </div>
        <div>
          <h2>Cadastre-se</h2>
          <p className="support-text">Preencha suas informacoes para criar a conta.</p>
        </div>
      </div>

      <div className="profile-content-grid">
        <aside className="profile-avatar-column" aria-label="Selecao de avatar">
          <h3 className="avatar-column-title">Escolha seu avatar</h3>
          <div className="avatar-options" role="radiogroup" aria-label="Selecao de avatar">
            {AVATAR_OPTIONS.map((avatarSrc, index) => {
              const isSelected = registerForm.avatarUrl === avatarSrc;

              return (
                <button
                  key={avatarSrc}
                  type="button"
                  className={`avatar-option ${isSelected ? 'selected' : ''}`}
                  onClick={() =>
                    onRegisterChange({
                      target: {
                        name: 'avatarUrl',
                        value: avatarSrc
                      }
                    })
                  }
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Avatar ${index + 1}`}
                  disabled={isLoading}
                >
                  <img src={avatarSrc} alt="" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </aside>

        <div className="profile-form-column">
          <Form id="register-form" onSubmit={onRegisterSave} className="form-grid profile-form-layout">
            <label htmlFor="register-name">Nome</label>
            <input
              id="register-name"
              name="name"
              type="text"
              value={registerForm.name}
              onChange={onRegisterChange}
              disabled={isLoading}
            />

            <label htmlFor="register-nickname">Codinome</label>
            <input
              id="register-nickname"
              name="nickname"
              type="text"
              value={registerForm.nickname}
              onChange={onRegisterChange}
              disabled={isLoading}
            />

            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              name="email"
              type="email"
              value={registerForm.email}
              onChange={onRegisterChange}
              autoComplete="email"
              disabled={isLoading}
            />

            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={registerForm.password || ''}
              onChange={onRegisterChange}
              autoComplete="new-password"
              disabled={isLoading}
            />

            <label htmlFor="register-bio">Rota pessoal</label>
            <textarea
              id="register-bio"
              name="bio"
              value={registerForm.bio}
              onChange={onRegisterChange}
              rows="4"
              disabled={isLoading}
            />

            <div className="checkbox-container">
              <input
                id="register-2fa"
                name="twoFactorEnabled"
                type="checkbox"
                checked={registerForm.twoFactorEnabled || false}
                onChange={onRegisterChange}
                disabled={isLoading}
              />
              <label htmlFor="register-2fa">Ativar autenticação de dois fatores (2FA)</label>
            </div>

            {error && <p className="error">{error}</p>}
          </Form>
        </div>
      </div>

      <div className="actions-row profile-save-row">
        <button type="submit" form="register-form" className="primary-button" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </div>
    </section>
  );
}

export default RegisterCard;