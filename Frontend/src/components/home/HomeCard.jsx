import React, { useState } from 'react';
import singleTrans from '../../assets/logo/SINGLE_TRANS.png';
import rankedTrans from '../../assets/logo/RANKED_TRANS.png';
import amigosTrans from '../../assets/logo/trans_amigos1.png';

const EMPTY_CARDS = [{ id: 1 }, { id: 2 }, { id: 3 }];

function HomeCard({ matches = [], friends = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((previous) => (previous === 0 ? EMPTY_CARDS.length - 1 : previous - 1));
  };

  const goToNext = () => {
    setCurrentIndex((previous) => (previous === EMPTY_CARDS.length - 1 ? 0 : previous + 1));
  };

  return (
    <section className="home-card home-carousel-card" aria-label="Home screen">

      <div className="home-carousel" aria-label="Carrossel de cards">
        <button
          type="button"
          className="carousel-arrow carousel-arrow-left"
          onClick={goToPrevious}
          aria-label="Card anterior"
        >
          ‹
        </button>

        <div className="carousel-stage">
          {EMPTY_CARDS.map((card, index) => {
            const normalizedDistance = (index - currentIndex + EMPTY_CARDS.length) % EMPTY_CARDS.length;
            const positionClass =
              normalizedDistance === 0
                ? 'is-center'
                : normalizedDistance === 1
                  ? 'is-right'
                  : 'is-left';

            return (
              <article key={card.id} className={`carousel-item ${positionClass}`}>
                <div
                  className="card home-carousel-item-card has-footer-layout"
                  aria-hidden="true"
                >
                  <header className="home-card-header" aria-hidden="true">
                    {index === 0 && (
                      <img
                        src={singleTrans}
                        alt="Single player"
                        className="home-card-header-img"
                      />
                    )}
                    {index === 1 && (
                      <img
                        src={rankedTrans}
                        alt="Ranked"
                        className="home-card-header-img"
                      />
                    )}
                    {index === 2 && (
                      <img
                        src={amigosTrans}
                        alt="Amigos"
                        className="home-card-header-img home-card-header-img-center"
                      />
                    )}
                    {(index === 0 || index === 1) && (
                      <div className="home-card-record">
                        <div className="home-card-record-label">RECORD:</div>
                        <div className="home-card-record-time">00:00</div>
                      </div>
                    )}
                  </header>
                  {(index === 0 || index === 1) && (
                    <>
                      <div className="home-card-history-label">HISTÓRICO</div>
                      <div className="home-card-history-divider" />
                    </>
                  )}
                  {(index === 0 || index === 1) && (
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
                  )}
                  <div className={`home-card-body ${index === 2 ? 'home-card-body-friends' : ''}`}>
                    {index === 2 && (
                      <div className="friends-panel" aria-label="Lista de amigos">
                        {friends.length === 0 ? (
                          <div className="friends-empty-state">
                            <p>Nenhum amigo registrado!</p>
                          </div>
                        ) : (
                          <div className="friends-list">
                            {friends.map((friend) => {
                              const initials = friend.name
                                .split(' ')
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((token) => token[0].toUpperCase())
                                .join('');

                              return (
                                <article key={friend.id} className="friend-item">
                                  <div className="friend-avatar" aria-hidden="true">
                                    {initials}
                                  </div>
                                  <div className="friend-info">
                                    <div className="friend-name">{friend.name}</div>
                                    <div className="friend-nickname">@{friend.nickname}</div>
                                  </div>
                                  <div className={`friend-status friend-status-${friend.status.toLowerCase()}`}>
                                    {friend.status}
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <footer className="home-card-footer" aria-hidden="true">
                    {(index === 0 || index === 1) && (
                      <button className="home-card-add-friend-button footer-play-button">
                        <span className="play-icon">▶</span>
                        JOGUE AGORA!
                      </button>
                    )}
                    {index === 2 && (
                      <button className="home-card-add-friend-button">+ Adicionar amigos</button>
                    )}
                  </footer>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="carousel-arrow carousel-arrow-right"
          onClick={goToNext}
          aria-label="Proximo card"
        >
          ›
        </button>
      </div>

      <div className="carousel-dots" aria-hidden="true">
        {EMPTY_CARDS.map((card, index) => (
          <span
            key={card.id}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HomeCard;
