import React from 'react';

function GameCard({ gameEndpoint = '/game', onExitGame, footerLabel = 'Partida em andamento', gameOrigin = null }) {
  return (
    <section className="game-card" aria-label="Tela do jogo" style={{ position: 'relative' }}>
      <iframe
        className="game-card-frame"
        src={gameEndpoint}
        title="Game endpoint"
        aria-label="Jogo"
      />

      <button
        type="button"
        className="header-icon-button header-icon-button-exit game-card-exit"
        onClick={onExitGame}
        aria-label="Fechar jogo"
        title="Fechar jogo"
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          zIndex: 10,
          borderRadius: '50%',
          width: '2.5rem',
          height: '2.5rem',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }}
      >
        ✕
      </button>
    </section>
  );
}

export default GameCard;
