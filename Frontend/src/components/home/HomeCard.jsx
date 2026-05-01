import React, { useState } from 'react';
import singleTrans from '../../assets/logo/SINGLE_TRANS.png';
import rankedTrans from '../../assets/logo/RANKED_TRANS.png';

const EMPTY_CARDS = [{ id: 1 }, { id: 2 }, { id: 3 }];

const MOCK_MATCHES = [
  { id: 1, date: '2024-04-30', time: '12:34' },
  { id: 2, date: '2024-04-29', time: '08:45' },
  { id: 3, date: '2024-04-28', time: '15:22' },
  { id: 4, date: '2024-04-27', time: '09:11' },
  { id: 5, date: '2024-04-26', time: '22:33' },
  { id: 6, date: '2024-04-25', time: '11:44' },
];

function HomeCard() {
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
                <div className="card home-carousel-item-card" aria-hidden="true">
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
                      {MOCK_MATCHES.map((match) => (
                        <div key={match.id} className="home-card-match-item">
                          <span className="home-card-match-date">{match.date}</span>
                          <span className="home-card-match-time">{match.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(index === 0 || index === 1) && (
                    <button className="home-card-play-button">JOGUE AGORA!</button>
                  )}
                  <div className="home-card-body" />
                  {index === 2 && (
                    <footer className="home-card-footer" aria-hidden="true">
                      <button className="home-card-add-friend-button">+ Adicionar amigos</button>
                    </footer>
                  )}
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
