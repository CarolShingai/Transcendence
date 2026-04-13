import React from 'react';
import passaro00 from '../../assets/login/passaro_00-removebg.png';
import passaro01 from '../../assets/login/passaro_01-removebg.png';
import passaro02 from '../../assets/login/passaro_02-removebg.png';

function LoginHeader() {
  return (
    <header className="App-header App-header-login">
      <div className="hero-copy hero-copy-login">
        <div className="birds-row" aria-hidden="true">
          <img className="birds" src={passaro00} alt="" />
          <img className="birds" src={passaro01} alt="" />
          <img className="birds" src={passaro02} alt="" />
        </div>
        <h1>ROTA MIGRATORIA</h1>
        <p className="hero-subtitle">Acesse para iniciar a jornada</p>
      </div>
    </header>
  );
}

export default LoginHeader;
