import React from 'react';
import passaro00 from '../../assets/login/passaro_00-removebg.png';

function EditHeader({ onGoToLogin }) {
  return (
    <header className="App-header">
      <div className="hero-copy">
        <img className="birds" src={passaro00} alt="Passaro guia" />
        <h1>NINHO DO VIAJANTE</h1>
        <p className="hero-subtitle">Edite seu perfil e mantenha sua rota pronta</p>
      </div>
      <nav className="top-nav" aria-label="Main navigation">
        <button type="button" className="nav-button" onClick={onGoToLogin}>
          Observador
        </button>
        <button type="button" className="nav-button active" disabled>
          Ninho
        </button>
      </nav>
    </header>
  );
}

export default EditHeader;
