import React from 'react';
import transLogo from '../../assets/logo/trans_logo.png';

function LoginHeader() {
  return (
    <header className="App-header App-header-login">
      <div className="hero-copy hero-copy-login">
        <div className="birds-row" aria-hidden="true">
          <img className="trans-logo" src={transLogo} alt="Trans logo" />
        </div>
        <p className="hero-subtitle">Acesse para iniciar a jornada</p>
      </div>
    </header>
  );
}

export default LoginHeader;
