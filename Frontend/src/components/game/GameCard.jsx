import React, { useEffect, useMemo, useState } from 'react';
import singleTrans from '../../assets/logo/SINGLE_TRANS.png';
import rankedTrans from '../../assets/logo/RANKED_TRANS.png';

function GameCard({ gameEndpoint = '/game', onExitGame, footerLabel = 'Partida em andamento', gameOrigin = null }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  return (
    <section className="game-card" aria-label="Tela do jogo">
      <iframe
        className="game-card-frame"
        src={gameEndpoint}
        title="Game endpoint"
        aria-label="Jogo"
      />

      <header className="game-card-header" aria-label="Barra superior do jogo">
        {gameOrigin === 'single' && (
          <img src={singleTrans} alt="Single" className="game-card-header-img-left" />
        )}
        {gameOrigin === 'ranked' && (
          <img src={rankedTrans} alt="Ranked" className="game-card-header-img-left" />
        )}
        <div className="game-card-timer-box" aria-live="polite">
          <div className="game-card-timer">{formattedTime}</div>
        </div>
        <button
          type="button"
          className="header-icon-button header-icon-button-exit game-card-exit"
          onClick={onExitGame}
          aria-label="Fechar jogo"
          title="Fechar jogo"
        >
          ✕
        </button>
      </header>
    </section>
  );
}

export default GameCard;
