import React from 'react';
import Form from '../form/Form';

function LoginCard({ loginForm, error, onLoginChange, onLogin, onGoogleLogin, onCreateAccount, isLoading = false }) {
  return (
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
  );
}

export default LoginCard;
