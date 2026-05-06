import React from 'react';
import Form from '../form/Form';

function LoginCard({
  loginForm,
  error,
  requiresTwoFactor,
  twoFactorCode,
  twoFactorQrCode,
  onLoginChange,
  onTwoFactorCodeChange,
  onLogin,
  onVerifyTwoFactor,
  onCloseTwoFactorPopup,
  onGoogleLogin,
  onCreateAccount,
  isLoading = false
}) {
  return (
    <>
      <section className="card" aria-label="Login screen">
        <Form id="login-form" onSubmit={onLogin}>
        <label htmlFor="email">Login</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="seu-nome@ninho.com"
          value={loginForm.email}
          onChange={onLoginChange}
          autoComplete="email"
          disabled={isLoading}
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          value={loginForm.password}
          onChange={onLoginChange}
          autoComplete="current-password"
          disabled={isLoading}
        />

          {error && <p className="error">{error}</p>}
        </Form>

        <button type="submit" form="login-form" className="primary-button form-submit" disabled={isLoading}>
          {isLoading ? 'Conectando...' : 'Acessar'}
        </button>

        <button type="button" className="google-button" onClick={onGoogleLogin} disabled={isLoading}>
          <span className="google-icon" aria-hidden="true">G</span>
          Continuar com Google
        </button>

        <button type="button" className="text-link" onClick={onCreateAccount} disabled={isLoading}>
          Crie sua conta agora!
        </button>
      </section>

      {requiresTwoFactor && (
        <div className="twofactor-modal-overlay" role="dialog" aria-modal="true" aria-label="Verificação 2FA">
          <div className="twofactor-modal-card">
            <h3>Autenticação de dois fatores</h3>
            <p className="support-text">Leia o QR Code no seu app autenticador e digite o código para entrar.</p>

            {twoFactorQrCode ? (
              <img className="twofactor-login-qr" src={twoFactorQrCode} alt="QR Code de autenticação 2FA" />
            ) : (
              <p className="support-text">QR Code indisponível no momento.</p>
            )}

            <label htmlFor="login-twofactor-code">Código 2FA</label>
            <input
              id="login-twofactor-code"
              name="twoFactorCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Digite o código do autenticador"
              value={twoFactorCode}
              onChange={onTwoFactorCodeChange}
              disabled={isLoading}
            />

            <div className="twofactor-modal-actions">
              <button type="button" className="primary-button" onClick={onVerifyTwoFactor} disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Validar e entrar'}
              </button>
              <button type="button" className="ghost-button" onClick={onCloseTwoFactorPopup} disabled={isLoading}>
                Cancelar
              </button>
            </div>

            {error && <p className="error">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default LoginCard;
