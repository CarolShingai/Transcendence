import React from 'react';

function HomeGameCard({ title, image, imageAlt, matches = [], onPlayGame, gameType }) {
  return (
    <div className="card home-carousel-item-card has-footer-layout" aria-hidden="true">
      <header className="home-card-header" aria-hidden="true">
        <img src={image} alt={imageAlt} className="home-card-header-img" />
        <div className="home-card-record">
          <div className="home-card-record-label">RECORD:</div>
          <div className="home-card-record-time">00:00</div>
        </div>
      </header>

      <div className="home-card-history-label">HISTÓRICO</div>
      <div className="home-card-history-divider" />

      <div className="home-card-matches-list">
        {matches.length === 0 ? (
          <div className="home-card-empty-state">
            <p>Nenhuma partida registrada!</p>
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.id} className="home-card-match-item">
              <span className="home-card-match-date">{match.date}</span>
              <span className="home-card-match-time">{match.time}</span>
            </div>
          ))
        )}
      </div>

      <div className="home-card-body" />

      <footer className="home-card-footer" aria-hidden="true">
        <button
          type="button"
          className="home-card-add-friend-button footer-play-button"
          onClick={() => onPlayGame(gameType)}
        >
          <span className="play-icon">▶</span>
          JOGUE AGORA!
        </button>
      </footer>
    </div>
  );
}

export default HomeGameCard;