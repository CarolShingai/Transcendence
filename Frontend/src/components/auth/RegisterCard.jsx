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

function RegisterCard({
  initials,
  registerForm,
  error,
  onRegisterChange,
  onRegisterAvatarSelect,
  onRegisterSave,
  loading
}) {
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
              const profilePic = index + 1;

              return (
                <button
                  key={avatarSrc}
                  type="button"
                  className={`avatar-option ${isSelected ? 'selected' : ''}`}
                  onClick={() =>
                    onRegisterAvatarSelect({
                      avatarUrl: avatarSrc,
                      profilePic
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
          <Form id="register-form" onSubmit={onRegisterSave} className="form-grid profile-form-layout">
            <label htmlFor="register-name">Nome</label>
            <input
              id="register-name"
              name="name"
              type="text"
              value={registerForm.name}
              onChange={onRegisterChange}
            />

            <label htmlFor="register-nickname">Codinome</label>
            <input
              id="register-nickname"
              name="nickname"
              type="text"
              value={registerForm.nickname}
              onChange={onRegisterChange}
            />

            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              name="email"
              type="email"
              value={registerForm.email}
              onChange={onRegisterChange}
              autoComplete="email"
            />

            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              name="password"
              type="password"
              value={registerForm.password}
              onChange={onRegisterChange}
              autoComplete="new-password"
            />

            <label htmlFor="register-bio">Rota pessoal</label>
            <textarea
              id="register-bio"
              name="bio"
              value={registerForm.bio}
              onChange={onRegisterChange}
              rows="4"
            />

            {error && <p className="error">{error}</p>}
          </Form>
        </div>
      </div>

      <div className="actions-row profile-save-row">
        <button type="submit" form="register-form" className="primary-button" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </div>
    </section>
  );
}

export default RegisterCard;