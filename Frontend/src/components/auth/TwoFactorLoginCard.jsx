import React from 'react';
import Form from '../form/Form';

function TwoFactorLoginCard({ code, error, onCodeChange, onVerify, onBackToLogin, loading }) {
  return (
    <section className="card" aria-label="Two-factor authentication screen">
      <Form id="two-factor-login-form" onSubmit={onVerify}>
        <h2>Verificacao em duas etapas</h2>
        <p className="support-text">Digite o codigo de 6 digitos do seu app autenticador.</p>

        <label htmlFor="two-factor-login-code">Codigo do app autenticador</label>
        <input
          id="two-factor-login-code"
          name="twoFactorLoginCode"
          type="text"
          inputMode="numeric"
          placeholder="123456"
          value={code}
          onChange={onCodeChange}
          autoComplete="one-time-code"
        />

        {error && <p className="error">{error}</p>}
      </Form>

      <button type="submit" form="two-factor-login-form" className="primary-button form-submit" disabled={loading}>
        {loading ? 'Verificando...' : 'Verificar codigo'}
      </button>

      <button type="button" className="text-link" onClick={onBackToLogin} disabled={loading}>
        Voltar ao login
      </button>
    </section>
  );
}

export default TwoFactorLoginCard;
